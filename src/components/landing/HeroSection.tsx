"use client";

import { useRouter } from "next/navigation";

export function HeroSection() {
  const router = useRouter();

  return (
    <section className="relative z-20 mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center gap-8 px-4 text-center">
      <h1 className="font-display text-7xl font-extrabold italic text-floodlight md:text-8xl">
        RoarTube
      </h1>
      <p className="max-w-2xl text-lg text-chalk/90 font-medium">
        Where football attention becomes creator revenue.
      </p>
      <p className="max-w-3xl text-sm text-chalk/80 md:text-base">
        First 2 minutes free, 0.0001 USDC/sec after.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => router.push("/onboarding")}
          className="px-10 py-4 rounded-2xl font-black text-black text-lg
            bg-[var(--country-accent,#FFCE00)]
            hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,206,0,0.3)]"
        >
          ENTER THE STADIUM
        </button>
      </div>
    </section>
  );
}
