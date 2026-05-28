import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Unauthenticated users can only access landing, onboarding, auth pages
    const publicPaths = ["/", "/onboarding", "/auth/signin", "/auth/error", "/stadium"];
    const isPublic    = publicPaths.some((p) => pathname.startsWith(p));

    if (!token && !isPublic) {
      return NextResponse.redirect(new URL("/auth/signin", req.url));
    }

    // Authenticated users without a gateway balance: redirect to fund wallet
    // (except if they're already on the fund page or auth pages)
    if (token &&
        !pathname.startsWith("/wallet") &&
        !pathname.startsWith("/auth") &&
        !pathname.startsWith("/api") &&
        pathname.startsWith("/watch") &&
        (token.gateway_balance as number ?? 0) <= 0) {
      return NextResponse.redirect(new URL("/wallet/fund", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true, // handle redirects manually above
    },
  }
);

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon|public|api/auth).*)"],
};
