import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthSession } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { chargeStreamingSecond } from "@/lib/payments/micropayments";

const Schema = z.object({
  creatorWalletAddress: z.string().min(3),
});

export async function POST(req: NextRequest) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = Schema.safeParse(await req.json().catch(() => null));
  if (!payload.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
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
    return NextResponse.json({ error: "Wallet not provisioned" }, { status: 400 });
  }

  const pool = process.env.XCHAIN_FAN_POOL_ADDRESS;
  const treasury = process.env.PLATFORM_TREASURY_ADDRESS;

  if (!pool || !treasury) {
    return NextResponse.json({ error: "Treasury configuration missing" }, { status: 500 });
  }

  await chargeStreamingSecond({
    userWalletId: profile.circle_wallet_id,
    creatorWalletAddress: payload.data.creatorWalletAddress,
    xLayerPoolAddress: pool,
    treasuryAddress: treasury,
  });

  return NextResponse.json({ ok: true });
}
