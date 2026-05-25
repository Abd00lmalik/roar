"use client";

import { useEffect } from "react";
import { COUNTRY_MAP } from "@/lib/theme/countries";
import { useThemeStore } from "@/store/themeStore";

export function useCountryTheme() {
  const countryCode = useThemeStore((s) => s.countryCode);
  const setCountryCode = useThemeStore((s) => s.setCountryCode);

  const applyTheme = (code: string, syncStore = true) => {
    const country = COUNTRY_MAP.get(code);
    if (!country) return;

    const root = document.documentElement;
    root.style.setProperty("--country-from", country.gradientFrom);
    root.style.setProperty("--country-via", country.gradientVia);
    root.style.setProperty("--country-to", country.gradientTo);
    root.style.setProperty("--country-accent", country.accent);

    const payload = encodeURIComponent(
      JSON.stringify({
        from: country.gradientFrom,
        via: country.gradientVia,
        to: country.gradientTo,
        accent: country.accent,
      }),
    );

    document.cookie = `supporter_nation=${country.code}; path=/; max-age=31536000; SameSite=Lax`;
    document.cookie = `roar_theme=${payload}; path=/; max-age=31536000; SameSite=Lax`;

    if (syncStore) {
      setCountryCode(country.code);
    }
  };

  useEffect(() => {
    if (!countryCode) return;
    applyTheme(countryCode, false);
  }, [countryCode]);

  return { applyTheme };
}
