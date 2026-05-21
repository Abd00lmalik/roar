import { platformStatsSeed } from "@/lib/mockData";

export function CrowdRoarBanner() {
  return (
    <div className="glass-panel flex flex-wrap items-center justify-between gap-2 p-4 text-sm">
      <span>🔥 Crowd Roar</span>
      <span>👁 {platformStatsSeed.total_watch_seconds.toLocaleString()} seconds watched today</span>
      <span>Top Country: Nigeria 🇳🇬</span>
      <span>Top Creator: @TacticalGhost</span>
      <span>Pool: {platformStatsSeed.fan_rewards_pool_usdc.toFixed(2)} USDC</span>
    </div>
  );
}
