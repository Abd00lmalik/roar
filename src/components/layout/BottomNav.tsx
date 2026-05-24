"use client";

import Link from "next/link";
import { useAccount } from "wagmi";

export function BottomNav() {
  const { isConnected } = useAccount();

  if (!isConnected) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-stadium/95 px-3 py-2 text-center text-xs text-chalk/70 md:hidden">
        Connect your wallet to enter the Stadium
      </nav>
    );
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-stadium/95 px-3 py-2 md:hidden">
      <div className="flex items-center justify-between text-xs text-chalk">
        <Link href="/feed">Stadium Feed 🏟️</Link>
        <Link href="/upload">Enter the Pitch ⚽</Link>
        <Link href="/passport">Fan Passport 🛂</Link>
        <Link href="/earnings">Goal Earnings 💳</Link>
        <Link href="/leaderboards">Crowd Roarball</Link>
      </div>
    </nav>
  );
}
