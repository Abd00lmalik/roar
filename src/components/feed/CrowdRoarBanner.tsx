"use client";

import { useQuery } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabase/singleton";
import { COUNTRY_MAP } from "@/lib/theme/countries";
import { CountryFlag } from "@/components/ui/CountryFlag";

export function CrowdRoarBanner() {
  const supabase = getSupabaseClient();

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
  let topCountryName = "France";
  let topCountryCode = "FR";
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
        topCountryName = countryConfig.name;
        topCountryCode = countryConfig.code;
      }
    }
  }

  return (
    <div className="glass-panel flex flex-wrap items-center justify-between gap-2 p-4 text-sm">
      <span>🔥 Crowd RoarTube</span>
      <span>👁 {Number(totalWatchSeconds).toLocaleString()} seconds watched today</span>
      <span className="flex items-center gap-1.5">
        Top Country: {topCountryName}
        <CountryFlag code={topCountryCode} className="w-5 h-3.5 object-cover rounded-sm shadow-sm inline-block" />
      </span>
      <span>Top Creator: {topCreator}</span>
      <span>Pool: {Number(poolUsdc).toFixed(2)} USDC</span>
    </div>
  );
}
