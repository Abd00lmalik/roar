import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * DELETE /api/admin/nuke-demos?key=<ADMIN_KEY>
 *
 * Deletes every row in the `videos` table where is_demo = true.
 * Protected by a simple admin key passed as a query param.
 *
 * Usage from browser or curl:
 *   https://your-app.vercel.app/api/admin/nuke-demos?key=roartube-admin-2026
 */

const ADMIN_KEY = process.env.ADMIN_KEY ?? "roartube-admin-2026";

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);

  if (searchParams.get("key") !== ADMIN_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const { data, error, count } = await supabase
    .from("videos")
    .delete({ count: "exact" })
    .eq("is_demo", true);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    deleted: count ?? 0,
    message: `Removed ${count ?? 0} demo video(s) from the database.`,
  });
}

/** Also allow GET so you can hit it directly in a browser address bar */
export async function GET(req: Request) {
  return DELETE(req);
}
