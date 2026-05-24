"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export function useLeaderboard() {
  const supabase = createClient();
  return useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      if (!supabase) {
        return {
          countries: [],
          creators: [],
          fans: [],
          stats: {
            total_watch_seconds: 0,
            total_billable_seconds: 0,
            total_volume_usdc: 0,
            fan_rewards_pool_usdc: 0,
            platform_revenue_usdc: 0,
          },
        };
      }
      const { data, error } = await supabase
        .from("profiles")
        .select("id, display_name, total_earned, country_code, handle")
        .order("total_earned", { ascending: false })
        .limit(20);

      if (error) throw error;

      const creators = (data ?? []).map((p: any, idx: number) => ({
        rank: idx + 1,
        handle: `@${p.handle || p.display_name}`,
        earnings: Number(p.total_earned || 0),
        paidSeconds: 0,
        followers: 0,
      }));

      const countries = [
        { rank: 1, country: "🇩🇪 Germany", supporters: 1, paidSeconds: 0, leading: true },
      ];

      const fans = (data ?? []).map((p: any, idx: number) => ({
        rank: idx + 1,
        handle: `@${p.handle || p.display_name}`,
        country: p.country_code || "🇩🇪",
        watchSeconds: 0,
        badges: 0,
        score: "💎",
      }));

      return {
        countries,
        creators,
        fans,
        stats: {
          total_watch_seconds: 0,
          total_billable_seconds: 0,
          total_volume_usdc: 0,
          fan_rewards_pool_usdc: 0,
          platform_revenue_usdc: 0,
        },
      };
    },
  });
}
