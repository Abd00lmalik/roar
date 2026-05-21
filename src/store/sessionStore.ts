import { create } from "zustand";
import type { WatchSessionSummary } from "@/types";

type SessionState = {
  isActive: boolean;
  isPaused: boolean;
  billableSeconds: number;
  totalSeconds: number;
  currentCost: number;
  latestSummary: WatchSessionSummary | null;
  setLive: (payload: {
    isActive: boolean;
    isPaused: boolean;
    billableSeconds: number;
    totalSeconds: number;
    currentCost: number;
  }) => void;
  setSummary: (summary: WatchSessionSummary | null) => void;
  reset: () => void;
};

const initialState = {
  isActive: false,
  isPaused: false,
  billableSeconds: 0,
  totalSeconds: 0,
  currentCost: 0,
  latestSummary: null,
};

export const useSessionStore = create<SessionState>((set) => ({
  ...initialState,
  setLive: (payload) => set(payload),
  setSummary: (latestSummary) => set({ latestSummary }),
  reset: () => set(initialState),
}));
