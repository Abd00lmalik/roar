import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/payments/fund
 *
 * Initiates a USDC deposit to a user's Circle Developer-Controlled wallet.
 *
 * NOTE: In a production Circle setup, USDC deposits are initiated by the
 * user via Circle's payment gateway (not by the server). This endpoint
 * records the funding intent and returns Circle's deposit address so the
 * user can send USDC from an external source.
 *
 * For testnet: use Circle's testnet faucet at https://faucet.circle.com
 * to send USDC directly to the wallet address.
 *
 * Body:
 *   wallet_id    — Circle wallet ID to fund
 *   amount_usdc  — intended deposit amount (informational)
 */
export async function POST(req: NextRequest) {
  try {
    const { wallet_id, amount_usdc } = (await req.json()) as {
      wallet_id?: string;
      amount_usdc?: number;
    };

    if (!wallet_id) {
      return NextResponse.json({ error: "wallet_id is required" }, { status: 400 });
    }

    if (!amount_usdc || amount_usdc <= 0) {
      return NextResponse.json({ error: "amount_usdc must be positive" }, { status: 400 });
    }

    // Fetch the deposit address from Circle
    const { getCircleDepositAddress } = await import("@/lib/payments/wallet");
    const depositInfo = await getCircleDepositAddress(wallet_id);

    if (!depositInfo) {
      return NextResponse.json(
        { error: "Could not retrieve deposit address. Is CIRCLE_API_KEY configured?" },
        { status: 502 },
      );
    }

    return NextResponse.json({
      ok: true,
      deposit_address: depositInfo.address,
      blockchain: depositInfo.blockchain,
      amount_requested: amount_usdc,
      message: `Send ${amount_usdc} USDC to ${depositInfo.address} on ${depositInfo.blockchain}`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Fund request failed";
    console.error("[/api/payments/fund]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
