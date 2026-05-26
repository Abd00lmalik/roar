"use client";

export function RoarTubeLogo({ className = "" }: { className?: string }) {
  return (
    <span className={`font-black italic tracking-tight text-xl ${className}`}
      style={{ color: "var(--country-accent, #FFCE00)" }}>
      Roar<span className="text-white">Tube</span>
    </span>
  );
}
