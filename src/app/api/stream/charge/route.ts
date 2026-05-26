import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { xLayerPublicClient, getXLayerWalletClient } from "@/lib/xlayer/client";
import { ADDRESSES, contractsConfigured } from "@/lib/xlayer/addresses";
import { BILLING_CONTROLLER_ABI, FAN_PASSPORT_ABI } from "@/lib/xlayer/abis";
import { initiateDeveloperControlledWalletsClient } from "@circle-fin/developer-controlled-wallets";
import { COST_PER_SECOND_USDC, SPLIT } from "@/lib/payments/micropayments";

/**
 * POST /api/stream/charge
 *
 * Called every second by the client billing loop during paid streaming.
 *
 * Flow:
 * 1. Verify session
 * 2. Check BillingController.isLocked(matchId) on X Layer — return { locked: true } if so
 * 3. Verify user has sufficient Circle wallet balance
 * 4. Record charge in Supabase streaming_charges (tracking 85/10/5 split)
 * 5. Every 60 seconds: batch-flush watch-time to FanPassport.updateWatchTime() on X Layer
 * 6. Return { success, remainingBalance, locked }
 *
 * Body:
 *   matchId         — string identifier for the current match (slugified)
 *   creatorWalletId — Circle wallet ID of the creator (for split tracking)
 *   seconds         — number of seconds to charge (default 1)
 */

// In-memory flush tracker per user (resets on server restart — acceptable for batch)
const watchTimeAccumulator = new Map<string, { seconds: number; lastFlush: number }>();

function getCircleClient() {
  const apiKey = process.env.CIRCLE_API_KEY;
  const entitySecret = process.env.CIRCLE_ENTITY_SECRET;
  if (!apiKey || !entitySecret) {
    throw new Error("[Circle] CIRCLE_API_KEY and CIRCLE_ENTITY_SECRET must be set.");
  }
  return initiateDeveloperControlledWalletsClient({ apiKey, entitySecret });
}

export async function POST(req: NextRequest) {
  try {
    // ── 1. Auth ──────────────────────────────────────────────────────────────
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json().catch(() => ({})) as {
      matchId?: string;
      creatorWalletId?: string;
      seconds?: number;
    };

    const matchSlug = body.matchId ?? "default-match";
    const seconds = Math.max(1, Math.min(body.seconds ?? 1, 60)); // clamp 1–60

    // ── 2. VAR Lock check ────────────────────────────────────────────────────
    if (contractsConfigured() && ADDRESSES.BILLING_CONTROLLER) {
      try {
        const matchIdBytes32 = `0x${Buffer.from(matchSlug).toString("hex").padEnd(64, "0")}` as `0x${string}`;
        const locked = await xLayerPublicClient.readContract({
          address: ADDRESSES.BILLING_CONTROLLER,
          abi: BILLING_CONTROLLER_ABI,
          functionName: "isLocked",
          args: [matchIdBytes32],
        });
        if (locked) {
          return NextResponse.json({ success: true, locked: true, remainingBalance: null });
        }
      } catch {
        // Non-fatal — proceed with charge if lock check fails
      }
    }

    // ── 3. Balance check + charge tracking ───────────────────────────────────
    const supabase = createSupabaseServerClient();
    const circleWalletId = session.user.circleWalletId;

    let remainingBalance: number | null = null;

    if (circleWalletId) {
      try {
        const client = getCircleClient();
        const balanceRes = await client.getWalletTokenBalance({ id: circleWalletId });
        const usdc = balanceRes.data?.tokenBalances?.find(
          (b: { token?: { symbol?: string }; amount?: string }) => b.token?.symbol === "USDC"
        );
        const balance = parseFloat(usdc?.amount ?? "0");
        const chargeAmount = seconds * COST_PER_SECOND_USDC;

        if (balance < chargeAmount) {
          return NextResponse.json({ success: false, locked: false, remainingBalance: balance });
        }
        remainingBalance = balance - chargeAmount;
      } catch (circleErr) {
        console.error("[stream/charge] Circle balance check failed:", circleErr);
        // Allow charge to proceed — fail-open for UX
      }
    }

    // ── 4. Record charge in Supabase ─────────────────────────────────────────
    const totalUsdc = seconds * COST_PER_SECOND_USDC;
    if (supabase) {
      await supabase.from("streaming_charges").insert({
        wallet_id: circleWalletId ?? null,
        creator_address: body.creatorWalletId ?? null,
        fan_pool_address: process.env.FAN_REWARDS_ADDRESS ?? null,
        treasury_address: process.env.TREASURY_ADDRESS ?? null,
        amount_usdc: totalUsdc,
        seconds_covered: seconds,
        creator_amount: totalUsdc * SPLIT.CREATOR,
        fan_pool_amount: totalUsdc * SPLIT.FAN_POOL,
        treasury_amount: totalUsdc * SPLIT.TREASURY,
        settled: false,
        created_at: new Date().toISOString(),
      }).then(({ error }) => {
        if (error) console.warn("[stream/charge] insert warning:", error.message);
      });
    }

    // ── 5. Watch-time batch flush to X Layer ─────────────────────────────────
    // Accumulate seconds in memory and flush every 60 seconds to avoid
    // per-second on-chain transactions.
    const now = Date.now();
    const tracker = watchTimeAccumulator.get(userId) ?? { seconds: 0, lastFlush: now };
    tracker.seconds += seconds;

    const FLUSH_INTERVAL_MS = 60_000;
    const shouldFlush =
      tracker.seconds >= 60 || now - tracker.lastFlush >= FLUSH_INTERVAL_MS;

    if (shouldFlush && contractsConfigured() && ADDRESSES.FAN_PASSPORT) {
      // Get user's on-chain address from profile
      let onChainAddress: `0x${string}` | null = null;
      if (supabase) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("wallet_address, passport_token_id")
          .eq("id", userId)
          .maybeSingle();
        onChainAddress = profile?.wallet_address as `0x${string}` | null;

        if (onChainAddress) {
          try {
            const tokenIdRaw = await xLayerPublicClient.readContract({
              address: ADDRESSES.FAN_PASSPORT,
              abi: FAN_PASSPORT_ABI,
              functionName: "addressToTokenId",
              args: [onChainAddress],
            });
            const tokenId = Number(tokenIdRaw);
            if (tokenId > 0) {
              const walletClient = getXLayerWalletClient();
              await walletClient.writeContract({
                address: ADDRESSES.FAN_PASSPORT,
                abi: FAN_PASSPORT_ABI,
                functionName: "updateWatchTime",
                args: [BigInt(tokenId), BigInt(tracker.seconds)],
              });
              console.log(`[stream/charge] Watch-time flushed: +${tracker.seconds}s for tokenId=${tokenId}`);
            }
          } catch (flushErr) {
            console.error("[stream/charge] Watch-time flush failed (non-fatal):", flushErr);
          }
        }
      }

      tracker.seconds = 0;
      tracker.lastFlush = now;
    }

    watchTimeAccumulator.set(userId, tracker);

    return NextResponse.json({
      success: true,
      locked: false,
      remainingBalance,
      secondsCharged: seconds,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Charge failed";
    console.error("[/api/stream/charge]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
