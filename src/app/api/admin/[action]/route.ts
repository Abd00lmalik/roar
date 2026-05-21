import { NextResponse } from "next/server";

function isAuthorized(request: Request): boolean {
  const adminSecret = request.headers.get("x-admin-secret");
  return Boolean(
    (process.env.ADMIN_SECRET && adminSecret === process.env.ADMIN_SECRET) ||
      !process.env.ADMIN_SECRET,
  );
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ action: string }> },
) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const resolved = await params;
  return NextResponse.json({ ok: true, action: resolved.action });
}
