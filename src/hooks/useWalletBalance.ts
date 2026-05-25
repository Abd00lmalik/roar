"use client";

import { useEffect, useState, useCallback } from "react";

/**
 * Poll the Circle wallet USDC balance for a given walletId.
 *
 * Fetches via /api/payments/balance?walletId=... (server-side Circle SDK call)
 * every 10 seconds while the component is mounted. Stops polling when walletId
 * is null or the component unmounts.
 */
export function useWalletBalance(walletId: string | null) {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = useCallback(async () => {
    if (!walletId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/payments/balance?walletId=${encodeURIComponent(walletId)}`);
      if (!res.ok) {
        const { error: errMsg } = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(errMsg ?? `HTTP ${res.status}`);
      }
      const { balance: bal } = (await res.json()) as { balance: number };
      setBalance(bal);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(msg);
      console.error("[useWalletBalance] fetch failed:", msg);
    } finally {
      setLoading(false);
    }
  }, [walletId]);

  useEffect(() => {
    if (!walletId) {
      setBalance(null);
      return;
    }

    let active = true;

    const poll = async () => {
      if (!active) return;
      await fetchBalance();
    };

    poll();
    const interval = setInterval(poll, 10_000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [walletId, fetchBalance]);

  return { balance, loading, error, refetch: fetchBalance };
}
