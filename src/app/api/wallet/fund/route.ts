import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthSession } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fundWallet } from "@/lib/payments/wallet";

const Schema = z.object({
  amountUSDC: z.number().positive(),
});

export async function POST(req: NextRequest) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase unavailable" }, { status: 500 });
  }

  const parsed = Schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("circle_wallet_id")
    .eq("google_user_id", session.user.id)
    .maybeSingle();

  if (!profile?.circle_wallet_id) {
    return NextResponse.json({ error: "Wallet not provisioned" }, { status: 400 });
  }

  const txId = await fundWallet(profile.circle_wallet_id, parsed.data.amountUSDC);
  return NextResponse.json({ txId });
}
