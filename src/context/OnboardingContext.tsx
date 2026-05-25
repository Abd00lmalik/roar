"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { WC2026Team } from "@/lib/data/wc2026-teams";

export type OnboardingStep = "COUNTRY_SELECTOR" | "GOOGLE_AUTH" | "COMPLETE";

const STORAGE_KEY = "roar_selected_team";

export function injectCountryTheme(team: WC2026Team) {
  const root = document.documentElement;
  root.style.setProperty("--country-from", team.colors.from);
  root.style.setProperty("--country-via", team.colors.via);
  root.style.setProperty("--country-to", team.colors.to);
  root.style.setProperty("--country-accent", team.colors.accent);
}

type OnboardingContextValue = {
  step: OnboardingStep;
  selectedTeam: WC2026Team | null;
  selectTeam: (team: WC2026Team) => void;
  setStep: (step: OnboardingStep) => void;
  reset: () => void;
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [step, setStep] = useState<OnboardingStep>("COUNTRY_SELECTOR");
  const [selectedTeam, setSelectedTeam] = useState<WC2026Team | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const team = JSON.parse(raw) as WC2026Team;
      setSelectedTeam(team);
      injectCountryTheme(team);
      setStep("GOOGLE_AUTH");
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const value = useMemo<OnboardingContextValue>(
    () => ({
      step,
      selectedTeam,
      setStep,
      reset: () => {
        setStep("COUNTRY_SELECTOR");
        setSelectedTeam(null);
        localStorage.removeItem(STORAGE_KEY);
      },
      selectTeam: (team) => {
        injectCountryTheme(team);
        setSelectedTeam(team);
        setStep("GOOGLE_AUTH");
        localStorage.setItem(STORAGE_KEY, JSON.stringify(team));
      },
    }),
    [step, selectedTeam],
  );

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboarding must be used within OnboardingProvider");
  }
  return context;
}
