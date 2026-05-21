import { CountryGradientWrapper } from "@/components/shared/CountryGradientWrapper";

export function PassportHeader() {
  return (
    <CountryGradientWrapper>
      <div className="rounded-xl p-4 text-black">
        <p className="text-sm">TacticalGhost (@TacticalGhost)</p>
        <p className="text-xs">🇳🇬 Nigeria · Fan since May 2025</p>
      </div>
    </CountryGradientWrapper>
  );
}
