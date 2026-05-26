"use client";

import { useRouter } from "next/navigation";

export function HeroSection() {
  const router = useRouter();

  return (
    <section className="relative z-20 mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center gap-8 px-4 text-center">
      <h1 className="font-display text-7xl font-extrabold italic text-floodlight md:text-8xl">
        Roarball
      </h1>
      <p className="max-w-2xl text-lg text-chalk/90 font-medium">
        Where football attention becomes creator revenue.
      </p>
      <p className="max-w-3xl text-sm text-chalk/80 md:text-base">
        First 2 minutes free, 0.001 USDC/sec after.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => router.push("/stadium")}
          className="px-8 py-3 rounded-xl bg-[var(--country-accent,#FFCE00)] text-black font-bold text-sm hover:brightness-110 transition-all"
        >
          ENTER THE STADIUM
        </button>
        <button
          onClick={() => router.push("/stadium")}
          className="px-8 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-all"
        >
          STADIUM FEED 🏟️
        </button>
      </div>
    </section>
  );
}
