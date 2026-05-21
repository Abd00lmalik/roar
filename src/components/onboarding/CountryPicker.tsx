"use client";

import { COUNTRIES } from "@/lib/theme/countries";
import { TrophyIcon } from "@/components/shared/TrophyIcon";
import type { CountryCode } from "@/types";

export function CountryPicker({
  selected,
  onSelect,
}: {
  selected: CountryCode | null;
  onSelect: (code: CountryCode) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {COUNTRIES.map((country) => {
        const active = selected === country.code;
        return (
          <button
            key={country.code}
            onClick={() => onSelect(country.code as CountryCode)}
            className={`rounded-lg border p-4 text-left transition ${
              active ? "border-yellow-400 ring-1 ring-yellow-400" : "border-white/10"
            }`}
            style={{
              backgroundImage: `linear-gradient(135deg, ${country.gradientFrom}, ${country.gradientTo})`,
            }}
          >
            <div className="mb-2 text-3xl">{country.flag}</div>
            <div className="font-semibold text-black">{country.name}</div>
            {active && (
              <div className="mt-2 inline-flex items-center gap-1 text-xs text-black">
                <TrophyIcon /> Selected
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
