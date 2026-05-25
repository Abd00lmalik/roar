"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

async function fetchBalance(walletId: string): Promise<number> {
  const response = await fetch(`/api/wallet/balance?walletId=${encodeURIComponent(walletId)}`, {
    method: "GET",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch wallet balance");
  }
  const payload = (await response.json()) as { balance: number };
  return payload.balance;
}

export function useWalletBalance(walletId: string | null, enabled: boolean) {
  const query = useQuery({
    queryKey: ["wallet-balance", walletId],
    queryFn: () => fetchBalance(walletId ?? ""),
    enabled: enabled && Boolean(walletId),
    refetchInterval: enabled ? 10_000 : false,
  });

  useEffect(() => {
    if (!enabled) return;
    query.refetch();
  }, [enabled]);

  return query;
}
