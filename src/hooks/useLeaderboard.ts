"use client";

import { useQuery } from "@tanstack/react-query";
import { platformStatsSeed } from "@/lib/mockData";

export function useLeaderboard() {
  return useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => ({
      countries: [
        { rank: 1, country: "🇳🇬 Nigeria", supporters: 1204, paidSeconds: 22400, leading: true },
        { rank: 2, country: "🇧🇷 Brazil", supporters: 987, paidSeconds: 18100, leading: false },
        { rank: 3, country: "🇲🇦 Morocco", supporters: 743, paidSeconds: 15200, leading: false },
      ],
      creators: [
        { rank: 1, handle: "@NaijaStand", earnings: 12.4, paidSeconds: 14600, followers: 842 },
        { rank: 2, handle: "@TacticalGhost", earnings: 9.87, paidSeconds: 11600, followers: 612 },
      ],
      fans: [{ rank: 1, handle: "@MatchdayMusa", country: "🇳🇬", watchSeconds: 4200, badges: 8, score: "💎" }],
      stats: platformStatsSeed,
    }),
  });
}
