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
    // ─── jwt ───────────────────────────────────────────────────────────────
    // On first sign-in (user object present), upsert the user record in
    // Supabase and provision a Circle wallet in the background.
    // Adapted directly from Streamarc's auth.ts jwt callback.
    async jwt({ token, user, account }) {
      if (user && account?.provider === "google") {
        const supabase = createSupabaseServerClient();

        if (supabase) {
          // Look up existing user by Supabase user ID (Google sub)
          const { data: profile } = await supabase
            .from("profiles")
            .select("id, wallet_address, circle_wallet_id, display_name")
            .eq("id", user.id)
            .maybeSingle();

          if (!profile) {
            // New user — insert profile record
            const { error: insertErr } = await supabase.from("profiles").insert({
              id: user.id,
              email: user.email ?? null,
              display_name: user.name ?? null,
              avatar_url: user.image ?? null,
              wallet_address: null,
              circle_wallet_id: null,
              cumulative_free_seconds_used: 0,
            });

            if (insertErr) {
              // Non-fatal: may already exist due to a race condition
              console.warn("[NextAuth] Profile insert warning:", insertErr.message);
            }

            // Provision Circle wallet in background — never block the JWT callback
            provisionUserWallet(user.id)
              .then(async (wallet) => {
                if (!wallet) return;
                const sb = createSupabaseServerClient();
                if (!sb) return;
                await sb
                  .from("profiles")
                  .update({ wallet_address: wallet.walletAddress, circle_wallet_id: wallet.walletId })
                  .eq("id", user.id);
                console.log("[NextAuth] Circle wallet saved for user:", user.id);
              })
              .catch((err: unknown) => {
                console.error("[NextAuth] Background wallet provisioning failed:", err);
              });

            token.userId = user.id;
            token.walletAddress = null;
            token.circleWalletId = null;
            token.displayName = user.name ?? null;
          } else {
            // Existing user — check if they still need a wallet
            if (!profile.circle_wallet_id) {
              provisionUserWallet(user.id)
                .then(async (wallet) => {
                  if (!wallet) return;
                  const sb = createSupabaseServerClient();
                  if (!sb) return;
                  await sb
                    .from("profiles")
                    .update({ wallet_address: wallet.walletAddress, circle_wallet_id: wallet.walletId })
                    .eq("id", user.id);
                })
                .catch(console.error);
            }

            token.userId = profile.id;
            token.walletAddress = profile.wallet_address ?? null;
            token.circleWalletId = profile.circle_wallet_id ?? null;
            token.displayName = profile.display_name ?? null;
          }
        } else {
          // Supabase not configured — still persist userId
          token.userId = user.id;
        }
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
