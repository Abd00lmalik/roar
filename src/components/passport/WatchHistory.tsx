import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { EmptyState } from "@/components/ui/EmptyState";

interface WatchHistoryProps {
  profileId?: string;
}

export function WatchHistory({ profileId }: WatchHistoryProps) {
  const supabase = createClient();
  const { data: sessions, isLoading } = useQuery({
    queryKey: ["watch_sessions", profileId],
    queryFn: async () => {
      if (!profileId || !supabase) return [];
      const { data, error } = await supabase
        .from("watch_sessions")
        .select("*, videos(*)")
        .eq("viewer_profile_id", profileId);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!profileId,
  });

  return (
    <div className="glass-panel p-4 space-y-3">
      <h3 className="font-semibold text-chalk">Watch History</h3>
      {isLoading ? (
        <p className="text-xs text-white/50">Loading watch history...</p>
      ) : !sessions || sessions.length === 0 ? (
        <EmptyState
          icon="🛂"
          heading="Your passport is new"
          body="Start watching matches to build your fan record."
        />
      ) : (
        <div className="space-y-2">
          {sessions.map((session: any) => (
            <div key={session.id} className="text-sm text-chalk/80">
              {session.videos?.title || "Unknown Match"} · {session.billable_seconds} paid sec · {Number(session.amount_usdc || 0).toFixed(3)} USDC
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
