import { NextRequest, NextResponse } from "next/server";
import { getWalletBalance } from "@/lib/payments/wallet";

/**
 * GET /api/payments/balance?walletId=<id>
 *
 * Server-side proxy for Circle wallet balance queries.
 * Keeps CIRCLE_API_KEY and CIRCLE_ENTITY_SECRET server-only.
 */
export async function GET(req: NextRequest) {
  const walletId = req.nextUrl.searchParams.get("walletId");

  if (!walletId) {
    return NextResponse.json({ error: "walletId is required" }, { status: 400 });
  }

  try {
    const balance = await getWalletBalance(walletId);
    return NextResponse.json({ balance });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch balance";
    console.error("[/api/payments/balance]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
