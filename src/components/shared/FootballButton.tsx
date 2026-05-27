"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
};

const variants: Record<Variant, string> = {
  primary:
    "bg-[var(--country-accent,#FFCE00)] text-black font-semibold hover:brightness-110 shadow-[0_0_20px_rgba(255,206,0,0.15)]",
  secondary:
    "glass-panel border border-[var(--country-accent,#FFCE00)]/45 text-[var(--country-accent,#FFCE00)] hover:bg-white/[0.04]",
  danger: "bg-red-600/90 text-white",
};

export function FootballButton({
  className,
  variant = "primary",
  children,
  ...props
}: Props) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <button
        className={cn(
          "rounded-lg px-4 py-2 text-sm uppercase tracking-wide transition",
          variants[variant],
          className,
        )}
        {...props}
      >
        {children}
      </button>
    </motion.div>
  );
}
