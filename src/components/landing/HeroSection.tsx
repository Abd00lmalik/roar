import Link from "next/link";
import { FootballButton } from "@/components/shared/FootballButton";
import { CountryPreviewCards } from "@/components/landing/CountryPreviewCards";

export function HeroSection() {
  return (
    <section className="relative z-20 mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center gap-8 px-4 text-center">
      <h1 className="font-display text-7xl font-extrabold italic text-floodlight md:text-8xl">
        Roar
      </h1>
      <p className="max-w-2xl text-lg text-chalk/90">
        Where football attention becomes creator revenue.
      </p>
      <p className="max-w-3xl text-sm text-chalk/80 md:text-base">
        Watch clips, reactions, previews, and fan shows. Your first 2 minutes are free.
        After that, pay only 0.001 USDC per second. Every second helps creators earn from real attention.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href="/onboarding">
          <FootballButton>Enter the Stadium</FootballButton>
        </Link>
        <Link href="/feed">
          <FootballButton variant="secondary">Explore the Feed</FootballButton>
        </Link>
      </div>
      <CountryPreviewCards />
    </section>
  );
}
