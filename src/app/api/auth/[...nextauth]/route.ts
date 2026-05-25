import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";

/**
 * NextAuth v4 App Router route handler.
 *
 * authOptions is defined in @/lib/auth/authOptions so it can be imported
 * by other API routes via getServerSession(authOptions) without hitting
 * Next.js's restriction that route handlers only export HTTP method names.
 */
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
