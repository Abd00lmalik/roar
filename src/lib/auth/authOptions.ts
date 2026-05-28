import NextAuth, { type AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { initiateDeveloperControlledWalletsClient } from "@circle-fin/developer-controlled-wallets";

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
    async signIn({ user, account }) {
      if (account?.provider !== "google") return true;

      try {
        const supabase = createSupabaseServerClient();
        if (!supabase) {
          console.warn("[NextAuth signIn] Supabase client not available");
          return true;
        }

        // STEP 1: Check if profile already exists (idempotency)
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, circle_wallet_id, wallet_address, country_code, confederation, handle, country_name")
          .eq("email", user.email)
          .maybeSingle();

        if (profile?.circle_wallet_id) {
          // Already provisioned — skip wallet creation
          return true;
        }

        // STEP 2: Create Circle wallet (copy exact SDK call from Streamarc)
        let circleWalletId = "";
        let circleWalletAddress = "";

        const apiKey = process.env.CIRCLE_API_KEY;
        const entitySecret = process.env.CIRCLE_ENTITY_SECRET;
        const walletSetId = process.env.CIRCLE_WALLET_SET_ID;

        if (apiKey && entitySecret && walletSetId) {
          try {
            const client = initiateDeveloperControlledWalletsClient({ apiKey, entitySecret });
            
            // Check for existing wallet first
            const existing = await client.listWallets({ refId: user.id });
            const existingWallet = existing.data?.wallets?.[0];
            
            if (existingWallet?.id && existingWallet?.address) {
              circleWalletId = existingWallet.id;
              circleWalletAddress = existingWallet.address;
              console.log("[auth] Reusing existing Circle wallet:", { id: circleWalletId, address: circleWalletAddress, userId: user.id });
            } else {
              const walletResponse = await client.createWallets({
                walletSetId,
                blockchains: ["ARC-TESTNET"],
                count: 1,
                accountType: "EOA",
                metadata: [{ name: `roartube-${user.id.slice(0, 8)}`, refId: user.id }],
              });
              
              const wallet = walletResponse.data?.wallets?.[0];
              if (wallet?.id && wallet?.address) {
                circleWalletId = wallet.id;
                circleWalletAddress = wallet.address;
                console.log("[auth] Circle wallet created:", { id: circleWalletId, address: circleWalletAddress, userId: user.id });
              }
            }
          } catch (err: any) {
            console.error("[auth] Circle wallet creation failed:", err?.message, err?.response?.data);
          }
        } else {
          console.warn("[auth] Circle configuration variables are missing. Skipping wallet provisioning.");
        }

        // STEP 3: Upsert profile — never fail sign in due to DB error
        const defaultCountryCode = "US";
        const defaultCountryName = "United States";
        const defaultConfederation = "CONCACAF";
        const generatedHandle = profile?.handle ?? (
          user.email
            ? user.email.split("@")[0].substring(0, 15) + "_" + Math.random().toString(36).substring(2, 6)
            : "user_" + Math.random().toString(36).substring(2, 10)
        );

        try {
          await supabase.from("profiles").upsert({
            id: user.id,
            email: user.email ?? null,
            display_name: user.name ?? "User",
            handle: generatedHandle,
            avatar_url: user.image ?? null,
            circle_wallet_id: circleWalletId || null,
            wallet_address: circleWalletAddress || null,
            country_code: profile?.country_code ?? defaultCountryCode,
            country_name: profile?.country_name ?? defaultCountryName,
            confederation: profile?.confederation ?? defaultConfederation,
            cumulative_free_seconds_used: profile?.cumulative_free_seconds_used ?? 0,
          }, { onConflict: "id" });
          console.log(`[auth] Profile upserted successfully for user: ${user.id}`);
        } catch (err) {
          console.error("[auth] Profile upsert failed:", err);
        }

        // STEP 4: Mint X Layer Fan Passport (non-blocking, best-effort)
        try {
          const deployerKey = process.env.PLATFORM_DEPLOYER_PRIVATE_KEY;
          const passportAddress = process.env.NEXT_PUBLIC_FAN_PASSPORT_ADDRESS;
          
          if (deployerKey && passportAddress && circleWalletAddress) {
            const { privateKeyToAccount } = await import("viem/accounts");
            const { createWalletClient, http } = await import("viem");
            const { xLayerTestnet } = await import("@/lib/xlayer/chain");
            const { FAN_PASSPORT_ABI } = await import("@/lib/xlayer/abis");
            const { xLayerPublicClient } = await import("@/lib/xlayer/client");

            const account = privateKeyToAccount(deployerKey as `0x${string}`);
            const walletClient = createWalletClient({
              account,
              chain: xLayerTestnet,
              transport: http(process.env.NEXT_PUBLIC_XLAYER_TESTNET_RPC_URL ?? "https://testrpc.xlayer.tech"),
            });

            // Check if passport already exists on-chain
            const alreadyMinted = await xLayerPublicClient.readContract({
              address: passportAddress as `0x${string}`,
              abi: FAN_PASSPORT_ABI,
              functionName: "hasPassport",
              args: [circleWalletAddress as `0x${string}`],
            });

            if (!alreadyMinted) {
              const hash = await walletClient.writeContract({
                address: passportAddress as `0x${string}`,
                abi: FAN_PASSPORT_ABI,
                functionName: "mint",
                args: [
                  circleWalletAddress as `0x${string}`,
                  profile?.country_code ?? defaultCountryCode,
                  profile?.confederation ?? defaultConfederation
                ],
              });
              console.log(`[auth] FanPassport mint transaction submitted for ${circleWalletAddress}: ${hash}`);
            }
          }
        } catch (err) {
          console.error("[auth] X Layer passport mint failed (non-blocking):", err);
        }

        return true;
      } catch (err) {
        console.error("[NextAuth signIn] Error in signIn callback:", err);
        return true; // fail-open
      }
    },

    // ─── jwt ───────────────────────────────────────────────────────────────
    async jwt({ token, user }) {
      const supabase = createSupabaseServerClient();
      const email = token.email ?? user?.email;

      if (email && supabase) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, wallet_address, circle_wallet_id, display_name, country_code")
          .eq("email", email)
          .maybeSingle();

        if (profile) {
          token.userId = profile.id;
          token.walletAddress = profile.wallet_address ?? null;
          token.circleWalletId = profile.circle_wallet_id ?? null;
          token.displayName = profile.display_name ?? null;
          token.circleWalletAddress = profile.wallet_address ?? null;
          token.supporterNation = profile.country_code ?? null;
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
        session.user.circleWalletAddress = (token.circleWalletAddress as string | null | undefined) ?? null;
        session.user.supporterNation = (token.supporterNation as string | null | undefined) ?? null;
      }
      return session;
    },
  },

  pages: {
    signIn: "/onboarding",
    error: "/onboarding",
  },
};
