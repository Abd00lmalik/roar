import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getWalletBalance } from "@/lib/payments/wallet";

export async function GET() {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase unavailable" }, { status: 500 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("circle_wallet_id")
    .eq("google_user_id", session.user.id)
    .maybeSingle();

  if (!profile?.circle_wallet_id) {
    return NextResponse.json({ balance: 0 });
  }

  const balance = await getWalletBalance(profile.circle_wallet_id);
  return NextResponse.json({ balance });
}
