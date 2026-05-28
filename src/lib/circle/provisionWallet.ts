// src/lib/circle/provisionWallet.ts
// Mirror Streamarc's wallet creation with idempotency

import { getCircleClient } from "./client";

export async function provisionCircleWallet(userId: string): Promise<{
  walletId:      string;
  walletAddress: string;
}> {
  const apiKey       = process.env.CIRCLE_API_KEY;
  const entitySecret = process.env.CIRCLE_ENTITY_SECRET;

  if (!apiKey || !entitySecret) {
    throw new Error(
      "Circle SDK not configured. Set CIRCLE_API_KEY and CIRCLE_ENTITY_SECRET in Vercel environment variables."
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

  // Resolve WalletSetId (use env if set, otherwise fetch/create one)
  let walletSetId = process.env.CIRCLE_WALLET_SET_ID;
  if (!walletSetId) {
    console.log("[Circle] CIRCLE_WALLET_SET_ID not configured. Attempting to locate/create wallet set...");
    try {
      const walletSets = await client.listWalletSets();
      const existingSet = walletSets.data?.walletSets?.[0];
      if (existingSet?.id) {
        walletSetId = existingSet.id;
        console.log("[Circle] Found existing wallet set:", walletSetId);
      } else {
        console.log("[Circle] No wallet sets found. Creating a new one...");
        const createdSet = await client.createWalletSet({
          name: "RoarTube Dev-Controlled Wallet Set",
        });
        walletSetId = createdSet.data?.walletSet?.id;
        console.log("[Circle] Created new wallet set:", walletSetId);
      }
    } catch (wsErr) {
      console.error("[Circle] Failed to list or create wallet sets:", wsErr);
      throw new Error(`Failed to list or create wallet sets dynamically: ${wsErr instanceof Error ? wsErr.message : wsErr}`);
    }
  }

  if (!walletSetId) {
    throw new Error("[Circle] Wallet set ID could not be resolved.");
  }

  // Create new wallet — use ETH-SEPOLIA not ARC-TESTNET
  const response = await client.createWallets({
    walletSetId,
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
