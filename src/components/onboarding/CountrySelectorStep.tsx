"use client";

import { WC2026_TEAMS } from "@/lib/data/wc2026-teams";
import { useOnboarding } from "@/context/OnboardingContext";

export function CountrySelectorStep() {
  const { selectedTeam, selectTeam } = useOnboarding();

  return (
    <section className="min-h-screen bg-[#0a0a0f] px-4 py-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <h1 className="text-center text-3xl font-bold text-white">Choose Your Nation</h1>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
          {WC2026_TEAMS.map((team) => {
            const active = selectedTeam?.code === team.code;
            return (
              <button
                key={team.code}
                onClick={() => selectTeam(team)}
                className="rounded-2xl border p-3 text-left backdrop-blur-xl transition"
                style={{
                  borderColor: active ? team.colors.accent : "rgba(255,255,255,0.08)",
                  boxShadow: active ? `0 0 18px ${team.colors.accent}` : "none",
                  background: "rgba(255,255,255,0.03)",
                }}
              >
                <div className="text-3xl">{team.flagEmoji}</div>
                <p className="mt-2 text-sm font-semibold text-white">{team.name}</p>
                <span className="mt-1 inline-block rounded-full border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-white/70">
                  {team.confederation}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
