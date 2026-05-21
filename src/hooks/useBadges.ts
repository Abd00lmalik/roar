"use client";

import { useQuery } from "@tanstack/react-query";
import { badgesSeed } from "@/lib/mockData";

export function useBadges() {
  return useQuery({
    queryKey: ["badges"],
    queryFn: async () =>
      badgesSeed.map((badge, index) => ({
        ...badge,
        claimed: index === 0,
      })),
  });
}
