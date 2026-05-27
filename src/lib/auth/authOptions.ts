import NextAuth, { type AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { provisionUserWallet } from "@/lib/payments/wallet";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * NextAuth configuration — exported separately so API routes can call
 * getServerSession(authOptions) without importing from a route handler file.
 *
 * Adapted from Streamarc's app/lib/auth.ts jwt callback pattern.
 */
export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,

  session: {
    strategy: "jwt",
  },

  callbacks: {
    // ─── signIn ────────────────────────────────────────────────────────────
    // Runs when a user authenticates. Synchronously upserts their profile and
    // provisions their Circle wallet, preventing race conditions.
    async signIn({ user, account }) {
      if (account?.provider !== "google") return true;

      try {
        const supabase = createSupabaseServerClient();
        if (!supabase) {
          console.warn("[NextAuth signIn] Supabase client not available");
          return true;
        }

        const userId = user.id;

        // Check if profile exists
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, circle_wallet_id")
          .eq("id", userId)
          .maybeSingle();

        if (!profile) {
          // New user — insert profile record
          const { error: insertErr } = await supabase.from("profiles").insert({
            id: userId,
            email: user.email ?? null,
            display_name: user.name ?? null,
            avatar_url: user.image ?? null,
            wallet_address: null,
            circle_wallet_id: null,
            cumulative_free_seconds_used: 0,
          });

          if (insertErr) {
            console.warn("[NextAuth signIn] Profile insert warning:", insertErr.message);
          }
        }

        // Re-fetch to get current state (e.g. if insert worked or raced)
        const { data: currentProfile } = await supabase
          .from("profiles")
          .select("id, circle_wallet_id")
          .eq("id", userId)
          .maybeSingle();

        if (currentProfile && !currentProfile.circle_wallet_id) {
          console.log(`[NextAuth signIn] Provisioning Circle wallet for user ${userId}`);
          const wallet = await provisionUserWallet(userId);
          if (wallet) {
            await supabase
              .from("profiles")
              .update({
                circle_wallet_id: wallet.walletId,
                wallet_address: wallet.walletAddress,
              })
              .eq("id", userId);
            console.log(`[NextAuth signIn] Wallet provisioned: ${wallet.walletId} -> ${wallet.walletAddress}`);
          }
        }

        return true;
      } catch (err) {
        console.error("[NextAuth signIn] Error in signIn callback:", err);
        return true; // fail-open to let them sign in
      }
    },

    // ─── jwt ───────────────────────────────────────────────────────────────
    // Reads user profile from the database to keep session in sync with wallet
    async jwt({ token, user, account }) {
      const supabase = createSupabaseServerClient();
      const userId = (token.userId as string | undefined) ?? token.sub;

      if (userId && supabase) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, wallet_address, circle_wallet_id, display_name")
          .eq("id", userId)
          .maybeSingle();

        if (profile) {
          token.userId = profile.id;
          token.walletAddress = profile.wallet_address ?? null;
          token.circleWalletId = profile.circle_wallet_id ?? null;
          token.displayName = profile.display_name ?? null;
        } else if (user) {
          token.userId = user.id;
          token.displayName = user.name ?? null;
        }
      } else if (user) {
        token.userId = user.id;
        token.displayName = user.name ?? null;
      }

      return token;
    },

    // ─── session ───────────────────────────────────────────────────────────
    async session({ session, token }) {
      if (token) {
        session.user.id = (token.userId as string | undefined) ?? token.sub ?? "";
        session.user.walletAddress = (token.walletAddress as string | null | undefined) ?? null;
        session.user.circleWalletId = (token.circleWalletId as string | null | undefined) ?? null;
        session.user.displayName = (token.displayName as string | null | undefined) ?? null;
      }
      return session;
    },
  },

  pages: {
    signIn: "/onboarding",
    error: "/onboarding",
  },
};
