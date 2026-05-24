"use client";

import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { createClient } from "@/lib/supabase/client";

export function useUserProfile() {
  const { address } = useAccount();
  const supabase = createClient();

  return useQuery({
    queryKey: ["profile", "me", address],
    queryFn: async () => {
      if (!address || !supabase) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("wallet_address", address)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // Profile not found, return null (handles onboarding redirect or similar)
          return null;
        }
        throw error;
      }
      return data;
    },
    enabled: !!address,
  });
}
