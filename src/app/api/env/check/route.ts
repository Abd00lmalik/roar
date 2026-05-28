import { NextResponse } from "next/server";

const requiredServer = [
  "NEXTAUTH_SECRET",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "CIRCLE_API_KEY",
  "CIRCLE_ENTITY_SECRET",
  "CIRCLE_WALLET_SET_ID",
  "CIRCLE_USDC_TOKEN_ID",
  "PLATFORM_GATEWAY_WALLET_ADDRESS",
];

const requiredPublic = [
  "NEXT_PUBLIC_PLATFORM_GATEWAY_WALLET_ADDRESS",
  "NEXT_PUBLIC_USDC_ADDRESS",
  "NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID",
];

export async function GET() {
  const missingServer = requiredServer.filter((key) => !process.env[key]);
  const missingPublic = requiredPublic.filter((key) => !process.env[key]);

  return NextResponse.json({
    ok: missingServer.length === 0 && missingPublic.length === 0,
    missing: [...missingServer, ...missingPublic],
    missingServer,
    missingPublic,
  });
}
