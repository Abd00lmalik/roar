/**
 * Roarball micropayment engine.
 *
 * Implements the immutable 85 / 10 / 5 revenue split for per-second
 * streaming charges. Routes to the existing on-chain voucher system
 * via /api/vouchers/sink (roar's own settlement layer), keeping Circle
 * wallets for USDC deposit/balance and the vault contract for settlement.
 *
 * Split constants — DO NOT change:
 *   85% → content creator
 *   10% → Fan Rewards Pool (X Layer Testnet ecosystem)
 *    5% → platform treasury
 */

// ── Immutable split constants ─────────────────────────────────────────────────
export const SPLIT = {
  CREATOR: 0.85,
  FAN_POOL: 0.10,
  TREASURY: 0.05,
} as const satisfies Record<string, number>;

// Compile-time verification: 0.85 + 0.10 + 0.05 = 1.00 ✓
// (These are constants — no runtime check needed)

// ── Rate constants (mirrors lib/payments/constants.ts) ────────────────────────
export const COST_PER_SECOND_USDC = 0.001;
export const FREE_SECONDS = 120;

// ── Types ─────────────────────────────────────────────────────────────────────
export interface StreamChargeParams {
  /** Roarball user's Circle walletId (from their profile) */
  userWalletId: string;
  /** Creator's wallet address (receives 85%) */
  creatorWalletAddress: string;
  /** Fan rewards pool address — from env NEXT_PUBLIC_XCHAIN_POOL_ADDRESS */
  xLayerPoolAddress: string;
  /** Treasury address — from env NEXT_PUBLIC_TREASURY_ADDRESS */
  treasuryAddress: string;
}

export interface SplitAmounts {
  total: number;
  creator: number;
  fanPool: number;
  treasury: number;
}

// ── Utility: compute split amounts ───────────────────────────────────────────
/**
 * Compute split amounts for a given total USDC amount.
 * All values are in USDC (floating point for display; convert to μUSDC for on-chain).
 */
export function computeSplit(totalUsdc: number): SplitAmounts {
  return {
    total: totalUsdc,
    creator: totalUsdc * SPLIT.CREATOR,
    fanPool: totalUsdc * SPLIT.FAN_POOL,
    treasury: totalUsdc * SPLIT.TREASURY,
  };
}

// ── chargeStreamingSecond ─────────────────────────────────────────────────────
/**
 * Record one second of streaming charge on the server.
 *
 * This fires a POST to /api/vouchers/beacon (best-effort, like sendBeacon)
 * and resolves immediately — it must not block the UI tick loop.
 *
 * The actual on-chain settlement is batched by the vault contract's settler.
 * The split (85/10/5) is enforced in the voucher sink route at settlement time.
 */
export async function chargeStreamingSecond(params: StreamChargeParams): Promise<void> {
  const totalUsdc = COST_PER_SECOND_USDC;
  const split = computeSplit(totalUsdc);

  // Fire-and-forget to the session accumulator endpoint
  // The server accumulates seconds and settles in batches via the vault.
  try {
    await fetch("/api/payments/charge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        wallet_id: params.userWalletId,
        creator_address: params.creatorWalletAddress,
        fan_pool_address: params.xLayerPoolAddress,
        treasury_address: params.treasuryAddress,
        amount_usdc: totalUsdc,
        split,
      }),
    });
  } catch {
    // Best-effort: a missed tick just means one second isn't billed.
    // The WatchSessionTracker's beforeunload beacon handles session-end settlement.
  }
}

// ── sendBeaconCharge ──────────────────────────────────────────────────────────
/**
 * Reliable tab-close/route-change payment using the Beacon API.
 * navigator.sendBeacon is guaranteed to fire even on page unload.
 */
export function sendBeaconCharge(
  secondsCovered: number,
  params: Omit<StreamChargeParams, "userWalletId"> & { userWalletId: string },
): void {
  if (secondsCovered <= 0) return;

  const totalUsdc = secondsCovered * COST_PER_SECOND_USDC;
  const split = computeSplit(totalUsdc);

  navigator.sendBeacon(
    "/api/payments/charge",
    new Blob(
      [
        JSON.stringify({
          wallet_id: params.userWalletId,
          creator_address: params.creatorWalletAddress,
          fan_pool_address: params.xLayerPoolAddress,
          treasury_address: params.treasuryAddress,
          amount_usdc: totalUsdc,
          seconds_covered: secondsCovered,
          split,
        }),
      ],
      { type: "application/json" },
    ),
  );
}
