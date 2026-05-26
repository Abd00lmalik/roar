"use client";

import { getSupabaseClient } from "@/lib/supabase/singleton";
import { useQuery } from "@tanstack/react-query";

interface TopEarningVideosProps {
  profileId?: string;
}

export function TopEarningVideos({ profileId }: TopEarningVideosProps) {
  const supabase = getSupabaseClient();

  const { data: videos, isLoading } = useQuery({
    queryKey: ["top-earning-videos", profileId],
    queryFn: async () => {
      if (!profileId || !supabase) return [];
      const { data, error } = await supabase
        .from("videos")
        .select("id, title, total_billable_seconds, total_watch_seconds")
        .eq("owner_profile_id", profileId)
        .order("total_billable_seconds", { ascending: false })
        .limit(5);

      if (error) throw error;
      return data || [];
    },
    enabled: !!profileId,
  });

  if (isLoading) {
    return <p className="text-xs text-chalk/50">Loading videos...</p>;
  }

  if (!videos || videos.length === 0) {
    return null;
  }

  return (
    <div className="glass-panel p-4 text-sm space-y-2">
      <p className="mb-2 font-semibold">Top Earning Videos</p>
      {videos.map((video: any) => (
        <p key={video.id} className="text-chalk/80">
          {video.title} · {video.total_billable_seconds.toLocaleString()} paid sec
        </p>
      ))}
    </div>
  );
}
