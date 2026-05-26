import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getXLayerWalletClient, xLayerPublicClient } from "@/lib/xlayer/client";
import { ADDRESSES, contractsConfigured } from "@/lib/xlayer/addresses";
import { WATCH_LEADERBOARD_ABI, FAN_REWARDS_POOL_ABI } from "@/lib/xlayer/abis";

/**
 * POST /api/admin/settle-week
 *
 * Admin-only. Run at the end of each match week.
 *
 * Flow:
 * 1. Pull top 10 fans per country from Supabase streaming_charges
 * 2. For each country: submitWeeklyBoard() → WatchLeaderboard on X Layer
 * 3. For each country: distribute() → FanRewardsPool on X Layer (pays USDC on-chain)
 * 4. advanceWeek() → WatchLeaderboard
 *
 * Body:
 *   weekId          — numeric week ID to settle
 *   totalPoolUSDC   — total USDC in the fan rewards pool (in USDC, not wei)
 *                     used to calculate per-country allocation
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!contractsConfigured()) {
      return NextResponse.json(
        { error: "X Layer contracts not configured." },
        { status: 503 }
      );
    }

    const body = await req.json() as {
      weekId?: number;
      totalPoolUSDC?: number;
    };
    const { weekId, totalPoolUSDC = 0 } = body;

    if (weekId === undefined || weekId === null) {
      return NextResponse.json({ error: "weekId is required" }, { status: 400 });
    }

    const supabase = createSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    // ── 1. Pull top 10 fans per country from DB ───────────────────────────────
    // Query streaming_charges aggregated by fan wallet and country
    const { data: charges, error: dbErr } = await supabase
      .from("streaming_charges")
      .select("wallet_id, fan_pool_amount, seconds_covered, creator_address")
      .eq("settled", false)
      .limit(10000);

    if (dbErr) {
      return NextResponse.json({ error: dbErr.message }, { status: 500 });
    }

    // Pull fan profiles to get country codes and wallet addresses
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, wallet_address, country_code, circle_wallet_id")
      .not("wallet_address", "is", null);

    if (!profiles || profiles.length === 0) {
      return NextResponse.json({ ok: true, message: "No profiles with wallets found", settled: [] });
    }

    // Build per-country top-10 from charges joined with profiles
    const walletToProfile = new Map(profiles.map((p) => [p.circle_wallet_id, p]));
    const countryWatchMap = new Map<string, Map<string, { wallet: string; seconds: number }>>();

    for (const charge of charges ?? []) {
      const profile = walletToProfile.get(charge.wallet_id);
      if (!profile?.country_code || !profile?.wallet_address) continue;

      const country = profile.country_code;
      if (!countryWatchMap.has(country)) countryWatchMap.set(country, new Map());

      const countryMap = countryWatchMap.get(country)!;
      const existing = countryMap.get(profile.wallet_address) ?? { wallet: profile.wallet_address, seconds: 0 };
      existing.seconds += charge.seconds_covered ?? 1;
      countryMap.set(profile.wallet_address, existing);
    }

    const walletClient = getXLayerWalletClient();
    const results: Array<{ country: string; fans: number; allocationUSDC: number; txHash: string }> = [];
    const totalFanCount = profiles.length;

    // ── 2 + 3. Per-country: submit leaderboard + distribute pool ─────────────
    for (const [countryCode, fanMap] of countryWatchMap.entries()) {
      // Sort top 10 by watch seconds descending
      const top10 = [...fanMap.values()]
        .sort((a, b) => b.seconds - a.seconds)
        .slice(0, 10);

      if (top10.length === 0) continue;

      const wallets = top10.map((f) => f.wallet as `0x${string}`);
      const watchSeconds = top10.map((f) => BigInt(f.seconds));

      // Submit leaderboard
      const lbHash = await walletClient.writeContract({
        address: ADDRESSES.WATCH_LEADERBOARD,
        abi: WATCH_LEADERBOARD_ABI,
        functionName: "submitWeeklyBoard",
        args: [BigInt(weekId), countryCode, wallets, watchSeconds],
      });
      await xLayerPublicClient.waitForTransactionReceipt({ hash: lbHash });

      // Calculate this country's pool allocation (proportional to fan count)
      const countryFanCount = fanMap.size;
      const countryAllocation = totalFanCount > 0
        ? Math.floor((countryFanCount / totalFanCount) * totalPoolUSDC * 1_000_000) // to 6-decimal USDC
        : 0;

      let distHash = lbHash; // default if no allocation
      if (countryAllocation > 0) {
        // Distribute USDC to top fans on-chain
        distHash = await walletClient.writeContract({
          address: ADDRESSES.FAN_REWARDS_POOL,
          abi: FAN_REWARDS_POOL_ABI,
          functionName: "distribute",
          args: [BigInt(weekId), countryCode, BigInt(countryAllocation)],
        });
        await xLayerPublicClient.waitForTransactionReceipt({ hash: distHash });
      }

      results.push({
        country: countryCode,
        fans: top10.length,
        allocationUSDC: countryAllocation / 1_000_000,
        txHash: distHash,
      });

      console.log(`[settle-week] Settled ${countryCode}: ${top10.length} fans, ${countryAllocation / 1_000_000} USDC`);
    }

    // ── 4. Advance week ───────────────────────────────────────────────────────
    const advanceHash = await walletClient.writeContract({
      address: ADDRESSES.WATCH_LEADERBOARD,
      abi: WATCH_LEADERBOARD_ABI,
      functionName: "advanceWeek",
      args: [],
    });
    await xLayerPublicClient.waitForTransactionReceipt({ hash: advanceHash });

    // Mark charges as settled in DB
    if (supabase) {
      await supabase
        .from("streaming_charges")
        .update({ settled: true })
        .eq("settled", false);
    }

    return NextResponse.json({
      ok: true,
      weekId,
      settled: results,
      totalCountries: results.length,
      advanceWeekTxHash: advanceHash,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Settlement failed";
    console.error("[/api/admin/settle-week]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
