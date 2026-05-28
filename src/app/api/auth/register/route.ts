import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { provisionCircleWallet } from "@/lib/circle/provisionWallet";

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  displayName: z.string().min(2).max(64).optional(),
  supporterNation: z.string().min(2).max(8).optional(),
});

export async function POST(req: NextRequest) {
  const payload = await req.json().catch(() => null);
  const parsed = RegisterSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid registration payload" }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase server client not configured" }, { status: 500 });
  }

  const email = parsed.data.email.toLowerCase().trim();
  const password = parsed.data.password;
  const displayName = parsed.data.displayName?.trim() || email.split("@")[0];
  const supporterNation = parsed.data.supporterNation ?? "US";
  const handleSeed = email.split("@")[0].replace(/[^a-z0-9]/gi, "").toLowerCase() || "fan";
  const handle = `${handleSeed.slice(0, 16)}${Math.random().toString(36).slice(2, 6)}`;

  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name: displayName },
  });

  if (createError || !created.user) {
    const message = createError?.message ?? "Could not create user";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const userId = created.user.id;
  let circleWalletId: string | null = null;
  let circleWalletAddress: string | null = null;

  try {
    const wallet = await provisionCircleWallet(userId);
    circleWalletId = wallet.walletId;
    circleWalletAddress = wallet.walletAddress;
  } catch {
    // Non-blocking: user can still sign in and retry provisioning via /api/auth/provision.
  }

  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: userId,
      email,
      display_name: displayName,
      handle,
      wallet_type: "circle",
      circle_wallet_id: circleWalletId,
      circle_wallet_address: circleWalletAddress,
      wallet_address: circleWalletAddress,
      supporter_nation: supporterNation,
      gateway_balance: 0,
    },
    { onConflict: "id" },
  );

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
