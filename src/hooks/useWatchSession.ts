// src/hooks/useWatchSession.ts
"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useSignTypedData, useAccount, useReadContract } from "wagmi";
import { getAddress } from "viem";
import { getSupabaseClient } from "@/lib/supabase/singleton";
import { PROTOCOL } from "@/lib/constants/protocol";

const WATCH_VOUCHER_TYPES = {
  WatchVoucher: [
    { name: "user",      type: "address" },
    { name: "creator",   type: "address" },
    { name: "totalOwed", type: "uint256" },
    { name: "nonce",     type: "uint256" },
  ],
} as const;

// Minimal ABI slice — only the nonces read is needed client-side
const VAULT_NONCE_ABI = [
  {
    inputs: [{ name: "user", type: "address" }],
    name: "nonces",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

interface UseWatchSessionOptions {
  creatorAddress: `0x${string}`;
  videoId: string;
  videoElement: HTMLVideoElement | null;
  enabled: boolean;
}

export function useWatchSession({
  creatorAddress,
  videoId,
  videoElement,
  enabled,
}: UseWatchSessionOptions) {
  const { address: userAddress } = useAccount();
  const { signTypedDataAsync }   = useSignTypedData();

  // ── On-chain nonce ──────────────────────────────────────────────────────────
  const { data: onChainNonce, refetch: refetchNonce } = useReadContract({
    address: PROTOCOL.VAULT_ADDRESS,
    abi:     VAULT_NONCE_ABI,
    functionName: "nonces",
    args:    userAddress ? [userAddress] : undefined,
    query:   { enabled: !!userAddress },
  });

  // ── Billing state refs (never cause re-renders) ────────────────────────────
  const totalOwedRef        = useRef(BigInt(0));
  const accumulatedSeconds  = useRef(0);
  const lastTickRef         = useRef<number | null>(null);
  const tickerRef           = useRef<ReturnType<typeof setInterval> | null>(null);
  const nonceRef            = useRef<bigint | undefined>(undefined);

  // Keep nonceRef in sync with on-chain value
  useEffect(() => {
    nonceRef.current = onChainNonce as bigint | undefined;
  }, [onChainNonce]);

  // ── Carry-forward Unsigned Voucher States ──────────────────────────────────
  const [unsignedVoucher, setUnsignedVoucher] = useState<{
    id: string;
    totalOwed: string;
    rawTotalOwed: bigint;
    nonce: string;
    creatorAddress: string;
  } | null>(null);
  const [resignLoading, setResignLoading] = useState(false);

  useEffect(() => {
    if (!userAddress || !enabled) return;

    const checkAndSignUnsigned = async () => {
      const supabase = getSupabaseClient();
      if (!supabase) return;

      const { data: unsignedVouchers, error } = await supabase
        .from("vouchers")
        .select("*")
        .eq("user_address", getAddress(userAddress))
        .eq("status", "unsigned")
        .limit(1);

      if (error || !unsignedVouchers || unsignedVouchers.length === 0) return;

      const voucher = unsignedVouchers[0];
      setUnsignedVoucher({
        id: voucher.id,
        totalOwed: (Number(voucher.total_owed) / 1_000_000).toFixed(4),
        rawTotalOwed: BigInt(voucher.total_owed),
        nonce: voucher.nonce.toString(),
        creatorAddress: voucher.creator_address,
      });
    };

    checkAndSignUnsigned();
  }, [userAddress, enabled]);

  const handleResign = async () => {
    if (!unsignedVoucher || !userAddress) return;
    setResignLoading(true);
    try {
      const signature = await signTypedDataAsync({
        domain: {
          name:            "RoarballVault",
          version:         "1",
          chainId:         PROTOCOL.CHAIN_ID,
          verifyingContract: PROTOCOL.VAULT_ADDRESS,
        },
        types:       WATCH_VOUCHER_TYPES,
        primaryType: "WatchVoucher",
        message: {
          user:      userAddress,
          creator:   unsignedVoucher.creatorAddress as `0x${string}`,
          totalOwed: unsignedVoucher.rawTotalOwed,
          nonce:     BigInt(unsignedVoucher.nonce),
        },
      });

      const response = await fetch("/api/vouchers/sink", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user:      userAddress,
          creator:   unsignedVoucher.creatorAddress,
          totalOwed: unsignedVoucher.rawTotalOwed.toString(),
          nonce:     unsignedVoucher.nonce,
          signature,
        }),
      });

      if (!response.ok) {
        console.error("[useWatchSession] Failed to submit signed voucher:", await response.text());
      }
      setUnsignedVoucher(null);
    } catch (err) {
      console.error("[useWatchSession] Sign carry-forward failed:", err);
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase
          .from("vouchers")
          .update({ status: "failed" })
          .eq("id", unsignedVoucher.id);
      }
      setUnsignedVoucher(null);
    } finally {
      setResignLoading(false);
      await refetchNonce();
    }
  };

  const dismissUnsigned = async () => {
    if (!unsignedVoucher) return;
    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase
        .from("vouchers")
        .update({ status: "failed" })
        .eq("id", unsignedVoucher.id);
    }
    setUnsignedVoucher(null);
  };

  // ── Billing gate ───────────────────────────────────────────────────────────
  const shouldBill = useCallback((): boolean => {
    if (!enabled)                          return false;
    if (!userAddress || !creatorAddress)   return false;
    if (!videoElement)                     return false;
    if (document.hidden)                   return false;
    if (videoElement.paused)               return false;
    if (videoElement.seeking)              return false;
    if (videoElement.readyState < HTMLMediaElement.HAVE_FUTURE_DATA) return false;
    if (getAddress(userAddress) === getAddress(creatorAddress))      return false;
    return true;
  }, [enabled, userAddress, creatorAddress, videoElement]);

  // ── Voucher flush ──────────────────────────────────────────────────────────
  const flushVoucher = useCallback(async () => {
    if (totalOwedRef.current === BigInt(0))  return;
    if (!userAddress)                        return;
    if (nonceRef.current === undefined)      return;

    const totalOwed = totalOwedRef.current;
    const nonce     = nonceRef.current;

    try {
      const signature = await signTypedDataAsync({
        domain: {
          name:            "RoarballVault",
          version:         "1",
          chainId:         PROTOCOL.CHAIN_ID,
          verifyingContract: PROTOCOL.VAULT_ADDRESS,
        },
        types:       WATCH_VOUCHER_TYPES,
        primaryType: "WatchVoucher",
        message: {
          user:      userAddress,
          creator:   creatorAddress,
          totalOwed,
          nonce,
        },
      });

      const response = await fetch("/api/vouchers/sink", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user:      userAddress,
          creator:   creatorAddress,
          totalOwed: totalOwed.toString(),
          nonce:     nonce.toString(),
          signature,
        }),
      });

      if (!response.ok) {
        console.error("[useWatchSession] Sink rejected:", await response.text());
        return;
      }

      totalOwedRef.current = BigInt(0);
      await refetchNonce();
    } catch (err) {
      console.error("[useWatchSession] Flush failed, carrying forward:", err);
    }
  }, [userAddress, creatorAddress, signTypedDataAsync, refetchNonce]);

  // ── Billing tick loop — keyed to videoId so track changes restart cleanly ──
  useEffect(() => {
    totalOwedRef.current       = BigInt(0);
    accumulatedSeconds.current = 0;
    lastTickRef.current        = null;

    tickerRef.current = setInterval(() => {
      if (!shouldBill()) {
        lastTickRef.current = null;
        return;
      }

      const now = performance.now();
      if (lastTickRef.current !== null) {
        const elapsedMs      = now - lastTickRef.current;
        const billedSeconds  = Math.floor(elapsedMs / 1000);

        if (billedSeconds > 0) {
          totalOwedRef.current       += BigInt(billedSeconds) * PROTOCOL.MICRO_USDC_PER_SECOND;
          accumulatedSeconds.current += billedSeconds;
        }
      }
      lastTickRef.current = now;

      if (accumulatedSeconds.current >= PROTOCOL.FLUSH_INTERVAL_SECONDS) {
        accumulatedSeconds.current = 0;
        flushVoucher();
      }
    }, 1_000);

    return () => {
      if (tickerRef.current) clearInterval(tickerRef.current);
      flushVoucher();
    };
  }, [videoId, shouldBill, flushVoucher]);

  // ── Tab visibility flush ───────────────────────────────────────────────────
  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.hidden) {
        lastTickRef.current = null;
        flushVoucher();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [flushVoucher]);

  // ── Page unload flush (sendBeacon fallback for beforeunload reliability) ───
  useEffect(() => {
    const onBeforeUnload = () => {
      if (totalOwedRef.current === BigInt(0) || !userAddress || nonceRef.current === undefined) return;
      navigator.sendBeacon("/api/vouchers/beacon", JSON.stringify({
        user:      userAddress,
        creator:   creatorAddress,
        totalOwed: totalOwedRef.current.toString(),
        nonce:     nonceRef.current.toString(),
      }));
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [userAddress, creatorAddress]);

  return { unsignedVoucher, resignLoading, handleResign, dismissUnsigned };
}
