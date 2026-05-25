"use client";

import { useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useOnboarding } from "@/context/OnboardingContext";

export function GoogleAuthStep() {
  const { step, selectedTeam, setStep } = useOnboarding();
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status !== "authenticated") return;
    setStep("COMPLETE");
    router.replace("/stadium");
  }, [status, setStep, router]);

  if (step !== "GOOGLE_AUTH" || !selectedTeam) {
    return null;
  }

  return (
    <section className="flex min-h-screen items-center justify-center bg-[#0a0a0f] px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-black/40 p-8 text-center backdrop-blur-xl">
        <h1 className="text-2xl font-bold text-white">Sign In with Google to Claim Your Fan Passport</h1>
        <p className="mt-3 text-sm text-white/60">Selected nation: {selectedTeam.name}</p>
        <button
          onClick={() => signIn("google", { callbackUrl: "/stadium" })}
          className="mt-6 w-full rounded-xl bg-[var(--country-accent)] px-4 py-3 text-sm font-bold text-black"
        >
          Continue with Google
        </button>
      </div>
    </section>
  );
}
