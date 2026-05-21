"use client";

import { useEffect } from "react";
import { COUNTRY_MAP } from "@/lib/theme/countries";
import { useThemeStore } from "@/store/themeStore";

export function useCountryTheme() {
  const countryCode = useThemeStore((s) => s.countryCode);

  useEffect(() => {
    if (!countryCode) return;
    const country = COUNTRY_MAP.get(countryCode);
    if (!country) return;

    document.documentElement.style.setProperty("--country-from", country.gradientFrom);
    document.documentElement.style.setProperty("--country-to", country.gradientTo);
    document.documentElement.style.setProperty("--country-accent", country.accent);
  }, [countryCode]);
}
