import type { WatchSessionSummary } from "@/types";
import { formatSeconds, formatUsdc } from "@/lib/utils";

export function WatchReceipt({
  summary,
  txHash,
  onClose,
}: {
  summary: WatchSessionSummary | null;
  txHash?: string | null;
  onClose: () => void;
}) {
  if (!summary) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="glass-panel w-full max-w-lg space-y-3 p-5">
        <h3 className="text-lg font-semibold">✅ Session Complete</h3>
        <p>Total watched: {formatSeconds(summary.totalSeconds)}</p>
        <p>Billable seconds: {summary.billableSeconds}</p>
        <p>Total paid: {formatUsdc(summary.amountUsdc)} USDC</p>
        <p>Creator earned: {formatUsdc(summary.creatorShareUsdc)} USDC (85%)</p>
        <p>Platform revenue: {formatUsdc(summary.platformShareUsdc)} USDC (5%)</p>
        <p>Fan rewards pool + {formatUsdc(summary.rewardPoolShareUsdc)} USDC (10%)</p>
        <p className="text-xs text-chalk/70">TX: {txHash ?? "mock_mode"}</p>
        <button onClick={onClose} className="rounded bg-white/10 px-3 py-1 text-sm">
          Close
        </button>
      </div>
    </div>
  );
}
