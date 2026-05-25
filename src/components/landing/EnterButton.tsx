"use client";

import { useRouter } from "next/navigation";

/**
 * Primary landing CTA — takes the user into the onboarding flow.
 * Uses --country-accent CSS variable for theming (set by the layout script
 * from the supporter_nation cookie, or defaults to #e94560).
 */
export default function EnterButton() {
  const router = useRouter();

  return (
    <button
      id="enter-stadium-btn"
      onClick={() => router.push("/onboarding")}
      className="group relative px-10 py-4 text-xl font-bold text-white rounded-2xl overflow-hidden transition-all duration-200 hover:scale-105"
      style={{
        background: "var(--country-accent, #e94560)",
        boxShadow: "0 0 30px rgba(234, 69, 96, 0.6), 0 4px 16px rgba(0,0,0,0.4)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.boxShadow =
          "0 0 60px rgba(234, 69, 96, 0.9), 0 4px 24px rgba(0,0,0,0.5)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.boxShadow =
          "0 0 30px rgba(234, 69, 96, 0.6), 0 4px 16px rgba(0,0,0,0.4)";
      }}
    >
      Enter Stadium
    </button>
  );
}
