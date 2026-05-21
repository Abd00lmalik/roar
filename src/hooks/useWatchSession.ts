"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { WatchSessionTracker, pendingSessionStorageKey } from "@/lib/payments/sessionTracker";
import { PRICE_PER_SECOND_USDC } from "@/lib/payments/constants";
import { useFreeTime } from "@/hooks/useFreeTime";
import { useSessionStore } from "@/store/sessionStore";
import type { WatchSessionSummary } from "@/types";

export function useWatchSession() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [freeTimeExhausted, setFreeTimeExhausted] = useState(false);
  const [retryPendingFound, setRetryPendingFound] = useState(false);
  const { remaining, consumeSecond } = useFreeTime();
  const setLive = useSessionStore((s) => s.setLive);
  const setSummary = useSessionStore((s) => s.setSummary);
  const reset = useSessionStore((s) => s.reset);
  const totalSecondsRef = useRef(0);
  const isPlayingRef = useRef(false);
  const isBufferingRef = useRef(false);
  const remainingRef = useRef(remaining);

  const trackerRef = useRef<WatchSessionTracker | null>(null);

  useEffect(() => {
    const pending = localStorage.getItem(pendingSessionStorageKey);
    setRetryPendingFound(Boolean(pending));
  }, []);

  const onSessionEnd = useCallback(
    (summary: WatchSessionSummary) => {
      setSummary(summary);
      setLive({
        isActive: false,
        isPaused: summary.reason === "pause",
        billableSeconds: summary.billableSeconds,
        totalSeconds: summary.totalSeconds,
        currentCost: summary.billableSeconds * PRICE_PER_SECOND_USDC,
      });
    },
    [setLive, setSummary],
  );

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    isBufferingRef.current = isBuffering;
  }, [isBuffering]);

  useEffect(() => {
    remainingRef.current = remaining;
  }, [remaining]);

  useEffect(() => {
    trackerRef.current = new WatchSessionTracker({
      getIsPlaying: () => isPlayingRef.current,
      getIsBuffering: () => isBufferingRef.current,
      getFreeSecondsRemaining: () => remainingRef.current,
      consumeFreeSecond: () => consumeSecond(),
      onSecondTick: (billableSeconds, freeSecondsRemaining) => {
        totalSecondsRef.current += 1;
        setLive({
          isActive: true,
          isPaused: false,
          billableSeconds,
          totalSeconds: totalSecondsRef.current,
          currentCost: billableSeconds * PRICE_PER_SECOND_USDC,
        });
        if (freeSecondsRemaining === 0) setFreeTimeExhausted(true);
      },
      onFreeTimeExhausted: () => setFreeTimeExhausted(true),
      onSessionEnd,
      persistPendingSession: true,
    });

    return () => {
      trackerRef.current?.stop("navigate");
    };
  }, [consumeSecond, onSessionEnd, setLive]);

  const api = useMemo(
    () => ({
      startSession: () => {
        setFreeTimeExhausted(false);
        trackerRef.current?.start();
      },
      stopSession: (reason: "pause" | "end" | "navigate" | "tab_hidden") => {
        trackerRef.current?.stop(reason);
      },
      resetSession: () => {
        totalSecondsRef.current = 0;
        trackerRef.current?.reset();
        reset();
      },
      setPlaying: (value: boolean) => setIsPlaying(value),
      setBuffering: (value: boolean) => setIsBuffering(value),
      freeTimeExhausted,
      retryPendingFound,
      dismissPendingRetry: () => {
        localStorage.removeItem(pendingSessionStorageKey);
        setRetryPendingFound(false);
      },
    }),
    [freeTimeExhausted, reset, retryPendingFound],
  );

  return api;
}
