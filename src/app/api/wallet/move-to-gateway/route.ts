import { NextRequest, NextResponse } from "next/server";
import { getServerSession }          from "next-auth";
import { authOptions }               from "@/lib/auth/authOptions";
import { getCircleClient }           from "@/lib/circle/client";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.circle_wallet_id) {
    return NextResponse.json({ error: "Not authenticated or no Circle wallet" }, { status: 401 });
  }

  const { amount } = await req.json();
  const amountNum  = parseFloat(amount);
  if (!amountNum || amountNum <= 0) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  const client = getCircleClient();

  try {
    // Transfer USDC from user's Circle wallet to platform gateway wallet
    // This is server-side — no user approval needed for Circle-managed wallets
    await client.createTransaction({
      walletId:           session.user.circle_wallet_id,
      destinationAddress: process.env.PLATFORM_GATEWAY_WALLET_ADDRESS!,
      amount:             [amountNum.toString()],
      tokenId:            process.env.CIRCLE_USDC_TOKEN_ID!,
      fee:                { type: "level", config: { feeLevel: "MEDIUM" } },
    });

    // Update gateway balance in database
    const supabase = createSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase client not available" }, { status: 500 });
    }

    // Read current profile balance to update properly
    const { data: profile } = await supabase
      .from("profiles")
      .select("gateway_balance")
      .eq("id", session.user.id)
      .single();

    const currentBal = profile?.gateway_balance ? parseFloat(profile.gateway_balance.toString()) : 0;

    await supabase
      .from("profiles")
      .update({ gateway_balance: currentBal + amountNum })
      .eq("id", session.user.id);

    return NextResponse.json({ success: true, moved: amountNum });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Transfer failed";
    console.error("[move-to-gateway]", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
