import { keccak256, toBytes, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { NextResponse } from "next/server";
import { z } from "zod";
import { PRICE_PER_SECOND_MICRO } from "@/lib/payments/constants";
import { CONTRACT_ADDRESSES, isMockMode } from "@/lib/contracts/addresses";
import { roarVaultAbi } from "@/lib/contracts/abis";
import { xLayerTestnet } from "@/lib/xlayer/chain";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const schema = z.object({
  viewerWallet: z.string().min(3),
  creatorWallet: z.string().min(3),
  videoId: z.string().min(3),
  billableSeconds: z.number().int().min(0),
  freeSecondsUsed: z.number().int().min(0),
  totalSeconds: z.number().int().min(0),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { viewerWallet, creatorWallet, videoId, billableSeconds, freeSecondsUsed, totalSeconds } =
    parsed.data;
  const totalAmountMicro = billableSeconds * PRICE_PER_SECOND_MICRO;
  const amountUsdc = totalAmountMicro / 1_000_000;
  const creatorShare = amountUsdc * 0.85;
  const platformShare = amountUsdc * 0.05;
  const rewardPoolShare = amountUsdc * 0.1;

  let txHash: string | null = null;
  let status: "settled" | "pending_settlement" = "settled";

  try {
    if (!isMockMode && CONTRACT_ADDRESSES.roarVault) {
      const privateKey = (process.env.ADMIN_SETTLER_PRIVATE_KEY ||
        process.env.DEPLOYER_PRIVATE_KEY) as `0x${string}` | undefined;
      if (!privateKey) throw new Error("Missing admin private key");

      const account = privateKeyToAccount(privateKey);
      const wallet = createWalletClient({
        chain: xLayerTestnet,
        transport: http(process.env.NEXT_PUBLIC_XLAYER_TESTNET_RPC_URL),
        account,
      });

      txHash = await wallet.writeContract({
        address: CONTRACT_ADDRESSES.roarVault,
        abi: roarVaultAbi,
        functionName: "settleSession",
        args: [
          viewerWallet as `0x${string}`,
          creatorWallet as `0x${string}`,
          keccak256(toBytes(videoId)),
          BigInt(billableSeconds),
        ],
      });
    }
  } catch {
    status = "pending_settlement";
  }

  const supabase = createSupabaseServerClient();
  if (supabase) {
    await supabase.from("watch_sessions").insert({
      viewer_profile_id: null,
      creator_profile_id: null,
      video_id: videoId,
      total_seconds: totalSeconds,
      free_seconds_used: freeSecondsUsed,
      billable_seconds: billableSeconds,
      amount_usdc: amountUsdc,
      creator_share: creatorShare,
      platform_share: platformShare,
      reward_pool_share: rewardPoolShare,
      tx_hash: txHash,
      status,
    });
  }

  return NextResponse.json({
    status,
    txHash,
    receipt: {
      billableSeconds,
      totalAmountUsdc: amountUsdc,
      creatorShare,
      platformShare,
      rewardPoolShare,
    },
  });
}
