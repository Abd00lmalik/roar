export function BadgeCard({
  icon,
  name,
  description,
  claimed,
  onClaim,
}: {
  icon: string;
  name: string;
  description: string;
  claimed: boolean;
  onClaim: () => void;
}) {
  return (
    <div className={`glass-panel p-4 text-center ${claimed ? "border-[var(--country-accent,#FFCE00)]/70 shadow-[0_0_15px_var(--country-accent,#FFCE00)22]" : ""}`}>
      <div className="text-3xl">{icon}</div>
      <p className="mt-2 font-semibold">{name}</p>
      <p className="mt-1 text-xs text-chalk/70">{description}</p>
      <button
        className="mt-3 rounded bg-white/10 px-2 py-1 text-xs"
        onClick={onClaim}
        disabled={claimed}
      >
        {claimed ? "Already Claimed ✓" : "Claim Trophy"}
      </button>
    </div>
  );
}
