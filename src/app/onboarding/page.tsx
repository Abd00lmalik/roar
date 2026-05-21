"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CountryPicker } from "@/components/onboarding/CountryPicker";
import { ProfileForm } from "@/components/onboarding/ProfileForm";
import { useThemeStore } from "@/store/themeStore";
import type { CountryCode } from "@/types";

export default function OnboardingPage() {
  const router = useRouter();
  const setCountryCode = useThemeStore((s) => s.setCountryCode);
  const [countryCode, setCountry] = useState<CountryCode | null>(null);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-8">
      <h1 className="font-display text-4xl font-bold">Choose Your Country</h1>
      <CountryPicker selected={countryCode} onSelect={setCountry} />
      <h2 className="font-display text-2xl font-semibold">Your Profile</h2>
      <ProfileForm
        countryCode={countryCode}
        onSubmit={() => {
          if (!countryCode) return;
          setCountryCode(countryCode);
          router.push("/feed");
        }}
      />
    </div>
  );
}
