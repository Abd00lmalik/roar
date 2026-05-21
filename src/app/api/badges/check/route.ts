import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const billableSeconds = Number(body.billableSeconds ?? 0);
  const eligible = billableSeconds >= 1;

  return NextResponse.json({
    eligible,
    badge: eligible ? "first_roar" : null,
    reason: eligible ? "watched_first_session" : "not_enough_activity",
  });
}
