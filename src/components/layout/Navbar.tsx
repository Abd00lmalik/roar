"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useSession } from "next-auth/react";
import { useWalletBalance } from "@/hooks/useWalletBalance";

const links = [
  { href: "/stadium", label: "Stadium Feed" },
  { href: "/upload", label: "Upload" },
  { href: "/passport", label: "Fan Passport" },
  { href: "/earnings", label: "Goal Earnings" },
  { href: "/leaderboards", label: "Crowd RoarTube" },
];

export function Navbar() {
  const pathname = usePathname();
  const { address: connectedAddress } = useAccount();
  const { data: session } = useSession();
  const { balance: circleUsdcBalance } = useWalletBalance(session?.user?.circleWalletId ?? null);

  const hideNavRoutes = ["/", "/onboarding", "/auth/signin"];
  if (hideNavRoutes.includes(pathname)) return null;

  const walletAddress = connectedAddress ?? session?.user?.walletAddress ?? null;

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-stadium/90 px-6 py-3 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between">
        <Link href="/stadium" className="text-sm font-semibold text-white/70 hover:text-white">
          Stadium
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                pathname === link.href
                  ? "bg-white/10 font-bold text-[var(--country-accent,#FFCE00)]"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {walletAddress ? (
            <div className="hidden flex-col items-end rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium leading-tight sm:flex">
              {!connectedAddress ? (
                <>
                  <span className="font-mono font-bold text-[var(--country-accent,#FFCE00)]">
                    {session?.user?.walletAddress
                      ? `${session.user.walletAddress.slice(0, 6)}...${session.user.walletAddress.slice(-4)}`
                      : "No Wallet"}
                  </span>
                  <span className="mt-0.5 font-mono text-[9px] text-white/60">
                    {circleUsdcBalance !== null ? `${circleUsdcBalance.toFixed(2)} USDC` : "Loading balance..."}
                  </span>
                </>
              ) : (
                <span className="py-0.5 font-mono font-semibold text-[var(--country-accent,#FFCE00)]">
                  Wallet Connected
                </span>
              )}
            </div>
          ) : null}

          <ConnectButton chainStatus="icon" showBalance={false} />
        </div>
      </div>
    </header>
  );
}
