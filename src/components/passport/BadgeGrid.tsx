import { badgesSeed } from "@/lib/mockData";

export function BadgeGrid() {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {badgesSeed.map((badge, idx) => (
        <div
          key={badge.id}
          className={`glass-panel p-3 text-center ${idx === 0 ? "border-yellow-400/70" : ""}`}
        >
          <div className="text-2xl">{badge.icon}</div>
          <p className="mt-1 text-sm font-semibold">{badge.name}</p>
          <p className="text-xs text-chalk/70">{idx === 0 ? "Claimed" : "Locked"}</p>
        </div>
      ))}
    </div>
  );
}
