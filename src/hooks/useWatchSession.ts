"use client";

import { useEffect, useRef, useCallback } from "react";
import { useAccount } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { getAddress } from "viem";
import { createClient } from "@/lib/supabase/client";
import { BILLING } from "@/lib/constants/protocol";
import { useSessionStore } from "@/store/sessionStore";

interface UseWatchSessionOptions {
  creatorAddress: string;
  videoId: string;
  videoElement: HTMLVideoElement | null;
  enabled: boolean;
}

const ZERO = BigInt(0);

export function useWatchSession({
  creatorAddress,
  videoId,
  videoElement,
  enabled,
}: UseWatchSessionOptions) {
  const { address: userAddress } = useAccount();
  const session = useSessionStore();

  const totalOwedRef = useRef(ZERO);
  const billableSecondsRef = useRef(0);
  const totalSecondsRef = useRef(0);
  const accumulatedSecondsRef = useRef(0);
  const lastTickRef = useRef<number | null>(null);
  const tickerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data: hasPassport } = useQuery({
    queryKey: ["passport", userAddress],
    queryFn: async () => {
      if (!userAddress) return false;
      const supabase = createClient();
      if (!supabase) return false;
      const { data } = await supabase
        .from("fan_passports")
        .select("wallet_address")
        .eq("wallet_address", getAddress(userAddress))
        .maybeSingle();
      return !!data;
    },
    enabled: !!userAddress,
  });

  const billingRate = hasPassport
    ? BILLING.PASSPORT_RATE_MICRO
    : BILLING.STANDARD_RATE_MICRO;

  const shouldBill = useCallback((): boolean => {
    if (!enabled) return false;
    if (!userAddress) return false;
    if (!videoElement) return false;
    if (document.hidden) return false;
    if (videoElement.paused) return false;
    if (videoElement.seeking) return false;
    if (videoElement.readyState < HTMLMediaElement.HAVE_FUTURE_DATA) return false;
    if (getAddress(userAddress) === getAddress(creatorAddress)) return false;
    return true;
  }, [enabled, userAddress, creatorAddress, videoElement]);

  const flushSession = useCallback(async () => {
    if (!userAddress || totalOwedRef.current === ZERO) return;

    const totalOwed = totalOwedRef.current;
    try {
      const response = await fetch("/api/payments/settle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userAddress,
          creatorAddress,
          videoId,
          totalOwedMicro: totalOwed.toString(),
        }),
      });

      if (!response.ok) return;
      totalOwedRef.current = ZERO;
    } catch {
      // Carry forward unpaid balance.
    }
  }, [userAddress, creatorAddress, videoId]);

  useEffect(() => {
    totalOwedRef.current = ZERO;
    billableSecondsRef.current = 0;
    totalSecondsRef.current = 0;
    accumulatedSecondsRef.current = 0;
    lastTickRef.current = null;

    session.reset();

    tickerRef.current = setInterval(() => {
      const now = performance.now();
      if (lastTickRef.current !== null) {
        const elapsed = Math.floor((now - lastTickRef.current) / 1000);
        if (elapsed > 0) {
          totalSecondsRef.current += elapsed;
        }
      }

      if (shouldBill()) {
        if (lastTickRef.current !== null) {
          const billed = Math.floor((now - lastTickRef.current) / 1000);
          if (billed > 0) {
            totalOwedRef.current += BigInt(billed) * billingRate;
            billableSecondsRef.current += billed;
            accumulatedSecondsRef.current += billed;
          }
        }
      } else {
        lastTickRef.current = now;
        session.setLive({
          isActive: false,
          isPaused: true,
          totalSeconds: totalSecondsRef.current,
          billableSeconds: billableSecondsRef.current,
          currentCost: Number(totalOwedRef.current) / 1_000_000,
        });
        return;
      }

      lastTickRef.current = now;

      session.setLive({
        isActive: true,
        isPaused: false,
        totalSeconds: totalSecondsRef.current,
        billableSeconds: billableSecondsRef.current,
        currentCost: Number(totalOwedRef.current) / 1_000_000,
      });

      if (accumulatedSecondsRef.current >= BILLING.FLUSH_INTERVAL_SECS) {
        accumulatedSecondsRef.current = 0;
        flushSession();
      }
    }, 1000);

    return () => {
      if (tickerRef.current) clearInterval(tickerRef.current);
      flushSession();
    };
  }, [videoId, shouldBill, flushSession, billingRate, session]);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (!document.hidden) return;
      lastTickRef.current = null;
      flushSession();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [flushSession]);

  useEffect(() => {
    const onBeforeUnload = () => {
      if (!userAddress || totalOwedRef.current === ZERO) return;
      navigator.sendBeacon("/api/payments/settle", JSON.stringify({
        userAddress,
        creatorAddress,
        videoId,
        totalOwedMicro: totalOwedRef.current.toString(),
      }));
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [userAddress, creatorAddress, videoId]);
}
