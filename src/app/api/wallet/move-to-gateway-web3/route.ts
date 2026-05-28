import { NextRequest, NextResponse } from "next/server";
import { getServerSession }          from "next-auth";
import { authOptions }               from "@/lib/auth/authOptions";
import { xLayerPublicClient }        from "@/lib/xlayer/client";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  const { txHash, amount, walletAddress } = await req.json();
  if (!txHash || !amount) {
    return NextResponse.json({ error: "Missing txHash or amount" }, { status: 400 });
  }

  try {
    // Wait for the transaction receipt on X Layer
    const receipt = await xLayerPublicClient.waitForTransactionReceipt({ hash: txHash as `0x${string}` });
    
    if (receipt.status !== "success") {
      return NextResponse.json({ error: "Transaction failed on-chain" }, { status: 400 });
    }

    // Update gateway balance in database
    const supabase = createSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase client not available" }, { status: 500 });
    }

    const amountNum = parseFloat(amount);

    if (session?.user?.id) {
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
    } else if (walletAddress) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, gateway_balance")
        .eq("wallet_address", walletAddress)
        .maybeSingle();

      if (profile?.id) {
        const currentBal = profile.gateway_balance ? parseFloat(profile.gateway_balance.toString()) : 0;
        await supabase
          .from("profiles")
          .update({ gateway_balance: currentBal + amountNum })
          .eq("id", profile.id);
      }
    }

    return NextResponse.json({ success: true, moved: amountNum });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Verification failed";
    console.error("[move-to-gateway-web3]", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
