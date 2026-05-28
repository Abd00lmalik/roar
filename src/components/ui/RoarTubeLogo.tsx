// src/components/ui/RoarTubeLogo.tsx
import React from "react";

interface RoarTubeLogoProps {
  height?: number;
  width?: number;
  className?: string;
}

export function RoarTubeLogo({ height = 40, width, className }: RoarTubeLogoProps) {
  const calculatedWidth = width ?? (height * 3.5);

  return (
    <svg
      width={calculatedWidth}
      height={height}
      viewBox="0 0 140 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Football circle mark */}
      <circle cx="20" cy="20" r="16" fill="#111111" stroke="#FFCE00" strokeWidth="1.5"/>
      <polygon
        points="20,8 22.8,14 29,14 24,18 26,25 20,21 14,25 16,18 11,14 17.2,14"
        fill="#FFCE00"
      />
      {/* Wordmark */}
      <text
        x="44"
        y="27"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontWeight="900"
        fontStyle="italic"
        fontSize="22"
        fill="#FFCE00"
        letterSpacing="-0.5"
      >
        Roar
      </text>
      <text
        x="91"
        y="27"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontWeight="900"
        fontStyle="italic"
        fontSize="22"
        fill="#FFFFFF"
        letterSpacing="-0.5"
      >
        Tube
      </text>
    </svg>
  );
}
