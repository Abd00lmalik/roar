import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthSession } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const PatchSchema = z.object({
  freeSecondsRemaining: z.number().int().min(0).max(120),
});

export async function GET() {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ freeSecondsRemaining: 120 }, { status: 200 });
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase unavailable" }, { status: 500 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("free_seconds_remaining")
    .eq("google_user_id", session.user.id)
    .maybeSingle();

  return NextResponse.json({
    freeSecondsRemaining: profile?.free_seconds_remaining ?? 120,
  });
}

export async function PATCH(req: NextRequest) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = PatchSchema.safeParse(await req.json().catch(() => null));
  if (!payload.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase unavailable" }, { status: 500 });
  }

  await supabase
    .from("profiles")
    .update({ free_seconds_remaining: payload.data.freeSecondsRemaining })
    .eq("google_user_id", session.user.id);

  return NextResponse.json({ ok: true });
}
