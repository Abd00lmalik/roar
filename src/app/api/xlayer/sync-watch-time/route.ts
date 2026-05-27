import { NextRequest, NextResponse } from "next/server";
import { getXLayerWalletClient, xLayerPublicClient } from "@/lib/xlayer/client";
import { ADDRESSES } from "@/lib/xlayer/addresses";
import { FAN_PASSPORT_ABI } from "@/lib/xlayer/abis";

/**
 * POST /api/xlayer/sync-watch-time
 *
 * Async route to flush accumulated watch time to the FanPassport contract on X Layer.
 * Called by the streaming charge route after successful payments.
 */
export async function POST(req: NextRequest) {
  try {
    const { userAddress, secondsWatched } = await req.json();

    if (!userAddress || !secondsWatched) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!ADDRESSES.FAN_PASSPORT) {
      return NextResponse.json({ error: "FanPassport contract address not configured" }, { status: 500 });
    }

    // 1. Resolve address to tokenId
    const tokenIdRaw = await xLayerPublicClient.readContract({
      address: ADDRESSES.FAN_PASSPORT,
      abi: FAN_PASSPORT_ABI,
      functionName: "addressToTokenId",
      args: [userAddress as `0x${string}`],
    });

    const tokenId = Number(tokenIdRaw);
    if (!tokenId || tokenId <= 0) {
      return NextResponse.json({ error: "User does not have a minted FanPassport NFT" }, { status: 404 });
    }

    // 2. Call updateWatchTime on FanPassport
    const walletClient = getXLayerWalletClient();
    const hash = await walletClient.writeContract({
      address: ADDRESSES.FAN_PASSPORT,
      abi: FAN_PASSPORT_ABI,
      functionName: "updateWatchTime",
      args: [BigInt(tokenId), BigInt(secondsWatched)],
    });

    return NextResponse.json({ success: true, txHash: hash, tokenId });
  } catch (err: any) {
    console.error("[xlayer sync] Failed:", err?.message);
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}
