"use client";

import { Dispatch, SetStateAction } from "react";
import { cn } from "@/lib/utils";

const categories = [
  "All",
  "Highlights",
  "Match Previews",
  "Fan Reactions",
  "Tactical Breakdowns",
  "Fan Culture",
  "Documentaries",
];

export function CategoryTabs({
  category,
  setCategory,
}: {
  category: string;
  setCategory: Dispatch<SetStateAction<string>>;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
      {categories.map((item) => (
        <button
          key={item}
          onClick={() => setCategory(item)}
          className={cn(
            "rounded-full border px-4 py-1.5 text-xs whitespace-nowrap transition-all duration-200 cursor-pointer active:scale-95",
            category === item
              ? "border-[var(--country-accent,#FFCC00)] bg-[var(--country-accent,#FFCC00)]/15 text-[var(--country-accent,#FFCC00)] font-semibold shadow-[0_0_12px_rgba(255,204,0,0.1)]"
              : "border-white/10 text-chalk/60 hover:text-white hover:bg-white/5",
          )}
        >
          {item}
        </button>
      ))}
    </div>
  );
}
