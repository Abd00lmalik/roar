import type { WatchSessionSummary } from "@/types";

export async function settleSession(payload: {
  viewerWallet: string;
  creatorWallet: string;
  videoId: string;
  summary: WatchSessionSummary;
}) {
  const response = await fetch("/api/session/settle", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      viewerWallet: payload.viewerWallet,
      creatorWallet: payload.creatorWallet,
      videoId: payload.videoId,
      billableSeconds: payload.summary.billableSeconds,
      freeSecondsUsed: payload.summary.freeSecondsUsed,
      totalSeconds: payload.summary.totalSeconds,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to settle session");
  }

  return response.json();
}
