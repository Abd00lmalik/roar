"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { ProfileForm } from "@/components/onboarding/ProfileForm";
import { useThemeStore } from "@/store/themeStore";
import { COUNTRIES, CountryConfig } from "@/lib/theme/countries";
import { createClient } from "@/lib/supabase/client";

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const setCountryCode = useThemeStore((s) => s.setCountryCode);

  const [step, setStep] = useState(1);
  const [selectedTeam, setSelectedTeam] = useState<CountryConfig | null>(null);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(false);

  const handleCountrySelect = (team: CountryConfig) => {
    // 1. Inject CSS vars immediately
    const root = document.documentElement;
    root.style.setProperty("--country-from", team.gradientFrom);
    root.style.setProperty("--country-via", team.gradientVia);
    root.style.setProperty("--country-to", team.gradientTo);
    root.style.setProperty("--country-accent", team.accent);

    // 2. Persist to localStorage
    localStorage.setItem("roar_selected_team", JSON.stringify(team));

    // 3. Set cookies so middleware and layout scripts can read them (server-side)
    document.cookie = `roar_selected_team=${team.code}; path=/; max-age=${60 * 60 * 24 * 365}`;
    document.cookie = `supporter_nation=${team.code}; path=/; max-age=${60 * 60 * 24 * 365}`;

    // 4. Advance to next step
    setSelectedTeam(team);
    setStep(2);
  };

  const handleProfileSubmit = async (payload: { displayName: string; handle: string; bio: string }) => {
    if (!selectedTeam) return;
    setLoading(true);

    try {
      // 1. Update Supabase profile details
      const supabase = createClient();
      if (supabase && session?.user?.id) {
        await supabase
          .from("profiles")
          .update({
            display_name: payload.displayName,
            handle: payload.handle,
            bio: payload.bio,
            country_code: selectedTeam.code,
            country_name: selectedTeam.name,
          })
          .eq("id", session.user.id);
      }

      // 2. Call provision API (wallet + passport minting)
      await fetch("/api/auth/provision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          countryCode: selectedTeam.code,
        }),
      });

      // 3. Update theme store & redirect
      setCountryCode(selectedTeam.code);
      router.push("/stadium");
    } catch (e) {
      console.error("[Onboarding] submission failed:", e);
      // Fallback redirect
      router.push("/stadium");
    } finally {
      setLoading(false);
    }
  };

  const filteredTeams = COUNTRIES.filter((team) => {
    if (filter === "All") return true;
    return team.confederation === filter;
  });

  if (step === 1) {
    return (
      <div className="min-h-screen bg-[#080810] flex flex-col px-4">
        {/* Header */}
        <div className="text-center pt-16 pb-8">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3 font-display">
            Choose Your Nation
          </h1>
          <p className="text-white/50 text-lg max-w-xl mx-auto leading-relaxed">
            Your country colours will follow you through the entire stadium
          </p>
        </div>

        {/* Confederation filter tabs */}
        <div className="flex gap-2 justify-center flex-wrap mb-8">
          {["All", "UEFA", "CAF", "AFC", "CONMEBOL", "CONCACAF", "OFC"].map((conf) => (
            <button
              key={conf}
              onClick={() => setFilter(conf)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all cursor-pointer ${
                filter === conf
                  ? "bg-white text-black font-bold shadow-lg"
                  : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              {conf}
            </button>
          ))}
        </div>

        {/* Country grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 pb-16 max-w-6xl mx-auto w-full">
          {filteredTeams.map((team) => (
            <button
              key={team.code}
              onClick={() => handleCountrySelect(team)}
              className="glass-panel p-5 flex flex-col items-center gap-3 hover:scale-105 active:scale-95 transition-all duration-200 hover:border-white/20 group cursor-pointer bg-white/[0.02]"
            >
              <span className="text-5xl md:text-6xl group-hover:scale-110 transition-transform">{team.flag}</span>
              <span className="text-white text-sm font-semibold text-center leading-tight">
                {team.name}
              </span>
              <span className="text-white/30 text-xs tracking-wider uppercase">{team.confederation}</span>
              {/* Colour preview strip */}
              <div
                className="w-full h-1 rounded-full mt-2"
                style={{
                  background: `linear-gradient(to right, ${team.gradientFrom}, ${team.accent})`,
                }}
              />
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Step 2: Profile Form
  return (
    <div className="mx-auto w-full max-w-md px-4 py-12 space-y-6">
      <div className="text-center">
        <span className="text-5xl">{selectedTeam?.flag}</span>
        <h1 className="font-display text-4xl font-black italic tracking-tight text-white mt-3">
          Create Fan Passport
        </h1>
        <p className="text-white/50 text-sm mt-1">
          Complete your spectator profile for {selectedTeam?.name}
        </p>
      </div>

      {loading ? (
        <div className="glass-panel p-8 text-center space-y-3 bg-stadium/85">
          <div className="w-8 h-8 border-4 border-[var(--country-accent,#FFCC00)] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-white text-sm font-semibold">Minting on-chain passport...</p>
          <p className="text-white/40 text-xs">Provisioning Circle wallet & setting up L2 node...</p>
        </div>
      ) : (
        <ProfileForm
          countryCode={selectedTeam?.code ?? null}
          onSubmit={handleProfileSubmit}
        />
      )}
    </div>
  );
}
