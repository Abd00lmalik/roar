import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_ROUTES = ["/", "/onboarding", "/api/auth"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes and API routes through
  if (PUBLIC_ROUTES.some((r) => pathname === r || pathname.startsWith(r))) {
    return NextResponse.next();
  }

  const token = await getToken({ req: request });

  // 1. Check country selection cookie (must have selected team to view stadium/watch)
  const selectedTeam = request.cookies.get("roar_selected_team");
  if (!selectedTeam) {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  // 2. Allow public feed and watch pages without auth
  if (pathname.startsWith("/stadium") || pathname.startsWith("/watch")) {
    return NextResponse.next();
  }

  // 3. Protected pages (like /upload, /passport) require login
  if (!token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/stadium/:path*",
    "/watch/:path*",
    "/upload/:path*",
    "/passport/:path*",
    "/earnings/:path*",
    "/leaderboards/:path*",
  ],
};
