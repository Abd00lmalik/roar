import { HeroSection } from "@/components/landing/HeroSection";
import { StadiumBackground } from "@/components/landing/StadiumBackground";
import { SoundToggle } from "@/components/landing/SoundToggle";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { StadiumLights } from "@/components/shared/StadiumLights";
import { PitchLines } from "@/components/shared/PitchLines";
import { XLayerBadge } from "@/components/shared/XLayerBadge";

export default function HomePage() {
  return (
    <div className="relative">
      <div className="relative min-h-screen overflow-hidden">
        <StadiumBackground />
        <PitchLines />
        <StadiumLights />
        <HeroSection />
        <SoundToggle />
      </div>
      <HowItWorks />
      <footer className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 pb-8 text-xs text-chalk/70">
        <XLayerBadge />
        <span>Roar © 2025</span>
      </footer>
    </div>
  );
}
