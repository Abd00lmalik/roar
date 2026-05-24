"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { COUNTRY_MAP } from "@/lib/theme/countries";

export function CrowdRoarBanner() {
  const supabase = createClient();

  const { data } = useQuery({
    queryKey: ["crowd-roar-stats"],
    queryFn: async () => {
      if (!supabase) return null;

      const [statsRes, profilesRes] = await Promise.all([
        supabase.from("platform_stats").select("*").eq("id", 1).maybeSingle(),
        supabase.from("profiles").select("display_name, handle, country_code, total_earned").order("total_earned", { ascending: false }).limit(20),
      ]);

      return {
        stats: statsRes.data,
        profiles: profilesRes.data || [],
      };
    },
  });

  const totalWatchSeconds = data?.stats?.total_watch_seconds ?? 0;
  const poolUsdc = data?.stats?.fan_rewards_pool_usdc ?? 0;

  // Determine top creator (highest total_earned)
  const topCreatorProfile = data?.profiles?.[0];
  const topCreator = topCreatorProfile
    ? `@${topCreatorProfile.handle || topCreatorProfile.display_name}`
    : "@TacticalGhost";

  // Determine top country (by count of profiles in the fetched list or default to FR)
  let topCountryText = "France 🇫🇷";
  if (data?.profiles && data.profiles.length > 0) {
    const countryCounts: Record<string, number> = {};
    data.profiles.forEach((p: any) => {
      if (p.country_code) {
        countryCounts[p.country_code] = (countryCounts[p.country_code] || 0) + 1;
      }
    });
    let bestCode = "";
    let maxCount = 0;
    Object.entries(countryCounts).forEach(([code, count]) => {
      if (count > maxCount) {
        maxCount = count;
        bestCode = code;
      }
    });
    if (bestCode) {
      const countryConfig = COUNTRY_MAP.get(bestCode);
      if (countryConfig) {
        topCountryText = `${countryConfig.name} ${countryConfig.flag}`;
      }
    }
  }

  return (
    <div className="glass-panel flex flex-wrap items-center justify-between gap-2 p-4 text-sm">
      <span>🔥 Crowd Roarball</span>
      <span>👁 {Number(totalWatchSeconds).toLocaleString()} seconds watched today</span>
      <span>Top Country: {topCountryText}</span>
      <span>Top Creator: {topCreator}</span>
      <span>Pool: {Number(poolUsdc).toFixed(2)} USDC</span>
    </div>
  );
}
