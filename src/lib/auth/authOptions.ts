import { NextAuthOptions } from "next-auth";
import GoogleProvider        from "next-auth/providers/google";
import CredentialsProvider   from "next-auth/providers/credentials";
import { createClient }      from "@supabase/supabase-js";
import { provisionCircleWallet } from "@/lib/circle/provisionWallet";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount }      from "viem/accounts";
import { xLayerTestnet }            from "@/lib/xlayer/chains";
import { FAN_PASSPORT_ABI }         from "@/lib/xlayer/abis";
import { getTeamByCode }             from "@/lib/data/wc2026-teams";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getOrCreateProfile(userId: string, email: string, name?: string, image?: string) {
  console.log("[auth:signIn] Starting profile setup for:", email);
  console.log("[auth:signIn] CIRCLE_API_KEY set:", !!process.env.CIRCLE_API_KEY);
  console.log("[auth:signIn] CIRCLE_ENTITY_SECRET set:", !!process.env.CIRCLE_ENTITY_SECRET);
  console.log("[auth:signIn] CIRCLE_WALLET_SET_ID set:", !!process.env.CIRCLE_WALLET_SET_ID);

  // Check existing profile
  const { data: existing } = await supabaseAdmin
    .from("profiles")
    .select("id, circle_wallet_id, circle_wallet_address, supporter_nation")
    .eq("id", userId)
    .maybeSingle();

  if (existing?.circle_wallet_id) {
    console.log("[auth:signIn] Profile and Circle Wallet already exist for:", email);
    return existing;
  }

  // Provision Circle wallet
  let walletId      = "";
  let walletAddress = "";

  if (!process.env.CIRCLE_API_KEY || !process.env.CIRCLE_ENTITY_SECRET || !process.env.CIRCLE_WALLET_SET_ID) {
    console.error("[auth:signIn] MISSING CIRCLE ENV VARS — wallet creation skipped");
  } else {
    try {
      console.log("[auth:signIn] Provisioning Circle wallet...");
      const wallet  = await provisionCircleWallet(userId);
      walletId      = wallet.walletId;
      walletAddress = wallet.walletAddress;
      console.log("[auth:signIn] Wallet provisioned successfully:", walletAddress);
    } catch (err) {
      console.error("[auth:signIn] Circle wallet provision failed:", err);
      // Continue — user can still sign in, wallet provisioned on next attempt
    }
  }

  // Upsert profile
  console.log("[auth:signIn] Upserting profile for:", email);
  const handle = `${(email.split("@")[0]).replace(/[^a-z0-9]/gi, "").toLowerCase()}${Math.random().toString(36).slice(2, 6)}`;

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .upsert({
      id:                    userId,
      email,
      display_name:          name ?? email.split("@")[0],
      avatar_url:            image ?? null,
      circle_wallet_id:      walletId   || null,
      circle_wallet_address: walletAddress || null,
      wallet_address:        walletAddress || null, // keep wallet_address in sync for backward compatibility
      handle,
      wallet_type:           "circle",
      gateway_balance:       0,
    }, { onConflict: "id" })
    .select()
    .single();

  console.log("[auth:signIn] Profile upserted successfully");

  // Mint X Layer Fan Passport (non-blocking — never fails sign in)
  if (walletAddress) {
    const supporterNation = "TBD"; // updated after onboarding
    console.log("[auth:signIn] Initiating passport mint for:", walletAddress);
    mintFanPassport(walletAddress, supporterNation).then(() => {
      console.log("[auth:signIn] X Layer passport minted successfully");
    }).catch((err) => {
      console.error("[auth:signIn] X Layer passport mint failed (non-blocking):", err);
    });
  }

  return profile;
}

async function mintFanPassport(walletAddress: string, countryCode: string) {
  const deployerKey = process.env.PLATFORM_DEPLOYER_PRIVATE_KEY;
  if (!deployerKey) return;

  const account = privateKeyToAccount(deployerKey as `0x${string}`);
  const client  = createWalletClient({
    account,
    chain:     xLayerTestnet,
    transport: http(process.env.XLAYER_RPC ?? process.env.XLAYER_TESTNET_RPC_URL ?? "https://testrpc.xlayer.tech"),
  });

  const team = getTeamByCode(countryCode);
  const confederation = team?.conf ?? "CONCACAF";

  await client.writeContract({
    address:      process.env.FAN_PASSPORT_ADDRESS as `0x${string}`,
    abi:          FAN_PASSPORT_ABI,
    functionName: "mint",
    args:         [walletAddress as `0x${string}`, countryCode, confederation],
  });
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Email",
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const { data: { user }, error } = await supabaseAdmin.auth.signInWithPassword({
          email:    credentials.email,
          password: credentials.password,
        });

        if (error || !user) return null;
        return { id: user.id, email: user.email!, name: user.user_metadata?.name };
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false;

      try {
        await getOrCreateProfile(user.id, user.email, user.name ?? undefined, user.image ?? undefined);
        return true;
      } catch (err) {
        console.error("[auth] signIn callback failed:", err);
        return true; // still allow sign in even if provisioning fails
      }
    },

    async jwt({ token, user }) {
      if (user) {
        // Fresh sign in — load profile data into token
        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("circle_wallet_id, circle_wallet_address, gateway_balance, supporter_nation, role, display_name, avatar_url")
          .eq("id", user.id)
          .maybeSingle();

        // Mirror Streamarc JWT shape + RoarTube additions
        token.id               = user.id;
        token.role             = profile?.role             ?? "viewer";
        token.gateway_balance  = profile?.gateway_balance  ?? 0;
        token.wallet_address   = profile?.circle_wallet_address ?? null;
        token.circle_wallet_id = profile?.circle_wallet_id     ?? null;
        token.display_name     = profile?.display_name         ?? user.name;
        token.avatar_url       = profile?.avatar_url            ?? user.image;
        token.supporter_nation = profile?.supporter_nation      ?? null;

        // Expose camelCase as well for backward compatibility
        token.walletAddress    = profile?.circle_wallet_address ?? null;
        token.circleWalletId   = profile?.circle_wallet_id      ?? null;
      }
      return token;
    },

    async session({ session, token }) {
      // Mirror Streamarc session shape + RoarTube additions
      session.user.id               = token.id as string;
      session.user.role             = token.role as string;
      session.user.gateway_balance  = token.gateway_balance as number;
      session.user.wallet_address   = token.wallet_address as string;
      session.user.circle_wallet_id = token.circle_wallet_id as string;
      session.user.display_name     = token.display_name as string;
      session.user.avatar_url       = token.avatar_url as string;
      session.user.supporter_nation = token.supporter_nation as string;

      // Map camelCase versions for compatibility
      session.user.walletAddress    = token.walletAddress as string;
      session.user.circleWalletId   = token.circleWalletId as string;
      return session;
    },
  },

  pages: {
    signIn: "/auth/signin",
    error:  "/auth/error",
  },

  session: { strategy: "jwt" },
};
