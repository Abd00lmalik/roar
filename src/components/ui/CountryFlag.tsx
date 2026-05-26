"use client";

interface CountryFlagProps {
  code: string;
  className?: string;
}

export function CountryFlag({ code, className = "w-10 h-7 object-cover rounded shadow-sm" }: CountryFlagProps) {
  let iso = code.toLowerCase();
  if (iso === "en") iso = "gb";
  
  return (
    <img
      src={`https://flagcdn.com/w160/${iso}.png`}
      alt={code}
      className={className}
      loading="lazy"
    />
  );
}
