"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabase/singleton";
import { xLayerPublicClient } from "@/lib/xlayer/client";
import { ADDRESSES, contractsConfigured } from "@/lib/xlayer/addresses";
import { WATCH_LEADERBOARD_ABI } from "@/lib/xlayer/abis";

// ── On-chain leaderboard (per-country, per-week) ──────────────────────────────

export interface OnChainFanEntry {
  wallet: string;
  watchSeconds: bigint;
  countryCode: string;
  rank: number;
}

/**
 * Read the on-chain leaderboard for a specific country and week from
 * WatchLeaderboard.getBoard() on X Layer.
 *
 * Returns [] if contracts are not configured or the board is empty.
 */
export function useOnChainLeaderboard(
  weekId: bigint | null,
  countryCode: string | null
): { board: OnChainFanEntry[]; loading: boolean; error: string | null } {
  const [board, setBoard] = useState<OnChainFanEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!weekId || !countryCode || !contractsConfigured()) {
      setBoard([]);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    xLayerPublicClient
      .readContract({
        address: ADDRESSES.WATCH_LEADERBOARD,
        abi: WATCH_LEADERBOARD_ABI,
        functionName: "getBoard",
        args: [weekId, countryCode],
      })
      .then((entries) => {
        if (cancelled) return;
        const typed = entries as Array<{
          wallet: `0x${string}`;
          watchSeconds: bigint;
          countryCode: string;
        }>;
        setBoard(
          typed.map((e, i) => ({
            wallet: e.wallet,
            watchSeconds: e.watchSeconds,
            countryCode: e.countryCode,
            rank: i + 1,
          }))
        );
      })
      .catch((err) => {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : "Failed to read leaderboard";
        console.error("[useOnChainLeaderboard]", msg);
        setError(msg);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [weekId, countryCode]);

  return { board, loading, error };
}

/**
 * Read the current week ID from the WatchLeaderboard contract.
 */
export function useCurrentWeekId(): bigint | null {
  const [weekId, setWeekId] = useState<bigint | null>(null);

  useEffect(() => {
    if (!contractsConfigured()) return;

    xLayerPublicClient
      .readContract({
        address: ADDRESSES.WATCH_LEADERBOARD,
        abi: WATCH_LEADERBOARD_ABI,
        functionName: "currentWeekId",
        args: [],
      })
      .then((id) => setWeekId(id as bigint))
      .catch((err) => console.error("[useCurrentWeekId]", err));
  }, []);

  return weekId;
}

// ── Supabase leaderboard (global creators/fans/countries — existing) ──────────

export function useLeaderboard() {
  const supabase = getSupabaseClient();
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
        { rank: 1, country: "🇧🇷 Brazil", supporters: 0, paidSeconds: 0, leading: true },
      ];

      const fans = (data ?? []).map((p: any, idx: number) => ({
        rank: idx + 1,
        handle: `@${p.handle || p.display_name}`,
        country: p.country_code || "🌍",
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
