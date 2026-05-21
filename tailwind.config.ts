import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        pitch: "#0a1a0f",
        stadium: "#0d0d12",
        floodlight: "#f5c842",
        grass: "#1a4a2a",
        crowd: "#1e1e2e",
        chalk: "#e8e8e8",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      backgroundImage: {
        "pitch-lines": "url('/pitch-lines.svg')",
        "stadium-glow":
          "radial-gradient(ellipse at 50% 0%, rgba(245,200,66,0.15) 0%, transparent 70%)",
      },
    },
  },
  plugins: [],
};

export default config;
