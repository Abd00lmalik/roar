"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { StadiumBackground } from "@/components/landing/StadiumBackground";

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-black flex flex-col items-center justify-center gap-8">
      <StadiumBackground />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 z-0" />
      
      <div className="relative z-10 flex flex-col items-center gap-6 px-4">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <Image
            src="/logo.png"
            alt="RoarTube"
            width={80}
            height={80}
            priority
            className="rounded-full border border-white/10"
          />
          <h1 className="text-white font-black text-4xl italic tracking-tight">
            Roar<span className="text-[var(--country-accent,#FFCE00)]">Tube</span>
          </h1>
        </div>
        
        <p className="text-white/70 text-lg text-center max-w-sm font-medium">
          Where football attention becomes creator revenue.
        </p>

        {/* Single CTA */}
        <button
          onClick={() => router.push("/onboarding")}
          className="mt-4 px-12 py-5 text-xl font-bold text-black rounded-2xl transition-all duration-200 hover:scale-105 active:scale-95 shadow-2xl cursor-pointer"
          style={{ background: "var(--country-accent, #FFCC00)" }}
        >
          Enter Stadium
        </button>
      </div>
    </main>
  );
}
