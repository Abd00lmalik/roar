import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CountryCode } from "@/types";

type ThemeState = {
  countryCode: CountryCode | null;
  setCountryCode: (countryCode: CountryCode) => void;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      countryCode: null,
      setCountryCode: (countryCode) => set({ countryCode }),
    }),
    { name: "roar-country-theme" },
  ),
);
