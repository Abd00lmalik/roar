import { EmptyState } from "@/components/ui/EmptyState";

interface Badge {
  id: string | number;
  icon: string;
  name: string;
  claimed: boolean;
}

interface BadgeGridProps {
  badges?: Badge[];
}

export function BadgeGrid({ badges = [] }: BadgeGridProps) {
  if (badges.length === 0) {
    return (
      <EmptyState
        icon="🏆"
        heading="No trophies yet"
        body="Earn badges by watching, posting takes, and climbing the fan leaderboard."
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {badges.map((badge) => (
        <div
          key={badge.id}
          className={`glass-panel p-3 text-center ${badge.claimed ? "border-yellow-400/70" : ""}`}
        >
          <div className="text-2xl">{badge.icon}</div>
          <p className="mt-1 text-sm font-semibold">{badge.name}</p>
          <p className="text-xs text-chalk/70">{badge.claimed ? "Claimed" : "Locked"}</p>
        </div>
      ))}
    </div>
  );
}
