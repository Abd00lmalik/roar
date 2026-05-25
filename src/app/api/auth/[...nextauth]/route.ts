import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// ---------------------------------------------------------------------------
// NextAuth configuration
// ---------------------------------------------------------------------------
// Runtime note: NEXTAUTH_SECRET, GOOGLE_CLIENT_ID, and GOOGLE_CLIENT_SECRET
// must be set in Vercel → Project → Settings → Environment Variables.
// Missing values will surface as NextAuth initialisation errors at request time.
// ---------------------------------------------------------------------------
const handler = NextAuth({
  providers: [
    GoogleProvider({
      // These are validated by NextAuth itself at request initialisation time.
      // If either is missing, NextAuth throws a readable error in the server logs.
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async signIn({ user, account }) {
      // Guard: if OAuth creds are not configured, reject sign-in gracefully.
      if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
        console.error(
          "[NextAuth] GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET not set — rejecting sign-in."
        );
        return false;
      }
      // TODO (Phase 3): trigger Circle wallet provisioning here using user.id
      // import { provisionUserWallet } from "@/lib/payments/wallet";
      // await provisionUserWallet(user.id);
      console.log("[NextAuth] signIn —", user?.email, account?.provider);
      return true;
    },

    async jwt({ token, user }) {
      // Persist Google sub as the stable user identifier
      if (user) {
        token.sub = user.id;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user && token.sub) {
        // session.user.id is typed via src/types/next-auth.d.ts
        session.user.id = token.sub;
      }
      return session;
    },

  },

  pages: {
    signIn: "/onboarding",  // Send unauthenticated users to our onboarding flow
    error: "/onboarding",   // Send auth errors back to onboarding UI, not raw error page
  },
});

export { handler as GET, handler as POST };

