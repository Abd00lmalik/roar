"use client";

import { useState } from "react";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { CountryLeaderboard } from "@/components/leaderboards/CountryLeaderboard";
import { CreatorLeaderboard } from "@/components/leaderboards/CreatorLeaderboard";
import { FanLeaderboard } from "@/components/leaderboards/FanLeaderboard";
import { useThemeStore } from "@/store/themeStore";

export default function LeaderboardsPage() {
  const [tab, setTab] = useState<"countries" | "creators" | "fans">("countries");
  const { data } = useLeaderboard();
  const storedCode = useThemeStore((s) => s.countryCode);
  const countryCode = storedCode ?? "BR";


  if (!data) return null;

  const tabStyle = (active: boolean) => ({
    padding: "6px 16px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    border: "none",
    transition: "all 0.15s",
    background: active ? "var(--country-accent, #e94560)" : "rgba(255,255,255,0.06)",
    color: active ? "#fff" : "rgba(255,255,255,0.5)",
  });

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8">
      <h1 className="font-display text-4xl font-bold text-white">Global Rankings</h1>

      <div className="flex gap-2">
        <button style={tabStyle(tab === "countries")} onClick={() => setTab("countries")}>
          🌍 Countries
        </button>
        <button style={tabStyle(tab === "creators")} onClick={() => setTab("creators")}>
          🎬 Creators
        </button>
        <button style={tabStyle(tab === "fans")} onClick={() => setTab("fans")}>
          🏆 Fans
        </button>
      </div>

      {tab === "countries" && (
        <CountryLeaderboard
          countryCode={countryCode ?? "BR"}
          prizePoolUSDC={0}
        />
      )}
      {tab === "creators" && <CreatorLeaderboard rows={data.creators} />}
      {tab === "fans" && <FanLeaderboard rows={data.fans} />}
    </div>
  );
}
