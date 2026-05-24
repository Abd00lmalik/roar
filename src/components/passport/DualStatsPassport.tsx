"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { COUNTRY_MAP } from "@/lib/theme/countries";
import { useState } from "react";

interface DualStatsPassportProps {
  profile: any;
}

export function DualStatsPassport({ profile }: DualStatsPassportProps) {
  const supabase = createClient();
  const [done] = useState(false);

  const { data: sessions } = useQuery({
    queryKey: ["watch_sessions_all", profile?.id],
    queryFn: async () => {
      if (!profile?.id || !supabase) return [];
      const { data, error } = await supabase
        .from("watch_sessions")
        .select("video_id, amount_usdc")
        .eq("viewer_profile_id", profile.id);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!profile?.id,
  });

  const matchesWatched = new Set(sessions?.map((s: any) => s.video_id) || []).size;
  const usdcSpent = sessions?.reduce((sum: number, s: any) => sum + Number(s.amount_usdc || 0), 0) || 0;

  const { data: standSize } = useQuery({
    queryKey: ["fan_stand_size", profile?.country_code],
    queryFn: async () => {
      if (!profile?.country_code || !supabase) return 0;
      const { count, error } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("country_code", profile.country_code);
      if (error) throw error;
      return count || 0;
    },
    enabled: !!profile?.country_code,
  });

  const { data: videosOnPitch } = useQuery({
    queryKey: ["creator_videos_count", profile?.id],
    queryFn: async () => {
      if (!profile?.id || !supabase) return 0;
      const { count, error } = await supabase
        .from("videos")
        .select("*", { count: "exact", head: true })
        .eq("owner_profile_id", profile.id);
      if (error) throw error;
      return count || 0;
    },
    enabled: !!profile?.id,
  });

  if (!profile) {
    return (
      <div className="rounded-xl p-4 bg-white/5 border border-white/10 text-chalk text-sm">
        Connect your wallet to see your Fan Passport 🛂
      </div>
    );
  }

  const country = profile.country_code ? COUNTRY_MAP.get(profile.country_code) : null;
  const flagEmoji = country ? country.flag : "🏳️";

  return (
    <div className="glass-panel overflow-hidden rounded-xl border border-white/10 bg-stadium/85">
      <div className="border-b border-white/10 px-6 py-4 bg-gradient-to-r from-stadium/90 via-black/40 to-stadium/90">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-wide text-floodlight">FAN PASSPORT 🛂</h2>
            <p className="font-mono text-xs text-chalk/50">{profile.wallet_address}</p>
          </div>
          <span className="text-4xl" title={profile.country_name}>{flagEmoji}</span>
        </div>
      </div>

      <div className="grid divide-y divide-white/10 md:grid-cols-2 md:divide-y-0 md:divide-x md:divide-white/10">
        <div className="p-6 space-y-4">
          <h3 className="font-display text-lg font-bold text-amber-400 tracking-wider">AS A FAN</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center bg-black/20 p-3 rounded">
              <span className="text-sm text-chalk/70">Matches Watched</span>
              <span className="font-mono text-lg font-semibold text-white">{matchesWatched}</span>
            </div>
            <div className="flex justify-between items-center bg-black/20 p-3 rounded">
              <span className="text-sm text-chalk/70">USDC Spent</span>
              <span className="font-mono text-lg font-semibold text-white">{usdcSpent.toFixed(3)} USDC</span>
            </div>
            <div className="flex justify-between items-center bg-black/20 p-3 rounded">
              <span className="text-sm text-chalk/70">Fan Stand Size</span>
              <span className="font-mono text-lg font-semibold text-white">{standSize} members</span>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-display text-lg font-bold text-green-400 tracking-wider">AS A CREATOR</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-black/20 p-3 rounded">
                <span className="text-sm text-chalk/70">Videos on Pitch</span>
                <span className="font-mono text-lg font-semibold text-white">{videosOnPitch}</span>
              </div>
              <div className="flex justify-between items-center bg-black/20 p-3 rounded">
                <span className="text-sm text-chalk/70">Total Earned</span>
                <span className="font-mono text-lg font-semibold text-white">{(Number(profile.total_earned || 0)).toFixed(4)} USDC</span>
              </div>
              <div className="flex justify-between items-center bg-black/20 p-3 rounded">
                <span className="text-sm text-chalk/70">Claimable Now</span>
                <span className="font-mono text-lg font-bold text-green-400">0.0000 USDC</span>
              </div>
            </div>
          </div>

          {done && <p className="text-center text-xs text-green-400">Withdrawal successful.</p>}
        </div>
      </div>
    </div>
  );
}
