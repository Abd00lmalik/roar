"use client";

import { useRouter } from "next/navigation";

export function HeroSection() {
  const router = useRouter();

  return (
    <section className="relative z-20 mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center gap-8 px-4 text-center">
      <h1 className="font-display text-7xl font-extrabold italic text-floodlight md:text-8xl">
        Roarball
      </h1>

      <p className="max-w-2xl text-lg font-medium text-chalk/90">
        Where football attention becomes creator revenue.
      </p>

      <p className="max-w-3xl text-sm text-chalk/80 md:text-base">
        Start Match highlights, reactions, previews, and fan shows. Your first 2 minutes are free.
        After that, pay only 0.0001 USDC per second.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => router.push("/feed")}
          className="rounded-xl bg-[var(--country-accent,#FFCE00)] px-8 py-3 text-sm font-bold text-black transition-all hover:brightness-110"
        >
          ENTER THE STADIUM
        </button>
        <button
          onClick={() => router.push("/feed")}
          className="rounded-xl bg-white/10 px-8 py-3 text-sm font-bold text-white transition-all hover:bg-white/20"
        >
          STADIUM FEED 🏟️
        </button>
      </div>
    </section>
  );
}
