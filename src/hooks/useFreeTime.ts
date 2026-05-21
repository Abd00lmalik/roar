"use client";

import { useMemo } from "react";
import { useFreeTimeStore } from "@/store/freeTimeStore";

export function useFreeTime() {
  const secondsUsed = useFreeTimeStore((s) => s.secondsUsed);
  const consumeSecond = useFreeTimeStore((s) => s.consumeSecond);
  const setSecondsUsed = useFreeTimeStore((s) => s.setSecondsUsed);
  const remainingRaw = useFreeTimeStore((s) => s.remaining);
  const remaining = useMemo(() => remainingRaw(), [remainingRaw, secondsUsed]);

  return {
    secondsUsed,
    remaining,
    consumeSecond,
    setSecondsUsed,
  };
}
