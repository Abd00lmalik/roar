"use client";

import { useQuery } from "@tanstack/react-query";
import { seededProfiles } from "@/lib/mockData";

export function useUserProfile() {
  return useQuery({
    queryKey: ["profile", "me"],
    queryFn: async () => seededProfiles[1],
  });
}
