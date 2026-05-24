import {
  CREATOR_SPLIT_PCT,
  PLATFORM_SPLIT_PCT,
  REWARD_POOL_SPLIT_PCT,
} from "@/lib/payments/constants";
import { BILLING } from "@/lib/constants/protocol";
import type { WatchSessionSummary } from "@/types";

type SessionEndReason = "pause" | "end" | "navigate" | "tab_hidden";

type TrackerCallbacks = {
  onSecondTick: (billableSeconds: number, freeSecondsRemaining: number) => void;
  onFreeTimeExhausted: () => void;
  onSessionEnd: (summary: WatchSessionSummary) => void;
};

type TrackerOptions = {
  getIsPlaying: () => boolean;
  getIsBuffering: () => boolean;
  getFreeSecondsRemaining: () => number;
  consumeFreeSecond: () => void;
  persistPendingSession?: boolean;
} & TrackerCallbacks;

const STORAGE_KEY = "roar-pending-session";

export class WatchSessionTracker {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private startedAt: number | null = null;
  private billableSeconds = 0;
  private freeSecondsUsed = 0;
  private totalSeconds = 0;

  constructor(private readonly options: TrackerOptions) {}

  start() {
    if (this.intervalId) return;
    if (!this.startedAt) this.startedAt = Date.now();
    window.addEventListener("beforeunload", this.handleBeforeUnload);
    this.intervalId = setInterval(this.tick, 1000);
  }

  stop(reason: SessionEndReason) {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    window.removeEventListener("beforeunload", this.handleBeforeUnload);

    const amountUsdc = this.billableSeconds * (Number(BILLING.STANDARD_RATE_MICRO) / 1_000_000);
    const summary: WatchSessionSummary = {
      reason,
      totalSeconds: this.totalSeconds,
      freeSecondsUsed: this.freeSecondsUsed,
      billableSeconds: this.billableSeconds,
      amountUsdc,
      creatorShareUsdc: amountUsdc * CREATOR_SPLIT_PCT,
      platformShareUsdc: amountUsdc * PLATFORM_SPLIT_PCT,
      rewardPoolShareUsdc: amountUsdc * REWARD_POOL_SPLIT_PCT,
      endedAt: new Date().toISOString(),
    };
    this.options.onSessionEnd(summary);
  }

  reset() {
    this.billableSeconds = 0;
    this.freeSecondsUsed = 0;
    this.totalSeconds = 0;
    this.startedAt = null;
  }

  private readonly tick = () => {
    if (document.hidden) return;
    if (!this.options.getIsPlaying() || this.options.getIsBuffering()) return;

    this.totalSeconds += 1;
    const freeSecondsRemaining = this.options.getFreeSecondsRemaining();

    if (freeSecondsRemaining > 0) {
      this.options.consumeFreeSecond();
      this.freeSecondsUsed += 1;
      const nextRemaining = Math.max(0, freeSecondsRemaining - 1);
      this.options.onSecondTick(this.billableSeconds, nextRemaining);
      if (nextRemaining === 0) this.options.onFreeTimeExhausted();
      return;
    }

    this.billableSeconds += 1;
    this.options.onSecondTick(this.billableSeconds, 0);
  };

  private readonly handleBeforeUnload = () => {
    if (!this.options.persistPendingSession) return;
    if (!this.totalSeconds) return;

    const payload = {
      totalSeconds: this.totalSeconds,
      freeSecondsUsed: this.freeSecondsUsed,
      billableSeconds: this.billableSeconds,
      status: "pending_settlement",
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  };
}

export const pendingSessionStorageKey = STORAGE_KEY;
