"use client";

import { useState, useEffect, useCallback } from "react";
import { getSupabaseClient } from "@/lib/supabase/singleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAccount } from "wagmi";
import { useUserProfile } from "@/hooks/useUserProfile";

const TAGS = ["Tactical", "Banter", "Hot Take", "Disagree"] as const;
type TakeTag = typeof TAGS[number];

interface MatchTakesProps {
  videoId: string;
}

export function MatchTakes({ videoId }: MatchTakesProps) {
  const { isConnected } = useAccount();
  const { data: viewerProfile } = useUserProfile();
  const [body,    setBody]    = useState("");
  const [tag,     setTag]     = useState<TakeTag>("Banter");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [takes,   setTakes]   = useState<any[]>([]);

  const fetchTakes = useCallback(async () => {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    const { data } = await supabase
      .from("match_takes")
      .select("*, profiles:author_id(display_name, handle)")
      .eq("video_id", videoId)
      .order("created_at", { ascending: false });
    if (data) {
      setTakes(data);
    }
  }, [videoId]);

  useEffect(() => {
    fetchTakes();
  }, [fetchTakes]);

  const submitTake = async () => {
    if (!body.trim()) return;
    if (body.length > 500) {
      setError("Match takes must be 500 characters or fewer.");
      return;
    }
    setLoading(true);
    setError(null);

    const supabase = getSupabaseClient();
    if (!supabase) {
      setError("Database is not configured.");
      setLoading(false);
      return;
    }
    const { error: dbError } = await supabase
      .from("match_takes")
      .insert({ video_id: videoId, author_id: viewerProfile?.id, body: body.trim(), tag });

    setLoading(false);
    if (dbError) {
      setError("Failed to post your take. Try again.");
    } else {
      setBody("");
      fetchTakes();
    }
  };

  return (
    <section className="glass-panel rounded-2xl p-4 space-y-3">
      <h2 className="text-base font-semibold text-chalk">Match Takes</h2>

      {/* Tag selector — exactly four options, no free-text category */}
      <div className="flex gap-2 flex-wrap">
        {TAGS.map((t) => (
          <button
            key={t}
            onClick={() => setTag(t)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              tag === t
                ? "bg-[var(--country-accent)] text-black"
                : "bg-white/[0.06] text-white/60 hover:bg-white/[0.10]"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        maxLength={500}
        rows={3}
        placeholder={isConnected ? "Drop your match take..." : "Connect wallet to post a match take..."}
        disabled={!isConnected}
        className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] p-3 text-sm text-chalk placeholder-white/30 resize-none focus:outline-none focus:ring-1 focus:ring-[var(--country-accent)] disabled:opacity-50"
      />

      {error && <p className="text-red-400 text-xs">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          onClick={submitTake}
          disabled={loading || !body.trim() || !isConnected}
          className="px-4 py-2 rounded-xl bg-[var(--country-accent)] text-black text-sm font-semibold disabled:opacity-40 transition-opacity"
        >
          {loading ? "Posting..." : "Post Take"}
        </button>
        {!isConnected && (
          <span className="text-xs text-white/40">Connect wallet to join</span>
        )}
      </div>

      {/* Render takes list */}
      <div className="mt-4 space-y-3 pt-3 border-t border-white/5">
        {takes.length === 0 ? (
          <EmptyState
            icon="🎙️"
            heading="The stands are quiet"
            body="Be the first to post a match take."
          />
        ) : (
          takes.map((take) => (
            <div key={take.id} className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl space-y-1">
              <div className="flex justify-between items-center text-xs text-white/40">
                <span className="font-semibold text-white/65">
                  {take.profiles?.display_name || "Anonymous"} (@{take.profiles?.handle || "user"})
                </span>
                <span className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] text-[var(--country-accent)] font-medium">
                  {take.tag}
                </span>
              </div>
              <p className="text-sm text-white/80">{take.body}</p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
