"use client";

import { useQuery } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabase/singleton";

export function useBadges(userId?: string) {
  const supabase = getSupabaseClient();
  return useQuery({
    queryKey: ["badges", userId],
    queryFn: async () => {
      if (!userId || !supabase) return [];

      const { data: userBadges, error: ubError } = await supabase
        .from("user_badges")
        .select("badge_id")
        .eq("profile_id", userId);

      if (ubError) throw ubError;
      const claimedBadgeIds = new Set((userBadges ?? []).map((ub: any) => ub.badge_id));

      const { data: allBadges, error: bError } = await supabase
        .from("badges")
        .select("*");

      if (bError) throw bError;

      return (allBadges ?? []).map((b: any) => ({
        id: b.id,
        slug: b.slug,
        name: b.name,
        description: b.description,
        icon: b.icon,
        claimed: claimedBadgeIds.has(b.id),
      }));
    },
    enabled: !!userId,
  });
}
