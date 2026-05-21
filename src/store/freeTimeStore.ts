import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FreeTimeState {
  secondsUsed: number;
  setSecondsUsed: (n: number) => void;
  consumeSecond: () => void;
  remaining: () => number;
}

export const useFreeTimeStore = create<FreeTimeState>()(
  persist(
    (set, get) => ({
      secondsUsed: 0,
      setSecondsUsed: (n) => set({ secondsUsed: n }),
      consumeSecond: () => set((s) => ({ secondsUsed: s.secondsUsed + 1 })),
      remaining: () => Math.max(0, 120 - get().secondsUsed),
    }),
    { name: "roar-free-time" },
  ),
);
