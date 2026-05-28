import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";

type Group = {
  title: string;
  keys: string[];
};

const groups: Group[] = [
  {
    title: "Auth",
    keys: ["NEXTAUTH_URL", "NEXTAUTH_SECRET", "GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
  },
  {
    title: "Supabase",
    keys: ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"],
  },
  {
    title: "Circle",
    keys: ["CIRCLE_API_KEY", "CIRCLE_ENTITY_SECRET", "CIRCLE_WALLET_SET_ID", "CIRCLE_USDC_TOKEN_ID"],
  },
  {
    title: "Gateway",
    keys: ["PLATFORM_GATEWAY_WALLET_ADDRESS", "NEXT_PUBLIC_PLATFORM_GATEWAY_WALLET_ADDRESS", "NEXT_PUBLIC_USDC_ADDRESS"],
  },
  {
    title: "X Layer",
    keys: [
      "NEXT_PUBLIC_XLAYER_TESTNET_RPC_URL",
      "XLAYER_TESTNET_RPC_URL",
      "PLATFORM_DEPLOYER_PRIVATE_KEY",
      "FAN_PASSPORT_ADDRESS",
      "NEXT_PUBLIC_FAN_PASSPORT_ADDRESS",
    ],
  },
  {
    title: "Wallet UX",
    keys: ["NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID", "NEXT_PUBLIC_USDC_FAUCET_URL", "NEXT_PUBLIC_OKB_FAUCET_URL"],
  },
];

export default async function SystemEnvPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/system/env");
  }

  const groupStatus = groups.map((group) => {
    const rows = group.keys.map((key) => ({
      key,
      ready: Boolean(process.env[key]),
    }));

    return {
      ...group,
      readyCount: rows.filter((row) => row.ready).length,
      totalCount: rows.length,
      rows,
    };
  });

  const missing = groupStatus.flatMap((group) => group.rows.filter((row) => !row.ready).map((row) => row.key));
  const allReady = missing.length === 0;

  return (
    <main className="min-h-screen bg-[#060810] px-4 py-8 text-white">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">System Environment Health</h1>
            <p className="mt-1 text-sm text-white/60">Diagnostics only. Secret values are never displayed.</p>
          </div>
          <Link href="/admin" className="rounded-lg border border-white/20 px-3 py-2 text-sm text-white/80 hover:bg-white/10">
            Back to Admin
          </Link>
        </div>

        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            allReady ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300" : "border-amber-400/30 bg-amber-400/10 text-amber-300"
          }`}
        >
          {allReady ? "All required environment variables are configured." : `Missing ${missing.length} required variables.`}
        </div>

        {!allReady ? (
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <p className="mb-2 text-xs uppercase tracking-wide text-white/50">Missing Keys</p>
            <p className="text-sm text-white/80">{missing.join(", ")}</p>
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          {groupStatus.map((group) => (
            <section key={group.title} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-semibold">{group.title}</h2>
                <span className="text-xs text-white/60">
                  {group.readyCount}/{group.totalCount} ready
                </span>
              </div>
              <ul className="space-y-2">
                {group.rows.map((row) => (
                  <li key={row.key} className="flex items-center justify-between rounded-md border border-white/10 bg-black/20 px-3 py-2 text-xs">
                    <span className="font-mono text-white/80">{row.key}</span>
                    <span className={row.ready ? "text-emerald-300" : "text-rose-300"}>{row.ready ? "set" : "missing"}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
