"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { RoarTubeLogo } from "@/components/ui/RoarTubeLogo";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useBalance } from "wagmi";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { xLayerPublicClient } from "@/lib/xlayer/client";
import { formatEther } from "viem";

import { useWalletBalance } from "@/hooks/useWalletBalance";

const links = [
  { href: "/stadium", label: "Stadium Feed 🏟️" },
  { href: "/upload", label: "Upload 📹" },
  { href: "/passport", label: "Fan Passport 🪪" },
  { href: "/earnings", label: "Goal Earnings 💰" },
  { href: "/leaderboards", label: "Crowd RoarTube" },
];

export function Navbar() {
  const pathname = usePathname();
  const { address: connectedAddress, isConnected } = useAccount();
  const { data: session } = useSession();
  const [walletErrorDismissed, setWalletErrorDismissed] = useState(false);

  const { balance: circleUsdcBalance } = useWalletBalance(session?.user?.circleWalletId ?? null);

  const hideNavRoutes = ["/", "/onboarding"];
  if (hideNavRoutes.includes(pathname)) return null;

  const walletAddress = connectedAddress ?? session?.user?.walletAddress ?? null;

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-stadium/90 backdrop-blur-xl px-6 py-3">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between">
        {/* Logo */}
        <Link href="/stadium" className="flex items-center gap-2">
          <RoarTubeLogo />
        </Link>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                pathname === link.href
                  ? "bg-white/10 text-[var(--country-accent,#FFCE00)] font-bold"
                  : "text-white/70 hover:text-white hover:bg-white/5"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Wallet info / ConnectButton */}
        <div className="flex items-center gap-3">
          {walletAddress && (
            <div className="hidden sm:flex flex-col items-end px-3 py-1 bg-white/5 border border-white/10 rounded-xl text-[11px] font-medium leading-tight">
              {!connectedAddress ? (
                <>
                  <span className="text-[var(--country-accent,#FFCE00)] font-mono font-bold">
                    {session?.user?.walletAddress ? `${session.user.walletAddress.slice(0, 6)}…${session.user.walletAddress.slice(-4)}` : "No Wallet"}
                  </span>
                  <span className="text-white/60 font-mono text-[9px] mt-0.5">
                    {circleUsdcBalance !== null ? `${circleUsdcBalance.toFixed(2)} USDC` : "Loading balance…"}
                  </span>
                </>
              ) : (
                <span className="text-[var(--country-accent,#FFCE00)] font-mono font-semibold py-0.5">
                  Wallet Connected
                </span>
              )}
            </div>
          )}
          {session?.user && !session.user.walletAddress && !walletErrorDismissed && (
            <div
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs cursor-pointer animate-pulse"
              onClick={() => setWalletErrorDismissed(true)}
              title="Circle wallet not configured — check Vercel env vars"
            >
              ⚠️ Wallet not ready
              <span className="text-amber-400/50 text-[10px]">✕</span>
            </div>
          )}
          <ConnectButton chainStatus="icon" showBalance={false} />
        </div>
      </div>
    </header>
  );
}
