"use client";

import { useRouter } from "next/navigation";

export function EnterStadiumButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push("/onboarding")}
      className="rounded-2xl bg-[var(--country-accent)] px-8 py-4 text-lg font-bold text-black shadow-[0_0_30px_var(--country-accent)] transition hover:brightness-110"
    >
      Enter Stadium
    </button>
  );
}
