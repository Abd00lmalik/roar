import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { createClient } from "@supabase/supabase-js";
import { provisionCircleWallet } from "@/lib/circle/provisionWallet";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { xLayerTestnet } from "@/lib/xlayer/chains";
import { FAN_PASSPORT_ABI } from "@/lib/xlayer/abis";
import { getTeamByCode } from "@/lib/data/wc2026-teams";

type SupabaseAdmin = ReturnType<typeof createClient>;

function getSupabaseAdmin(): SupabaseAdmin | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRole) return null;
  return createClient(url, serviceRole);
}

async function getOrCreateProfile(userId: string, email: string, name?: string, image?: string) {
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) return null;
  const profiles = supabaseAdmin.from("profiles") as any;

  const { data } = await profiles
    .select("id, circle_wallet_id, circle_wallet_address, supporter_nation")
    .eq("id", userId)
    .maybeSingle();
  const existing = (data as {
    id?: string;
    circle_wallet_id?: string | null;
    circle_wallet_address?: string | null;
    supporter_nation?: string | null;
  } | null) ?? null;

  if (existing?.circle_wallet_id) {
    return existing;
  }

  let walletId = "";
  let walletAddress = "";

  if (process.env.CIRCLE_API_KEY && process.env.CIRCLE_ENTITY_SECRET && process.env.CIRCLE_WALLET_SET_ID) {
    try {
      const wallet = await provisionCircleWallet(userId);
      walletId = wallet.walletId;
      walletAddress = wallet.walletAddress;
    } catch {
      // Non-blocking: auth should still proceed.
    }
  }

  const handle = `${email
    .split("@")[0]
    .replace(/[^a-z0-9]/gi, "")
    .toLowerCase()}${Math.random().toString(36).slice(2, 6)}`;

  const { data: upserted } = await profiles
    .upsert(
      {
        id: userId,
        email,
        display_name: name ?? email.split("@")[0],
        avatar_url: image ?? null,
        circle_wallet_id: walletId || null,
        circle_wallet_address: walletAddress || null,
        wallet_address: walletAddress || null,
        handle,
        wallet_type: "circle",
        gateway_balance: 0,
      },
      { onConflict: "id" },
    )
    .select()
    .single();

  if (walletAddress) {
    const supporterNation = "TBD";
    void mintFanPassport(walletAddress, supporterNation).catch(() => {
      // Non-blocking mint.
    });
  }

  return upserted;
}

async function mintFanPassport(walletAddress: string, countryCode: string) {
  const deployerKey = process.env.PLATFORM_DEPLOYER_PRIVATE_KEY;
  const fanPassport = process.env.FAN_PASSPORT_ADDRESS;
  if (!deployerKey || !fanPassport) return;

  const account = privateKeyToAccount(deployerKey as `0x${string}`);
  const client = createWalletClient({
    account,
    chain: xLayerTestnet,
    transport: http(process.env.XLAYER_RPC ?? process.env.XLAYER_TESTNET_RPC_URL ?? "https://testrpc.xlayer.tech"),
  });

  const team = getTeamByCode(countryCode);
  const confederation = team?.conf ?? "CONCACAF";

  await client.writeContract({
    address: fanPassport as `0x${string}`,
    abi: FAN_PASSPORT_ABI,
    functionName: "mint",
    args: [walletAddress as `0x${string}`, countryCode, confederation],
  });
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const supabaseAdmin = getSupabaseAdmin();
        if (!supabaseAdmin) return null;

        const { data, error } = await supabaseAdmin.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        });

        if (error || !data.user) return null;
        return { id: data.user.id, email: data.user.email ?? credentials.email, name: data.user.user_metadata?.name };
      },
    }),
  ],

  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;
      try {
        await getOrCreateProfile(user.id, user.email, user.name ?? undefined, user.image ?? undefined);
        return true;
      } catch {
        return true;
      }
    },

    async jwt({ token, user }) {
      if (!user) return token;
      const supabaseAdmin = getSupabaseAdmin();
      if (!supabaseAdmin) {
        (token as any).id = user.id;
        return token;
      }
      const profiles = supabaseAdmin.from("profiles") as any;

      const { data } = await profiles
        .select("circle_wallet_id, circle_wallet_address, gateway_balance, supporter_nation, role, display_name, avatar_url")
        .eq("id", user.id)
        .maybeSingle();
      const profile = (data as {
        circle_wallet_id?: string | null;
        circle_wallet_address?: string | null;
        gateway_balance?: number | null;
        supporter_nation?: string | null;
        role?: string | null;
        display_name?: string | null;
        avatar_url?: string | null;
      } | null) ?? null;

      (token as any).id = user.id;
      (token as any).role = profile?.role ?? "viewer";
      (token as any).gateway_balance = profile?.gateway_balance ?? 0;
      (token as any).wallet_address = profile?.circle_wallet_address ?? null;
      (token as any).circle_wallet_id = profile?.circle_wallet_id ?? null;
      (token as any).display_name = profile?.display_name ?? user.name;
      (token as any).avatar_url = profile?.avatar_url ?? user.image;
      (token as any).supporter_nation = profile?.supporter_nation ?? null;
      (token as any).walletAddress = profile?.circle_wallet_address ?? null;
      (token as any).circleWalletId = profile?.circle_wallet_id ?? null;

      return token;
    },

    async session({ session, token }) {
      (session.user as any).id = (token as any).id;
      (session.user as any).role = (token as any).role;
      (session.user as any).gateway_balance = (token as any).gateway_balance;
      (session.user as any).wallet_address = (token as any).wallet_address;
      (session.user as any).circle_wallet_id = (token as any).circle_wallet_id;
      (session.user as any).display_name = (token as any).display_name;
      (session.user as any).avatar_url = (token as any).avatar_url;
      (session.user as any).supporter_nation = (token as any).supporter_nation;
      (session.user as any).walletAddress = (token as any).walletAddress;
      (session.user as any).circleWalletId = (token as any).circleWalletId;
      return session;
    },
  },

  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },

  session: { strategy: "jwt" },
};
