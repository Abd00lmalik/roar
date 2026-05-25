import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hashGoogleSub } from "@/lib/auth/hash";
import { provisionUserWallet } from "@/lib/payments/wallet";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account?.provider === "google" && profile?.sub) {
        token.sub = hashGoogleSub(profile.sub);
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      if (account?.provider !== "google" || !profile?.sub || !user.email) {
        return false;
      }

      const supabase = createSupabaseServerClient();
      if (!supabase) {
        return false;
      }

      const googleUserId = hashGoogleSub(profile.sub);
      const handleBase =
        user.email.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 20) || "fan";

      const { error } = await supabase.from("profiles").upsert(
        {
          google_user_id: googleUserId,
          wallet_address: `google:${googleUserId}`,
          display_name: user.name ?? handleBase,
          handle: `${handleBase}_${googleUserId.slice(0, 6)}`,
          avatar_url: user.image,
          bio: "Roarball fan",
          email: user.email,
          country_code: "US",
          country_name: "United States",
          free_seconds_remaining: 120,
        },
        { onConflict: "google_user_id" },
      );

      if (error) {
        return false;
      }

      try {
        await provisionUserWallet(googleUserId);
      } catch {
        // Auth remains successful; provisioning retries later.
      }

      return true;
    },
  },
};
