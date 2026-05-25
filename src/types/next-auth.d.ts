import "next-auth";
import "next-auth/jwt";

/**
 * Extend the built-in NextAuth types so TypeScript knows about the `id` field
 * we inject in the session callback (sourced from the JWT `sub`).
 */
declare module "next-auth" {
  interface User {
    id: string;
  }

  interface Session {
    user: User & {
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    sub: string;
  }
}
