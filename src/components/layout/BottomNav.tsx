"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAccount } from "wagmi";

export function BottomNav() {
  const pathname = usePathname();
  const { isConnected } = useAccount();

  const hideNavRoutes = ["/", "/onboarding"];
  if (hideNavRoutes.includes(pathname)) return null;

  if (!isConnected) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-stadium/95 px-3 py-3 text-center text-xs text-chalk/70 md:hidden backdrop-blur-xl">
        Connect your wallet to enter the Stadium 🏟️
      </nav>
    );
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-stadium/95 px-4 py-3 md:hidden backdrop-blur-xl">
      <div className="flex items-center justify-between text-xs text-white/70">
        <Link 
          href="/stadium" 
          className={`hover:text-white transition ${pathname === "/stadium" ? "text-white font-semibold" : ""}`}
        >
          Stadium Feed 🏟️
        </Link>
        <Link 
          href="/upload" 
          className={`hover:text-white transition ${pathname === "/upload" ? "text-white font-semibold" : ""}`}
        >
          Upload 📹
        </Link>
        <Link 
          href="/passport" 
          className={`hover:text-white transition ${pathname === "/passport" ? "text-white font-semibold" : ""}`}
        >
          Passport 🪪
        </Link>
        <Link 
          href="/earnings" 
          className={`hover:text-white transition ${pathname === "/earnings" ? "text-white font-semibold" : ""}`}
        >
          Earnings 💰
        </Link>
        <Link 
          href="/leaderboards" 
          className={`hover:text-white transition ${pathname === "/leaderboards" ? "text-white font-semibold" : ""}`}
        >
          Leaderboards
        </Link>
      </div>
    </nav>
  );
}
