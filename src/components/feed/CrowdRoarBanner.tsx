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
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white/[0.01] border border-white/5 rounded-2xl p-3 text-xs w-full">
      <div className="flex flex-col gap-1 p-3 bg-white/[0.03] border border-white/5 rounded-xl backdrop-blur-md shadow-inner">
        <span className="text-white/40 uppercase tracking-wider text-[10px] font-medium flex items-center gap-1 select-none">
          <span>💰</span> Rewards Pool
        </span>
        <span className="text-white font-bold text-sm text-[var(--country-accent,#FFCC00)] drop-shadow-[0_0_8px_rgba(255,204,0,0.2)]">
          {Number(poolUsdc).toFixed(2)} USDC
        </span>
      </div>

      <div className="flex flex-col gap-1 p-3 bg-white/[0.03] border border-white/5 rounded-xl backdrop-blur-md shadow-inner">
        <span className="text-white/40 uppercase tracking-wider text-[10px] font-medium flex items-center gap-1 select-none">
          <span>👁️</span> Total Watchtime
        </span>
        <span className="text-white font-bold text-sm">
          {Number(totalWatchSeconds).toLocaleString()}s
        </span>
      </div>

      <div className="flex flex-col gap-1 p-3 bg-white/[0.03] border border-white/5 rounded-xl backdrop-blur-md shadow-inner">
        <span className="text-white/40 uppercase tracking-wider text-[10px] font-medium flex items-center gap-1 select-none">
          <span>🌍</span> Top Country
        </span>
        <span className="text-white font-bold text-sm flex items-center gap-1.5 truncate">
          <span className="truncate">{topCountryName}</span>
          <CountryFlag code={topCountryCode} className="w-4 h-2.5 object-cover rounded-sm shadow-sm inline-block flex-shrink-0" />
        </span>
      </div>

      <div className="flex flex-col gap-1 p-3 bg-white/[0.03] border border-white/5 rounded-xl backdrop-blur-md shadow-inner">
        <span className="text-white/40 uppercase tracking-wider text-[10px] font-medium flex items-center gap-1 select-none">
          <span>🔥</span> Top Creator
        </span>
        <span className="text-white font-bold text-sm truncate text-[var(--country-accent,#FFCC00)]">
          {topCreator}
        </span>
      </div>
    </div>
  );
}
