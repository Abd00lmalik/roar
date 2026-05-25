"use client";

import { useSession } from "next-auth/react";
import { CountrySelectorStep } from "@/components/onboarding/CountrySelectorStep";
import { GoogleAuthStep } from "@/components/onboarding/GoogleAuthStep";
import { useOnboarding } from "@/context/OnboardingContext";

export default function OnboardingPage() {
  const { step } = useOnboarding();
  const { status } = useSession();

  if (status === "authenticated") {
    return <GoogleAuthStep />;
  }

  if (step === "COUNTRY_SELECTOR") {
    return <CountrySelectorStep />;
  }

  return <GoogleAuthStep />;
}
