"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useWriteContract } from "wagmi";
import { CountryPicker } from "@/components/onboarding/CountryPicker";
import { ProfileForm } from "@/components/onboarding/ProfileForm";
import { useThemeStore } from "@/store/themeStore";
import { FAN_PASSPORT_ABI } from "@/lib/contracts/abis";
import { CONTRACT_ADDRESSES } from "@/lib/contracts/addresses";
import type { CountryCode } from "@/types";

export default function OnboardingPage() {
  const router = useRouter();
  const setCountryCode = useThemeStore((s) => s.setCountryCode);
  const [countryCode, setCountry] = useState<CountryCode | null>(null);
  const [minting, setMinting] = useState(false);
  const { writeContractAsync } = useWriteContract();

  const mintPassport = async () => {
    if (!countryCode || !CONTRACT_ADDRESSES.fanPassport) return;
    try {
      setMinting(true);
      await writeContractAsync({
        abi: FAN_PASSPORT_ABI,
        address: CONTRACT_ADDRESSES.fanPassport,
        functionName: "mintPassport",
        args: [countryCode],
        value: BigInt("10000000000000000"),
      });
    } finally {
      setMinting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-8">
      <h1 className="font-display text-4xl font-bold">Choose Your Country</h1>
      <CountryPicker selected={countryCode} onSelect={setCountry} />

      <div className="glass-panel space-y-3 p-4">
        <h2 className="font-display text-2xl font-semibold">Stake & Mint Passport</h2>
        <p className="text-sm text-chalk/70">Stake 0.01 OKB to mint your Roarball Fan Passport.</p>
        <div className="space-y-1 text-sm">
          <p>Standard: 0.0001 USDC/sec (all users)</p>
          <p>Passport reward: 0.00005 USDC/sec (Fan Passport holders)</p>
        </div>
        <button
          onClick={mintPassport}
          disabled={!countryCode || !CONTRACT_ADDRESSES.fanPassport || minting}
          className="rounded-xl bg-[var(--country-accent,#FFCE00)] px-4 py-2 text-sm font-semibold text-black disabled:opacity-50"
        >
          {minting ? "Minting Passport..." : "Stake & Mint Passport"}
        </button>
      </div>

      <h2 className="font-display text-2xl font-semibold">Fan Passport</h2>
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
