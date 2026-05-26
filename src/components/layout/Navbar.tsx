"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useBalance } from "wagmi";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { xLayerPublicClient } from "@/lib/xlayer/client";
import { formatEther } from "viem";

const links = [
  { href: "/stadium", label: "Stadium Feed 🏟️" },
  { href: "/upload", label: "Upload 📹" },
  { href: "/passport", label: "Fan Passport 🪪" },
  { href: "/earnings", label: "Goal Earnings 💰" },
  { href: "/leaderboards", label: "Crowd Roarball" },
];

export function Navbar() {
  const pathname = usePathname();
  const { address: connectedAddress, isConnected } = useAccount();
  const { data: session } = useSession();
  const [circleBalance, setCircleBalance] = useState<string>("0.00");

  const hideNavRoutes = ["/", "/onboarding"];
  if (hideNavRoutes.includes(pathname)) return null;

  const walletAddress = connectedAddress ?? session?.user?.walletAddress ?? null;

  // Fetch Circle wallet balance when connected browser wallet is not active
  useEffect(() => {
    if (!connectedAddress && session?.user?.walletAddress) {
      xLayerPublicClient
        .getBalance({ address: session.user.walletAddress as `0x${string}` })
        .then((bal) => {
          setCircleBalance(Number(formatEther(bal)).toFixed(4));
        })
        .catch(() => {});
    }
  }, [connectedAddress, session?.user?.walletAddress]);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-stadium/90 backdrop-blur-xl px-6 py-4">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between">
        {/* Logo */}
        <Link href="/stadium" className="flex items-center gap-2">
          <span className="text-2xl font-black tracking-tight italic">
            <span style={{ color: "var(--country-accent, #FFCC00)" }}>Roar</span>
            <span className="text-white">ball</span>
          </span>
        </Link>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                pathname === link.href
                  ? "bg-white/10 text-white"
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
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs">
              <span className="text-[var(--country-accent,#FFCC00)] font-mono font-semibold">
                {!connectedAddress ? `${circleBalance} OKB (Circle)` : "Wallet Connected"}
              </span>
            </div>
          )}
          <ConnectButton chainStatus="icon" showBalance={false} />
        </div>
      </div>
    </header>
  );
}
