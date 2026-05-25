"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getAddress } from "viem";
import { useAccount } from "wagmi";
import { WC2026_QUALIFIERS } from "@/lib/theme/countries";
import { useCountryTheme } from "@/lib/theme/useCountryTheme";
import { createClient } from "@/lib/supabase/client";

export default function OnboardingPage() {
  const router = useRouter();
  const { address } = useAccount();
  const { applyTheme } = useCountryTheme();
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSelect = (code: string) => {
    setSelected(code);
    applyTheme(code);
  };

  const handleConfirm = async () => {
    if (!selected || !address) return;
    const supabase = createClient();
    if (!supabase) return;

    setSaving(true);
    const normalizedAddress = getAddress(address);

    await supabase.from("profiles").upsert(
      { wallet_address: normalizedAddress, supporter_nation: selected },
      { onConflict: "wallet_address" },
    );

    document.cookie = `supporter_nation=${selected}; path=/; max-age=31536000; SameSite=Lax`;
    router.push("/feed");
  };

  const grouped = WC2026_QUALIFIERS.reduce((acc, country) => {
    if (!acc[country.confederation]) acc[country.confederation] = [];
    acc[country.confederation].push(country);
    return acc;
  }, {} as Record<string, (typeof WC2026_QUALIFIERS)[number][]>);

  const confederationOrder = ["UEFA", "CONMEBOL", "CONCACAF", "CAF", "AFC", "OFC", "PLAYOFF"];

  return (
    <div className="flex min-h-screen flex-col items-center bg-[#060810] px-4 py-12">
      <div className="w-full max-w-2xl space-y-8">
        <div className="space-y-2 text-center">
          <span className="text-4xl">🛂</span>
          <h1 className="text-2xl font-bold text-white">Choose Your Fan Stand</h1>
          <p className="text-sm text-white/50">
            Pick the nation you support. This sets your stadium colours and unlocks your Fan Passport.
            You can change it later.
          </p>
        </div>

        {selected ? (
          <div
            className="h-1.5 w-full rounded-full transition-all duration-500"
            style={{
              background:
                "linear-gradient(90deg, var(--country-from), var(--country-via), var(--country-to))",
            }}
          />
        ) : null}

        {confederationOrder.map((conf) =>
          grouped[conf] ? (
            <div key={conf} className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-white/30">{conf}</h2>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {grouped[conf].map((country) => (
                  <button
                    key={country.code}
                    onClick={() => handleSelect(country.code)}
                    className={`
                      flex items-center gap-3 rounded-xl border p-3 text-left transition-all backdrop-blur-xl
                      ${
                        selected === country.code
                          ? "border-[var(--country-accent)] bg-white/[0.08] shadow-[0_0_12px_var(--country-accent)]"
                          : "border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06]"
                      }
                    `}
                  >
                    <span className="text-2xl">{country.flag}</span>
                    <div>
                      <p className="text-sm font-medium leading-tight text-white">{country.name}</p>
                      <p className="text-xs text-white/30">{country.code}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : null,
        )}

        <button
          onClick={handleConfirm}
          disabled={!selected || saving || !address}
          className="w-full rounded-2xl bg-[var(--country-accent,#FFCE00)] py-4 text-base font-bold text-black transition-all disabled:cursor-not-allowed disabled:opacity-30"
        >
          {saving
            ? "Saving..."
            : selected
              ? `Join the ${WC2026_QUALIFIERS.find((c) => c.code === selected)?.name} Stand 📣`
              : "Select your nation to continue"}
        </button>
      </div>
    </div>
  );
}
