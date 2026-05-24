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

    const root = document.documentElement;
    root.style.setProperty("--country-from",   country.gradientFrom);
    root.style.setProperty("--country-via",    country.gradientVia);
    root.style.setProperty("--country-to",     country.gradientTo);
    root.style.setProperty("--country-accent", country.accent);

    document.cookie = `supporter_nation=${country.code}; path=/; max-age=31536000; SameSite=Lax`;
  }, [countryCode]);
}
