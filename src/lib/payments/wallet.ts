/**
 * Circle Developer-Controlled Wallet provisioning for RoarTube.
 *
 * Adapted from Streamarc's circle-wallets.ts. Uses the same
 * @circle-fin/developer-controlled-wallets SDK and env var names.
 *
 * Required environment variables (server-side only):
 *   CIRCLE_API_KEY          — from Circle developer console
 *   CIRCLE_ENTITY_SECRET    — 32-byte hex entity secret
 *   CIRCLE_WALLET_SET_ID    — UUID of the wallet set to create wallets in
 *
 * Optional:
 *   CIRCLE_ENVIRONMENT      — "sandbox" (default) | "production"
 */

import { initiateDeveloperControlledWalletsClient } from "@circle-fin/developer-controlled-wallets";

// ── Blockchain targets ────────────────────────────────────────────────────────
// Primary: ARC Testnet (Circle's native L2 — same as Streamarc)
// Roar also operates on X Layer Testnet for the on-chain vault contract.
// Circle wallets are provisioned on ARC Testnet and used for USDC deposits.
const PRIMARY_BLOCKCHAIN = "ARC-TESTNET" as const;

// ── Client factory (lazy singleton) ──────────────────────────────────────────
function getCircleClient() {
  const apiKey = process.env.CIRCLE_API_KEY;
  const entitySecret = process.env.CIRCLE_ENTITY_SECRET;

  if (!apiKey || !entitySecret) {
    throw new Error(
      "[Circle] CIRCLE_API_KEY and CIRCLE_ENTITY_SECRET must be set. " +
        "Get them from https://console.circle.com/",
    );
  }

  return initiateDeveloperControlledWalletsClient({ apiKey, entitySecret });
}

// ── Types ─────────────────────────────────────────────────────────────────────
export interface CircleWallet {
  walletId: string;
  walletAddress: string;
}

// ── provisionUserWallet ───────────────────────────────────────────────────────
/**
 * Provision a Circle Developer-Controlled Wallet for a RoarTube user.
 *
 * Idempotent — safe to call multiple times for the same userId:
 * if a wallet already exists for this refId it is returned immediately.
 *
 * Called in background after Google sign-in (non-blocking via .catch()).
 */
export async function provisionUserWallet(userId: string): Promise<CircleWallet | null> {
  try {
    const walletSetId = process.env.CIRCLE_WALLET_SET_ID;
    if (!walletSetId) {
      throw new Error("CIRCLE_WALLET_SET_ID is not configured in the server environment.");
    }

    const client = getCircleClient();

    // Check for existing wallet first (idempotency)
    const existing = await client.listWallets({ refId: userId });
    const existingWallet = existing.data?.wallets?.[0];
    if (existingWallet?.id && existingWallet?.address) {
      console.log("[Circle] Existing wallet found:", { walletId: existingWallet.id, userId });
      return { walletId: existingWallet.id, walletAddress: existingWallet.address };
    }

    // Create new wallet
    const response = await client.createWallets({
      walletSetId,
      blockchains: [PRIMARY_BLOCKCHAIN],
      count: 1,
      accountType: "EOA",
      metadata: [{ name: `roartube-${userId.slice(0, 8)}`, refId: userId }],
    });

    const wallet = response.data?.wallets?.[0];
    if (!wallet?.id || !wallet?.address) {
      throw new Error(`Circle API returned response, but wallets list was empty or invalid: ${JSON.stringify(response.data)}`);
    }

    console.log("[Circle] Wallet provisioned:", { walletId: wallet.id, userId });
    return { walletId: wallet.id, walletAddress: wallet.address };
  } catch (err: any) {
    const apiError = err?.response?.data ? JSON.stringify(err.response.data) : "";
    const message = err instanceof Error ? err.message : String(err);
    console.error("[Circle] provisionUserWallet failed:", message, apiError);
    throw new Error(`${message} ${apiError}`);
  }
}

// ── getWalletBalance ──────────────────────────────────────────────────────────
/**
 * Fetch the current USDC balance for a Circle walletId.
 * Returns 0 on any error (fail-safe for UI display).
 */
export async function getWalletBalance(walletId: string): Promise<number> {
  try {
    const client = getCircleClient();
    const balances = await client.getWalletTokenBalance({ id: walletId });
    const usdc = balances.data?.tokenBalances?.find(
      (b: { token?: { symbol?: string }; amount?: string }) => b.token?.symbol === "USDC",
    );
    return parseFloat(usdc?.amount ?? "0");
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[Circle] getWalletBalance failed:", message);
    return 0;
  }
}

// ── getWalletIdByAddress ──────────────────────────────────────────────────────
/**
 * Resolve a Circle walletId from a wallet address.
 * Used when only the on-chain address is stored (e.g., from profiles table).
 */
export async function getWalletIdByAddress(address: string): Promise<string | null> {
  try {
    const client = getCircleClient();
    const res = await client.listWallets({ address });
    return res.data?.wallets?.[0]?.id ?? null;
  } catch {
    return null;
  }
}

// ── getCircleDepositAddress ───────────────────────────────────────────────────
/**
 * Return the deposit address for a Circle walletId.
 * Users send USDC to this address to fund their RoarTube wallet.
 */
export async function getCircleDepositAddress(
  walletId: string,
): Promise<{ address: string; blockchain: string } | null> {
  try {
    const client = getCircleClient();
    const res = await client.getWallet({ id: walletId });
    const wallet = res.data?.wallet;
    if (!wallet?.address) return null;
    return {
      address: wallet.address,
      blockchain: PRIMARY_BLOCKCHAIN,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[Circle] getCircleDepositAddress failed:", message);
    return null;
  }
}

