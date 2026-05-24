"use client";

import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

const links = [
  { href: "/feed", label: "Stadium Feed 🏟️" },
  { href: "/upload", label: "Enter the Pitch ⚽" },
  { href: "/passport", label: "Fan Passport 🛂" },
  { href: "/earnings", label: "Goal Earnings" },
  { href: "/leaderboards", label: "Crowd Roarball" },
];

export function Navbar() {
  const { isConnected } = useAccount();

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-stadium/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="font-display text-2xl font-bold italic text-floodlight">
          Roarball
        </Link>
        {isConnected && (
          <nav className="hidden items-center gap-4 text-sm md:flex">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="text-chalk/80 hover:text-white">
                {link.label}
              </Link>
            ))}
          </nav>
        )}
        <ConnectButton />
      </div>
    </header>
  );
}
