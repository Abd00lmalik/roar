import { getAddress } from "viem";
import { circleClient } from "@/lib/circle/client";
import { createClient } from "@/lib/supabase/server";

export async function getOrCreateCircleWallet(userAddress: string): Promise<string> {
  const supabase = createClient();
  if (!supabase) {
    throw new Error("Supabase server client is not configured");
  }

  const normalizedAddress = getAddress(userAddress);

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, circle_wallet_id")
    .eq("wallet_address", normalizedAddress)
    .maybeSingle();

  if (!profile?.id) {
    throw new Error("Profile not found");
  }

  if (profile.circle_wallet_id) {
    return profile.circle_wallet_id;
  }

  const response = await circleClient.createWallets({
    blockchains: ["ETH-SEPOLIA"],
    count: 1,
    walletSetId: process.env.CIRCLE_WALLET_SET_ID ?? "",
    metadata: [{ name: `roarball-user-${profile.id}`, refId: profile.id }],
  });

  const createdWallet = response.data?.wallets?.[0];
  const walletId = createdWallet?.id;

  if (!walletId) {
    throw new Error("Circle wallet creation returned no wallet id");
  }

  await supabase
    .from("profiles")
    .update({
      circle_wallet_id: walletId,
      circle_wallet_address: normalizedAddress,
    })
    .eq("id", profile.id);

  return walletId;
}
