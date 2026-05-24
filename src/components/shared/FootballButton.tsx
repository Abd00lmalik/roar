"use client";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
};

const variants: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-yellow-500 to-amber-400 text-black font-semibold",
  secondary:
    "glass-panel border border-amber-300/40 text-amber-200",
  danger: "bg-red-600/90 text-white",
};

export function FootballButton({
  className,
  variant = "primary",
  children,
  ...props
}: Props) {
  return (
    <button
      className={cn(
        "rounded-lg px-4 py-2 text-sm uppercase tracking-wide transition-transform duration-200 hover:-translate-y-0.5 hover:scale-[1.01] active:scale-[0.98]",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
