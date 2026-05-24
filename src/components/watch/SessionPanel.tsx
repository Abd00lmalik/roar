import {
  CREATOR_SPLIT_PCT,
  PLATFORM_SPLIT_PCT,
  REWARD_POOL_SPLIT_PCT,
} from "@/lib/payments/constants";
import { formatSeconds, formatUsdc } from "@/lib/utils";

export function SessionPanel({
  totalSeconds,
  billableSeconds,
  cost,
  isPaused,
}: {
  totalSeconds: number;
  billableSeconds: number;
  cost: number;
  isPaused: boolean;
}) {
  return (
    <div className="glass-panel space-y-2 p-4 text-sm">
      <p className="font-semibold text-red-400">LIVE SESSION</p>
      <p>Total watch time: {formatSeconds(totalSeconds)}</p>
      <p>Billable seconds: {billableSeconds}</p>
      <p>Session cost: {formatUsdc(cost, 4)} USDC</p>
      <hr className="border-white/10" />
      <p>Creator share {(CREATOR_SPLIT_PCT * 100).toFixed(0)}%: {formatUsdc(cost * CREATOR_SPLIT_PCT)} USDC</p>
      <p>Treasury {(PLATFORM_SPLIT_PCT * 100).toFixed(0)}%: {formatUsdc(cost * PLATFORM_SPLIT_PCT)} USDC</p>
      <p>Fan rewards {(REWARD_POOL_SPLIT_PCT * 100).toFixed(0)}%: {formatUsdc(cost * REWARD_POOL_SPLIT_PCT)} USDC</p>
      <p className={isPaused ? "text-amber-300" : "text-green-400"}>
        {isPaused ? "Paused - Not billing" : "Paying - Pause to stop billing"}
      </p>
    </div>
  );
}
