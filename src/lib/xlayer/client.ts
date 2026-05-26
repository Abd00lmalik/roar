/**
 * X Layer viem clients.
 *
 * - xlayerPublicClient  — read-only, safe to use in frontend hooks
 * - getXLayerWalletClient() — write client, SERVER-ONLY (uses PLATFORM_DEPLOYER_PRIVATE_KEY)
 *
 * Never import getXLayerWalletClient() in a "use client" component.
 */

import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { xLayerTestnet } from "@/lib/xlayer/chains";

const RPC_URL =
  process.env.NEXT_PUBLIC_XLAYER_TESTNET_RPC_URL ?? "https://testrpc.xlayer.tech";

// ── Read-only client — used by frontend hooks ─────────────────────────────────
export const xLayerPublicClient = createPublicClient({
  chain: xLayerTestnet,
  transport: http(RPC_URL),
});

// ── Write client — used by backend API routes ONLY ────────────────────────────
/**
 * Returns a wallet client authenticated with the platform deployer key.
 * Only call this from Next.js API routes (server-side).
 *
 * NEVER import this in a "use client" component — it will expose the private key.
 */
export function getXLayerWalletClient() {
  const rawKey = process.env.PLATFORM_DEPLOYER_PRIVATE_KEY ?? process.env.DEPLOYER_PRIVATE_KEY;

  if (!rawKey) {
    throw new Error(
      "[XLayer] PLATFORM_DEPLOYER_PRIVATE_KEY is not set. " +
        "Set it in .env.local for local dev or in Vercel environment variables for production."
    );
  }

  // Ensure 0x prefix
  const privateKey = (rawKey.startsWith("0x") ? rawKey : `0x${rawKey}`) as `0x${string}`;
  const account = privateKeyToAccount(privateKey);

  return createWalletClient({
    account,
    chain: xLayerTestnet,
    transport: http(RPC_URL),
  });
}
