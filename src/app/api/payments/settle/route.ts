import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAddress } from "viem";
import { createClient } from "@/lib/supabase/server";
import { circleClient } from "@/lib/circle/client";
import { getOrCreateCircleWallet } from "@/lib/circle/wallet";

const SettleSchema = z.object({
  userAddress: z.string().regex(/^0x[0-9a-fA-F]{40}$/),
  creatorAddress: z.string().regex(/^0x[0-9a-fA-F]{40}$/),
  videoId: z.string().uuid(),
  totalOwedMicro: z.string().regex(/^\d+$/),
});

const ZERO = BigInt(0);
const BPS_DENOMINATOR = BigInt(10000);
const CREATOR_BPS = BigInt(8500);
const FAN_POOL_BPS = BigInt(1000);

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = SettleSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { userAddress, creatorAddress, videoId, totalOwedMicro } = parsed.data;
  const totalOwed = BigInt(totalOwedMicro);

  if (totalOwed === ZERO) {
    return NextResponse.json({ success: true }, { status: 200 });
  }

  const creatorCut = (totalOwed * CREATOR_BPS) / BPS_DENOMINATOR;
  const fanPoolCut = (totalOwed * FAN_POOL_BPS) / BPS_DENOMINATOR;
  const treasuryCut = totalOwed - creatorCut - fanPoolCut;

  const supabase = createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase unavailable" }, { status: 500 });
  }

  try {
    const normalizedUser = getAddress(userAddress);
    const normalizedCreator = getAddress(creatorAddress);

    const userWalletId = await getOrCreateCircleWallet(normalizedUser);
    const creatorWalletId = await getOrCreateCircleWallet(normalizedCreator);

    const tokenId = process.env.CIRCLE_USDC_TOKEN_ID ?? "";
    const fanPoolWalletId = process.env.CIRCLE_FAN_POOL_WALLET_ID ?? "";
    const treasuryWalletId = process.env.CIRCLE_TREASURY_WALLET_ID ?? "";

    await circleClient.createTransaction({
      walletId: userWalletId,
      destinationAddress: creatorWalletId,
      amount: [(Number(creatorCut) / 1_000_000).toString()],
      tokenId,
      fee: { type: "level", config: { feeLevel: "MEDIUM" } },
    });

    await circleClient.createTransaction({
      walletId: userWalletId,
      destinationAddress: fanPoolWalletId,
      amount: [(Number(fanPoolCut) / 1_000_000).toString()],
      tokenId,
      fee: { type: "level", config: { feeLevel: "MEDIUM" } },
    });

    await circleClient.createTransaction({
      walletId: userWalletId,
      destinationAddress: treasuryWalletId,
      amount: [(Number(treasuryCut) / 1_000_000).toString()],
      tokenId,
      fee: { type: "level", config: { feeLevel: "MEDIUM" } },
    });

    await supabase.from("payment_sessions").insert({
      user_address: normalizedUser,
      creator_address: normalizedCreator,
      video_id: videoId,
      total_owed_micro: totalOwedMicro,
      creator_cut: creatorCut.toString(),
      fan_pool_cut: fanPoolCut.toString(),
      treasury_cut: treasuryCut.toString(),
      status: "settled",
      settled_at: new Date().toISOString(),
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[payments/settle] transfer failed", error);
    return NextResponse.json({ error: "Transfer failed" }, { status: 500 });
  }
}
