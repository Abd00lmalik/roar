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
          .select("id, circle_wallet_id, wallet_address")
          .eq("id", userId)
          .maybeSingle();

        let circleWalletId = profile?.circle_wallet_id;
        let circleWalletAddress = profile?.wallet_address;

        // Provision wallet if not present
        if (!circleWalletId) {
          console.log(`[NextAuth signIn] Provisioning Circle wallet for user ${userId}`);
          try {
            const wallet = await provisionUserWallet(userId);
            if (wallet) {
              circleWalletId = wallet.walletId;
              circleWalletAddress = wallet.walletAddress;
            }
          } catch (walletErr) {
            console.error("[NextAuth signIn] Wallet provisioning failed:", walletErr);
          }
        }

        if (!profile) {
          // New user — insert profile record
          const defaultCountryCode = "US";
          const defaultCountryName = "United States";
          const generatedHandle = user.email
            ? user.email.split("@")[0].substring(0, 15) + "_" + Math.random().toString(36).substring(2, 6)
            : "user_" + Math.random().toString(36).substring(2, 10);

          const { error: insertErr } = await supabase.from("profiles").insert({
            id: userId,
            email: user.email ?? null,
            display_name: user.name ?? "User",
            handle: generatedHandle,
            avatar_url: user.image ?? null,
            wallet_address: circleWalletAddress ?? null,
            circle_wallet_id: circleWalletId ?? null,
            country_code: defaultCountryCode,
            country_name: defaultCountryName,
            cumulative_free_seconds_used: 0,
          });

          if (insertErr) {
            console.error("[NextAuth signIn] Profile insert failed:", insertErr.message);
          } else {
            console.log(`[NextAuth signIn] Profile created successfully for ${userId}`);
          }
        } else if (circleWalletId && (circleWalletId !== profile.circle_wallet_id || circleWalletAddress !== profile.wallet_address)) {
          // Profile exists, but wallet was provisioned during this call
          const { error: updateErr } = await supabase
            .from("profiles")
            .update({
              circle_wallet_id: circleWalletId,
              wallet_address: circleWalletAddress,
            })
            .eq("id", userId);

          if (updateErr) {
            console.error("[NextAuth signIn] Profile wallet update failed:", updateErr.message);
          } else {
            console.log(`[NextAuth signIn] Profile wallet updated successfully for ${userId}`);
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
