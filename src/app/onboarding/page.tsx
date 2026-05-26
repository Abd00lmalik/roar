"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useThemeStore } from "@/store/themeStore";
import { COUNTRIES, CountryConfig } from "@/lib/theme/countries";

export default function OnboardingPage() {
  const router = useRouter();
  const setCountryCode = useThemeStore((s) => s.setCountryCode);
  const [selected, setSelected] = useState<CountryConfig | null>(null);

  const handleCountrySelect = (team: CountryConfig) => {
    setSelected(team);

    // 1. Inject CSS variables immediately for real-time visual feedback
    const root = document.documentElement;
    root.style.setProperty("--country-from", team.gradientFrom);
    root.style.setProperty("--country-via", team.gradientVia);
    root.style.setProperty("--country-to", team.gradientTo);
    root.style.setProperty("--country-accent", team.accent);
  };

  const handleConfirm = () => {
    if (!selected) return;

    // 2. Persist to localStorage
    localStorage.setItem("roar_selected_team", JSON.stringify(selected));

    // 3. Set cookies so middleware and layout scripts can read them server-side
    document.cookie = `roar_selected_team=${selected.code}; path=/; max-age=${60 * 60 * 24 * 365}`;
    document.cookie = `supporter_nation=${selected.code}; path=/; max-age=${60 * 60 * 24 * 365}`;

    // 4. Update local theme store
    setCountryCode(selected.code);

    // 5. Navigate directly to stadium feed
    router.push("/stadium");
  };

  return (
    <div className="min-h-screen bg-[#080810] flex flex-col items-center px-4 py-12">
      {/* Header */}
      <div className="text-center pb-8 space-y-2">
        <h1 className="text-4xl md:text-5xl font-black text-white font-display uppercase tracking-tight">
          Choose Your Nation
        </h1>
        <p className="text-white/50 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
          Your nation&apos;s colors will follow you throughout the entire stadium.
        </p>
      </div>

      {/* Grid containing all 48 qualifiers */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 w-full max-w-4xl max-h-[60vh] overflow-y-auto pr-1">
        {COUNTRIES.map((country) => (
          <button
            key={country.code}
            onClick={() => handleCountrySelect(country)}
            className={`
              flex flex-col items-center justify-center gap-1.5
              p-3 rounded-xl border transition-all duration-200 cursor-pointer
              ${selected?.code === country.code
                ? "border-[var(--country-accent)] bg-white/[0.12] scale-105 shadow-[0_0_20px_rgba(255,206,0,0.15)]"
                : "border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/[0.15]"
              }
            `}
          >
            {/* FLAG EMOJI — large and prominent */}
            <span className="text-4xl leading-none select-none">{country.flag}</span>
            {/* Country name — small and centered */}
            <span className="text-white text-[10px] font-semibold text-center leading-tight tracking-wide line-clamp-1">
              {country.name}
            </span>
          </button>
        ))}
      </div>

      {/* Confirm Selection CTA */}
      {selected && (
        <div className="mt-8 flex flex-col items-center gap-2 animate-fade-in">
          <p className="text-white/70 text-xs font-mono">
            Selected: <span className="text-[var(--country-accent)] font-bold">{selected.name} {selected.flag}</span>
          </p>
          <button
            onClick={handleConfirm}
            className="px-10 py-4 rounded-2xl font-black text-black text-lg uppercase tracking-wider
              bg-[var(--country-accent,#FFCE00)] cursor-pointer
              hover:scale-105 transition-transform duration-200 shadow-[0_0_30px_rgba(255,206,0,0.3)]"
          >
            CONFIRM SELECTION
          </button>
        </div>
      )}
    </div>
  );
}
