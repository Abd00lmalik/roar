// src/lib/circle/provisionWallet.ts
// Mirror Streamarc's wallet creation with idempotency

import { getCircleClient } from "./client";

export async function provisionCircleWallet(userId: string): Promise<{
  walletId:      string;
  walletAddress: string;
}> {
  const apiKey       = process.env.CIRCLE_API_KEY;
  const entitySecret = process.env.CIRCLE_ENTITY_SECRET;
  const walletSetId  = process.env.CIRCLE_WALLET_SET_ID;

  if (!apiKey || !entitySecret || !walletSetId) {
    throw new Error(
      "Circle SDK not configured. Set CIRCLE_API_KEY, CIRCLE_ENTITY_SECRET, CIRCLE_WALLET_SET_ID in Vercel environment variables."
    );
  }

  const client = getCircleClient();

  // IDEMPOTENCY CHECK — mirror Streamarc exactly
  const existing = await client.listWallets({ refId: userId });
  const existingWallet = existing.data?.wallets?.[0];

  if (existingWallet?.id && existingWallet?.address) {
    return {
      walletId:      existingWallet.id,
      walletAddress: existingWallet.address,
    };
  }

  // Create new wallet — use ETH-SEPOLIA not ARC-TESTNET
  const response = await client.createWallets({
    walletSetId:  process.env.CIRCLE_WALLET_SET_ID!,
    blockchains:  ["ETH-SEPOLIA"],
    count:        1,
    accountType:  "EOA",
    metadata:     [{ name: `roartube-${userId}`, refId: userId }],
  });

  const wallet = response.data?.wallets?.[0];
  if (!wallet?.id || !wallet?.address) {
    throw new Error("[Circle] Wallet creation returned empty response");
  }

  return {
    walletId:      wallet.id,
    walletAddress: wallet.address,
  };
}
