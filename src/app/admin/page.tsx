"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { getSupabaseClient } from "@/lib/supabase/singleton";

export default function AdminPage() {
  const supabase = getSupabaseClient();
  const queryClient = useQueryClient();

  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      if (!supabase) return null;
      const { data, error } = await supabase
        .from("platform_stats")
        .select("*")
        .eq("id", 1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: flaggedVideos, isLoading } = useQuery({
    queryKey: ["admin-flagged-videos"],
    queryFn: async () => {
      if (!supabase) return [];
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .neq("status", "active");
      if (error) throw error;
      return data || [];
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      if (!supabase) return;
      const { error } = await supabase
        .from("videos")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-flagged-videos"] });
    },
  });

  const nukeMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/admin/nuke-demos?key=roartube-admin-2026", {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete demo videos");
      return data;
    },
    onSuccess: (data) => {
      alert(data.message || "Successfully deleted demo videos!");
      queryClient.invalidateQueries({ queryKey: ["admin-flagged-videos"] });
      window.location.reload();
    },
    onError: (err: any) => {
      alert(err.message);
    },
  });

  const totalWatchSeconds = stats?.total_watch_seconds ?? 0;
  const totalBillableSeconds = stats?.total_billable_seconds ?? 0;
  const totalVolumeUsdc = stats?.total_volume_usdc ?? 0;
  const fanRewardsPoolUsdc = stats?.fan_rewards_pool_usdc ?? 0;
  const platformRevenueUsdc = stats?.platform_revenue_usdc ?? 0;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 px-4 py-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h1 className="font-display text-4xl font-bold">RoarTube Admin Panel</h1>
        <div className="flex items-center gap-3">
          <Link
            href="/system/env"
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg text-sm transition-all cursor-pointer"
          >
            Env Health
          </Link>
          <button
            onClick={() => {
              if (confirm("Are you sure you want to delete all demo videos? This cannot be undone.")) {
                nukeMutation.mutate();
              }
            }}
            disabled={nukeMutation.isPending}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-sm transition-all cursor-pointer"
          >
            {nukeMutation.isPending ? "Deleting Demo Videos..." : "Delete All Demo Videos"}
          </button>
        </div>
      </div>
      <section className="glass-panel grid gap-2 p-4 text-sm md:grid-cols-2">
        <p>Total Watch Seconds: {Number(totalWatchSeconds).toLocaleString()}</p>
        <p>Billable Seconds: {Number(totalBillableSeconds).toLocaleString()}</p>
        <p>Volume USDC: {Number(totalVolumeUsdc).toFixed(2)}</p>
        <p>Fan Rewards Pool: {Number(fanRewardsPoolUsdc).toFixed(2)} USDC</p>
        <p>Platform Revenue: {Number(platformRevenueUsdc).toFixed(2)} USDC</p>
      </section>
      <section className="glass-panel space-y-2 p-4 text-sm">
        <h2 className="font-semibold">Flagged Content ({flaggedVideos?.length ?? 0})</h2>
        {isLoading ? (
          <p className="text-chalk/50 text-xs">Loading flagged content...</p>
        ) : !flaggedVideos || flaggedVideos.length === 0 ? (
          <p className="text-chalk/50 text-xs">No flagged content pending review.</p>
        ) : (
          flaggedVideos.map((video: any) => (
            <div key={video.id} className="flex flex-wrap items-center justify-between gap-2 rounded bg-white/5 p-2">
              <span>{video.title} ({video.status})</span>
              <div className="flex gap-2 text-xs">
                <button
                  onClick={() => updateStatusMutation.mutate({ id: video.id, status: "active" })}
                  className="rounded bg-white/10 px-2 py-1 hover:bg-white/20"
                >
                  Approve (Active)
                </button>
                <button
                  onClick={() => updateStatusMutation.mutate({ id: video.id, status: "hidden" })}
                  className="rounded bg-white/10 px-2 py-1 hover:bg-white/20"
                >
                  Hide
                </button>
                <button
                  onClick={() => updateStatusMutation.mutate({ id: video.id, status: "removed" })}
                  className="rounded bg-white/10 px-2 py-1 hover:bg-white/20"
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
