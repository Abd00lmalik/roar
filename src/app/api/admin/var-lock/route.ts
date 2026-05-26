import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { getXLayerWalletClient, xLayerPublicClient } from "@/lib/xlayer/client";
import { ADDRESSES, contractsConfigured } from "@/lib/xlayer/addresses";
import { BILLING_CONTROLLER_ABI } from "@/lib/xlayer/abis";

/**
 * POST /api/admin/var-lock
 *
 * Admin-only. Locks or unlocks billing for a match via BillingController.
 * Frontend useVARLock hook listens to the emitted events in real time.
 *
 * Body:
 *   matchId  — string slug, e.g. "bra-vs-arg-group-c"
 *   action   — "lock" | "unlock"
 *   reason   — optional reason string (for lock action)
 */
export async function POST(req: NextRequest) {
  try {
    // Auth check — require session (add admin role check in production)
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!contractsConfigured()) {
      return NextResponse.json(
        { error: "X Layer contracts not configured. Set NEXT_PUBLIC_BILLING_CONTROLLER_ADDRESS." },
        { status: 503 }
      );
    }

    const body = await req.json() as {
      matchId?: string;
      action?: "lock" | "unlock";
      reason?: string;
    };

    const { matchId, action, reason = "VAR Review" } = body;

    if (!matchId || !action) {
      return NextResponse.json(
        { error: "matchId and action (lock|unlock) are required" },
        { status: 400 }
      );
    }

    // Encode matchId as bytes32 (same encoding as BillingController.encodeMatchId)
    const matchIdBytes32 = `0x${Buffer.from(matchId).toString("hex").padEnd(64, "0")}` as `0x${string}`;

    const walletClient = getXLayerWalletClient();

    let hash: `0x${string}`;
    if (action === "lock") {
      hash = await walletClient.writeContract({
        address: ADDRESSES.BILLING_CONTROLLER,
        abi: BILLING_CONTROLLER_ABI,
        functionName: "lockBilling",
        args: [matchIdBytes32, reason],
      });
    } else {
      hash = await walletClient.writeContract({
        address: ADDRESSES.BILLING_CONTROLLER,
        abi: BILLING_CONTROLLER_ABI,
        functionName: "unlockBilling",
        args: [matchIdBytes32],
      });
    }

    // Wait for confirmation
    await xLayerPublicClient.waitForTransactionReceipt({ hash });

    // Verify new state
    const isLocked = await xLayerPublicClient.readContract({
      address: ADDRESSES.BILLING_CONTROLLER,
      abi: BILLING_CONTROLLER_ABI,
      functionName: "isLocked",
      args: [matchIdBytes32],
    });

    return NextResponse.json({
      ok: true,
      action,
      matchId,
      matchIdBytes32,
      isLocked,
      txHash: hash,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "VAR lock action failed";
    console.error("[/api/admin/var-lock]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
