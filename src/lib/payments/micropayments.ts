import { circleClient } from "@/lib/circle/client";
import {
  CREATOR_SPLIT_PCT,
  PLATFORM_SPLIT_PCT,
  REWARD_POOL_SPLIT_PCT,
  STREAM_RATE_USDC_PER_SEC,
} from "@/lib/payments/constants";

function toUsdcString(value: number): string {
  return value.toFixed(6);
}

export async function chargeStreamingSecond(params: {
  userWalletId: string;
  creatorWalletAddress: string;
  xLayerPoolAddress: string;
  treasuryAddress: string;
}): Promise<void> {
  const totalUSDC = STREAM_RATE_USDC_PER_SEC;
  const creator = totalUSDC * CREATOR_SPLIT_PCT;
  const pool = totalUSDC * REWARD_POOL_SPLIT_PCT;
  const treasury = totalUSDC * PLATFORM_SPLIT_PCT;
  const tokenId = process.env.CIRCLE_USDC_TOKEN_ID ?? "";

  await circleClient.createTransaction({
    walletId: params.userWalletId,
    destinationAddress: params.creatorWalletAddress,
    amount: [toUsdcString(creator)],
    tokenId,
    fee: { type: "level", config: { feeLevel: "MEDIUM" } },
  });

  await circleClient.createTransaction({
    walletId: params.userWalletId,
    destinationAddress: params.xLayerPoolAddress,
    amount: [toUsdcString(pool)],
    tokenId,
    fee: { type: "level", config: { feeLevel: "MEDIUM" } },
  });

  await circleClient.createTransaction({
    walletId: params.userWalletId,
    destinationAddress: params.treasuryAddress,
    amount: [toUsdcString(treasury)],
    tokenId,
    fee: { type: "level", config: { feeLevel: "MEDIUM" } },
  });
}
