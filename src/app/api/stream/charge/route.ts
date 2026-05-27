import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { xLayerPublicClient, getXLayerWalletClient } from "@/lib/xlayer/client";
import { ADDRESSES, contractsConfigured } from "@/lib/xlayer/addresses";
import { BILLING_CONTROLLER_ABI, FAN_PASSPORT_ABI } from "@/lib/xlayer/abis";
import { initiateDeveloperControlledWalletsClient } from "@circle-fin/developer-controlled-wallets";
import { COST_PER_SECOND_USDC, SPLIT } from "@/lib/payments/micropayments";
import { getCircleDepositAddress } from "@/lib/payments/wallet";
import crypto from "crypto";

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
    const body = await req.json().catch(() => ({})) as {
      matchId?: string;
      creatorWalletId?: string;
      seconds?: number;
      walletAddress?: string;
    };

    const session = await getServerSession(authOptions);
    let userId = session?.user?.id;
    let circleWalletId = session?.user?.circleWalletId;

    const supabase = createSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase client not available" }, { status: 500 });
    }

    if (!userId && body.walletAddress) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, circle_wallet_id")
        .eq("wallet_address", body.walletAddress)
        .maybeSingle();
      if (profile) {
        userId = profile.id;
        circleWalletId = profile.circle_wallet_id;
      }
    }

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
          return NextResponse.json({ success: true, locked: true, varLocked: true, remainingBalance: null });
        }
      } catch {
        // Non-fatal — proceed with charge if lock check fails
      }
    }

    // ── 3. Profile & Free Tier checks ────────────────────────────────────────
    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("cumulative_free_seconds_used, circle_wallet_id, wallet_address")
      .eq("id", userId)
      .maybeSingle();

    if (profileErr || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const freeUsed = profile.cumulative_free_seconds_used ?? 0;
    let billableSeconds = seconds;
    let freeSecondsCharged = 0;

    if (freeUsed < 120) {
      const remainingFree = 120 - freeUsed;
      freeSecondsCharged = Math.min(seconds, remainingFree);
      billableSeconds = seconds - freeSecondsCharged;

      // Update free seconds in database
      const { error: updateProfileErr } = await supabase
        .from("profiles")
        .update({ cumulative_free_seconds_used: freeUsed + freeSecondsCharged })
        .eq("id", userId);

      if (updateProfileErr) {
        console.error("[stream/charge] Failed to update free seconds:", updateProfileErr.message);
      }
    }

    let remainingBalance: number | null = null;

    if (billableSeconds > 0) {
      const activeWalletId = circleWalletId ?? profile.circle_wallet_id;
      if (!activeWalletId) {
        return NextResponse.json({ error: "Circle wallet not provisioned" }, { status: 400 });
      }

      // Check balance first
      const client = getCircleClient();
      const balanceRes = await client.getWalletTokenBalance({ id: activeWalletId });
      const usdc = balanceRes.data?.tokenBalances?.find(
        (b: { token?: { symbol?: string }; amount?: string }) => b.token?.symbol === "USDC"
      );
      const balance = parseFloat(usdc?.amount ?? "0");
      const totalUsdc = billableSeconds * COST_PER_SECOND_USDC;

      if (balance < totalUsdc) {
        return NextResponse.json({ success: false, locked: false, insufficientFunds: true, remainingBalance: balance });
      }

      // Determine split amounts
      const creatorAmount = totalUsdc * SPLIT.CREATOR;
      const fanPoolAmount = totalUsdc * SPLIT.FAN_POOL;
      const treasuryAmount = totalUsdc * SPLIT.TREASURY;

      // Retrieve Creator's EVM wallet address
      let creatorAddress: string | null = null;
      if (body.creatorWalletId) {
        const { data: creatorProfile } = await supabase
          .from("profiles")
          .select("wallet_address")
          .eq("circle_wallet_id", body.creatorWalletId)
          .maybeSingle();
        creatorAddress = creatorProfile?.wallet_address ?? null;
      }

      // Retrieve platform split wallet addresses
      let fanPoolAddress = process.env.NEXT_PUBLIC_FAN_REWARDS_POOL_ADDRESS ?? ADDRESSES.FAN_REWARDS_POOL;
      if (process.env.PLATFORM_POOL_WALLET) {
        const poolAddrInfo = await getCircleDepositAddress(process.env.PLATFORM_POOL_WALLET);
        if (poolAddrInfo?.address) {
          fanPoolAddress = poolAddrInfo.address;
        }
      }

      let treasuryAddress = process.env.TREASURY_ADDRESS ?? "0xfa53779d7cb905489d84f1ab2da309624427cafa";
      if (process.env.PLATFORM_TREASURY_WALLET) {
        const treasuryAddrInfo = await getCircleDepositAddress(process.env.PLATFORM_TREASURY_WALLET);
        if (treasuryAddrInfo?.address) {
          treasuryAddress = treasuryAddrInfo.address;
        }
      }

      const usdcTokenAddress = process.env.NEXT_PUBLIC_USDC_ADDRESS ?? "0x3600000000000000000000000000000000000000";

      // Execute transfers
      // Creator (85%)
      if (creatorAddress && creatorAmount > 0) {
        await client.createTransaction({
          walletId: activeWalletId,
          tokenAddress: usdcTokenAddress,
          destinationAddress: creatorAddress,
          amount: [creatorAmount.toFixed(6)],
          fee: { type: "level", config: { feeLevel: "MEDIUM" } },
          idempotencyKey: crypto.randomUUID(),
        });
      }

      // Fan Pool (10%)
      if (fanPoolAddress && fanPoolAmount > 0) {
        await client.createTransaction({
          walletId: activeWalletId,
          tokenAddress: usdcTokenAddress,
          destinationAddress: fanPoolAddress,
          amount: [fanPoolAmount.toFixed(6)],
          fee: { type: "level", config: { feeLevel: "MEDIUM" } },
          idempotencyKey: crypto.randomUUID(),
        });
      }

      // Treasury (5%)
      if (treasuryAddress && treasuryAmount > 0) {
        await client.createTransaction({
          walletId: activeWalletId,
          tokenAddress: usdcTokenAddress,
          destinationAddress: treasuryAddress,
          amount: [treasuryAmount.toFixed(6)],
          fee: { type: "level", config: { feeLevel: "MEDIUM" } },
          idempotencyKey: crypto.randomUUID(),
        });
      }

      // Record charge in Supabase streaming_charges table
      await supabase.from("streaming_charges").insert({
        wallet_id: activeWalletId,
        creator_address: creatorAddress,
        fan_pool_address: fanPoolAddress,
        treasury_address: treasuryAddress,
        amount_usdc: totalUsdc,
        seconds_covered: billableSeconds,
        creator_amount: creatorAmount,
        fan_pool_amount: fanPoolAmount,
        treasury_amount: treasuryAmount,
        settled: true,
        created_at: new Date().toISOString(),
      }).then(({ error }) => {
        if (error) console.warn("[stream/charge] insert warning:", error.message);
      });

      // Query balance again after transfer to ensure precision
      const updatedBalanceRes = await client.getWalletTokenBalance({ id: activeWalletId });
      const updatedUsdc = updatedBalanceRes.data?.tokenBalances?.find(
        (b: { token?: { symbol?: string }; amount?: string }) => b.token?.symbol === "USDC"
      );
      remainingBalance = parseFloat(updatedUsdc?.amount ?? "0");
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
      const { data: latestProfile } = await supabase
        .from("profiles")
        .select("wallet_address, passport_token_id")
        .eq("id", userId)
        .maybeSingle();
      onChainAddress = latestProfile?.wallet_address as `0x${string}` | null;

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
