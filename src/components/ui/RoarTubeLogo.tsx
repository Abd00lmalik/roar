"use client";

interface RoarTubeLogoProps {
  className?: string;
  /** Override height/size in pixels (default: 40) */
  height?: number;
}

export function RoarTubeLogo({ className = "", height = 40 }: RoarTubeLogoProps) {
  const fontSize = `${height * 0.65}px`;

  return (
    <span
      className={`font-black italic tracking-tight font-display select-none ${className}`}
      style={{
        fontSize,
        lineHeight: "1",
        color: "var(--country-accent, #FFCE00)",
        textShadow: "0 4px 12px rgba(0, 0, 0, 0.4)",
      }}
    >
      Roar<span className="text-white">Tube</span>
    </span>
  );
}
