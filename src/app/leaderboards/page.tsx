"use client";

import { useState } from "react";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { CountryLeaderboard } from "@/components/leaderboards/CountryLeaderboard";
import { CreatorLeaderboard } from "@/components/leaderboards/CreatorLeaderboard";
import { FanLeaderboard } from "@/components/leaderboards/FanLeaderboard";

export default function LeaderboardsPage() {
  const [tab, setTab] = useState<"countries" | "creators" | "fans">("countries");
  const { data } = useLeaderboard();

  if (!data) return null;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 px-4 py-6">
      <h1 className="font-display text-4xl font-bold">Global Rankings</h1>
      <div className="flex gap-2">
        <button className="rounded border px-3 py-1" onClick={() => setTab("countries")}>Countries</button>
        <button className="rounded border px-3 py-1" onClick={() => setTab("creators")}>Creators</button>
        <button className="rounded border px-3 py-1" onClick={() => setTab("fans")}>Fans</button>
      </div>
      {tab === "countries" && <CountryLeaderboard rows={data.countries} />}
      {tab === "creators" && <CreatorLeaderboard rows={data.creators} />}
      {tab === "fans" && <FanLeaderboard rows={data.fans} />}
    </div>
  );
}
