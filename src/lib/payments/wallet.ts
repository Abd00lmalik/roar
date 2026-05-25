import { circleClient } from "@/lib/circle/client";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function getCircleBaseUrl(): string {
  const env = process.env.CIRCLE_ENVIRONMENT ?? "sandbox";
  return env === "production" ? "https://api.circle.com" : "https://api-sandbox.circle.com";
}

type CircleBalancesResponse = {
  data?: {
    tokenBalances?: Array<{
      token?: { symbol?: string };
      amount?: string;
    }>;
  };
};

export async function provisionUserWallet(userId: string): Promise<{ walletId: string; walletAddress: string }> {
  const supabase = createSupabaseServerClient();
  if (!supabase) {
    throw new Error("Supabase server client is not configured");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, circle_wallet_id, circle_wallet_address")
    .eq("google_user_id", userId)
    .maybeSingle();

  if (!profile?.id) {
    throw new Error("Profile not found for wallet provisioning");
  }

  if (profile.circle_wallet_id && profile.circle_wallet_address) {
    return {
      walletId: profile.circle_wallet_id,
      walletAddress: profile.circle_wallet_address,
    };
  }

  const response = await circleClient.createWallets({
    blockchains: ["ETH-SEPOLIA"],
    count: 1,
    walletSetId: process.env.CIRCLE_WALLET_SET_ID ?? "",
    metadata: [{ name: `roar-user-${profile.id}`, refId: profile.id }],
  });

  const wallet = response.data?.wallets?.[0];
  const walletId = wallet?.id;
  const walletAddress = wallet?.address;

  if (!walletId || !walletAddress) {
    throw new Error("Circle wallet provisioning failed");
  }

  await supabase
    .from("profiles")
    .update({
      circle_wallet_id: walletId,
      circle_wallet_address: walletAddress,
    })
    .eq("id", profile.id);

  return { walletId, walletAddress };
}

export async function getWalletBalance(walletId: string): Promise<number> {
  const apiKey = process.env.CIRCLE_API_KEY;
  if (!apiKey) {
    throw new Error("CIRCLE_API_KEY is not configured");
  }

  const response = await fetch(`${getCircleBaseUrl()}/v1/w3s/wallets/${walletId}/balances`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to load wallet balance (${response.status})`);
  }

  const payload = (await response.json()) as CircleBalancesResponse;
  const usdc = payload.data?.tokenBalances?.find((entry) => entry.token?.symbol === "USDC");
  return Number(usdc?.amount ?? "0");
}

export async function fundWallet(walletId: string, amountUSDC: number): Promise<string> {
  const sourceWalletId = process.env.CIRCLE_FUNDING_WALLET_ID;
  const tokenId = process.env.CIRCLE_USDC_TOKEN_ID;

  if (!sourceWalletId || !tokenId) {
    throw new Error("Funding wallet configuration is missing");
  }

  const tx = await circleClient.createTransaction({
    walletId: sourceWalletId,
    destinationAddress: walletId,
    amount: [amountUSDC.toString()],
    tokenId,
    fee: { type: "level", config: { feeLevel: "MEDIUM" } },
  });

  return tx.data?.id ?? "pending";
}
