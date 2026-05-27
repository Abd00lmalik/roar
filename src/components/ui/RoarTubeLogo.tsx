"use client";

import { useState } from "react";

interface RoarTubeLogoProps {
  className?: string;
  /** Override height in pixels (default: 40) */
  height?: number;
}

export function RoarTubeLogo({ className = "", height = 40 }: RoarTubeLogoProps) {
  const [imgFailed, setImgFailed] = useState(false);

  if (!imgFailed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src="/logo.png"
        alt="RoarTube"
        style={{ height, width: "auto", objectFit: "contain" }}
        className={`drop-shadow-md select-none ${className}`}
        onError={() => setImgFailed(true)}
      />
    );
  }

  /* Text fallback if no logo.png exists */
  return (
    <span
      className={`font-black italic tracking-tight text-xl ${className}`}
      style={{ color: "var(--country-accent, #FFCE00)" }}
    >
      Roar<span className="text-white">Tube</span>
    </span>
  );
}
