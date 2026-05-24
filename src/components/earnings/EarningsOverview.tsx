interface EarningsOverviewProps {
  profile: any;
}

export function EarningsOverview({ profile }: EarningsOverviewProps) {
  const totalEarned = profile ? Number(profile.total_earned || 0).toFixed(4) : "0.0000";
  return (
    <div className="glass-panel space-y-2 p-4 text-sm">
      <p>Claimable USDC: {totalEarned} USDC</p>
      <p>Pending sessions: 0.0000</p>
      <p>Total withdrawn: 0.0000 USDC</p>
      <p className="text-xs text-chalk/70">85% creator · 5% platform · 10% fan rewards pool</p>
    </div>
  );
}
