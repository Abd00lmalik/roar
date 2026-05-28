"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useThemeStore } from "@/store/themeStore";
import { COUNTRIES, CountryConfig } from "@/lib/theme/countries";
import { CountryFlag } from "@/components/ui/CountryFlag";
import { createClient } from "@/lib/supabase/client";

/* ─── Google SVG icon ─────────────────────────────────────────────── */
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0" aria-hidden>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

type Step = "country" | "auth";

export default function OnboardingPage() {
  const router = useRouter();
  const setCountryCode = useThemeStore((s) => s.setCountryCode);
  const { data: session } = useSession();
  const { isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();

  const [selected, setSelected] = useState<CountryConfig | null>(null);
  const [step, setStep] = useState<Step>("country");
  const [signingIn, setSigningIn] = useState(false);

  /* Auto-advance to /stadium once wallet connected on auth step */
  useEffect(() => {
    if (step === "auth" && isConnected) {
      router.push("/wallet/fund");
    }
  }, [step, isConnected, router]);

  /* ─── Helpers ──────────────────────────────────────────────────── */
  const applyTheme = (team: CountryConfig) => {
    const root = document.documentElement;
    root.style.setProperty("--country-from", team.gradientFrom);
    root.style.setProperty("--country-via", team.gradientVia);
    root.style.setProperty("--country-to", team.gradientTo);
    root.style.setProperty("--country-accent", team.accent);
  };

  const handleCountrySelect = (team: CountryConfig) => {
    setSelected(team);
    applyTheme(team);
  };

  const [saving, setSaving] = useState(false);

  const handleConfirm = async () => {
    if (!selected) return;
    setSaving(true);

    /* Persist: localStorage + cookies */
    localStorage.setItem("roar_selected_team", JSON.stringify(selected));
    document.cookie = `roar_selected_team=${selected.code}; path=/; max-age=31536000; SameSite=Lax`;
    document.cookie = `supporter_nation=${selected.code}; path=/; max-age=31536000; SameSite=Lax`;
    setCountryCode(selected.code as any);

    // Apply theme immediately
    applyTheme(selected);

    // If already signed in, update their profile and continue to funding
    if (session?.user?.id) {
      const supabase = createClient();
      if (supabase) {
        await supabase
          .from("profiles")
          .update({ supporter_nation: selected.code })
          .eq("id", session.user.id);
      }
      router.push("/wallet/fund");
    } else {
      // Not signed in yet — go to sign in page
      router.push("/auth/signin?callbackUrl=/wallet/fund");
    }
    setSaving(false);
  };

  const handleGoogleSignIn = async () => {
    setSigningIn(true);
    await signIn("google", { callbackUrl: "/wallet/fund" });
  };

  const handleWalletConnect = () => {
    openConnectModal?.();
  };

  const handleSkip = () => {
    router.push("/stadium");
  };

  const faucetUrl = process.env.NEXT_PUBLIC_USDC_FAUCET_URL ?? "https://faucet.circle.com";

  const displayTeams = COUNTRIES.filter(
    (c) => !c.code.startsWith("TBD") && c.confederation !== "PLAYOFF"
  );

  /* ══════════════════════════════════════════════════════════════════
     STEP 2 — Auth / Sign-in
  ══════════════════════════════════════════════════════════════════ */
  if (step === "auth") {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
        style={{ background: "#080810" }}
      >
        {/* Country gradient glow behind the card */}
        <div
          className="pointer-events-none fixed inset-0 z-0"
          style={{
            background:
              "radial-gradient(ellipse 100% 50% at 50% -10%, color-mix(in srgb, var(--country-accent, #FFCE00) 20%, transparent) 0%, transparent 100%)",
          }}
        />

        <div className="relative z-10 glass-panel p-8 max-w-md w-full space-y-6 text-center">
          {/* Selected nation badge */}
          {selected && (
            <div className="flex items-center justify-center gap-2 py-2 px-4 rounded-full bg-white/[0.05] border border-white/10 w-fit mx-auto">
              <CountryFlag
                code={selected.code}
                className="w-6 h-4 rounded-sm object-cover shadow"
              />
              <span className="text-white/70 text-xs">
                Supporting{" "}
                <span
                  className="font-bold"
                  style={{ color: "var(--country-accent, #FFCE00)" }}
                >
                  {selected.name}
                </span>
              </span>
            </div>
          )}

          {/* Heading */}
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-white uppercase tracking-tight font-display">
              Claim Your{" "}
              <span style={{ color: "var(--country-accent, #FFCE00)" }}>
                Seat
              </span>
            </h2>
            <p className="text-white/50 text-sm leading-relaxed max-w-sm mx-auto">
              Sign in with Google to get your automatic crypto wallet, track
              your earnings, and unlock the full stadium experience.
            </p>
          </div>

          {/* CTA buttons */}
          <div className="space-y-3">
            {/* Google */}
            <button
              id="btn-google-signin"
              onClick={handleGoogleSignIn}
              disabled={signingIn}
              className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl
                         bg-white text-gray-900 font-bold text-sm cursor-pointer
                         hover:bg-gray-100 hover:scale-[1.02] active:scale-100
                         transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <GoogleIcon />
              {signingIn ? "Redirecting to Google…" : "Continue with Google"}
            </button>
            <button
              id="btn-email-signin"
              onClick={() => router.push("/auth/signin?callbackUrl=/wallet/fund")}
              className="w-full rounded-2xl border border-white/20 bg-white/[0.04] py-4 px-6 text-sm font-bold text-white transition-all duration-200 hover:bg-white/10 hover:scale-[1.02] active:scale-100"
            >
              Continue with Email / Password
            </button>

            {/* Wallet */}
            <button
              id="btn-wallet-connect"
              onClick={handleWalletConnect}
              className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl
                         border border-white/20 bg-white/[0.05] text-white font-bold text-sm cursor-pointer
                         hover:bg-white/10 hover:scale-[1.02] active:scale-100
                         transition-all duration-200"
            >
              <span className="text-lg">🔗</span>
              Connect Crypto Wallet
            </button>
            <a
              id="btn-faucet-link"
              href={faucetUrl}
              target="_blank"
              rel="noreferrer"
              className="block w-full rounded-2xl border border-white/15 bg-white/[0.02] py-3 text-sm font-medium text-white/80 hover:bg-white/10"
            >
              Open USDC Faucet
            </a>

            {/* Skip */}
            <button
              id="btn-skip-auth"
              onClick={handleSkip}
              className="w-full py-2 text-white/35 text-xs hover:text-white/55 transition-colors cursor-pointer"
            >
              Skip for now — explore as guest →
            </button>
          </div>

          {/* Fine print */}
          <p className="text-white/25 text-[11px] leading-relaxed">
            Google sign-in automatically provisions a non-custodial crypto
            wallet via Circle. Your private key is never stored on our servers.
          </p>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════════════════
     STEP 1 — Country selection
  ══════════════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-[#080810] flex flex-col items-center px-4 py-12">
      {/* Country gradient glow */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 100% 50% at 50% -10%, color-mix(in srgb, var(--country-accent, #FFCE00) 14%, transparent) 0%, transparent 100%)",
        }}
      />

      <div className="relative z-10 w-full flex flex-col items-center gap-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-black text-white font-display uppercase tracking-tight">
            Choose Your Nation
          </h1>
          <p className="text-white/50 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            Your nation&apos;s colors follow you throughout the entire stadium.
          </p>
        </div>

        {/* Country grid */}
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 w-full max-w-3xl mx-auto px-4 max-h-[58vh] overflow-y-auto no-scrollbar pr-1">
          {displayTeams.map((country) => (
            <button
              key={country.code}
              id={`country-btn-${country.code}`}
              onClick={() => handleCountrySelect(country)}
              className={`
                flex flex-col items-center justify-center gap-2 p-3 rounded-2xl
                border transition-all duration-200 aspect-square cursor-pointer
                ${
                  selected?.code === country.code
                    ? "border-[var(--country-accent,#FFCE00)] bg-white/[0.12] scale-105 shadow-[0_0_20px_var(--country-accent,#FFCE00)33]"
                    : "border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08] hover:scale-[1.02]"
                }
              `}
            >
              <CountryFlag
                code={country.code}
                className="w-14 h-10 object-cover rounded shadow-md select-none"
              />
              <span className="text-white/70 text-[10px] font-medium text-center leading-tight max-w-full truncate">
                {country.name}
              </span>
            </button>
          ))}
        </div>

        {/* Confirm CTA */}
        {selected && (
          <div className="flex flex-col items-center gap-2 animate-fade-in">
            <p className="text-white/70 text-xs font-mono flex items-center gap-1.5">
              Selected:{" "}
              <span
                className="font-bold"
                style={{ color: "var(--country-accent)" }}
              >
                {selected.name}
              </span>
              <CountryFlag
                code={selected.code}
                className="w-5 h-3.5 object-cover rounded-sm shadow-sm inline-block"
              />
            </p>
            <button
              id="btn-confirm-country"
              onClick={handleConfirm}
              className="px-10 py-4 rounded-2xl font-black text-black text-lg uppercase tracking-wider cursor-pointer
                         hover:scale-105 active:scale-100 transition-transform duration-200
                         shadow-[0_0_30px_rgba(255,206,0,0.3)]"
              style={{ background: "var(--country-accent, #FFCE00)" }}
            >
              CONFIRM SELECTION
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
