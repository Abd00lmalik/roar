"use client";

import { Dispatch, SetStateAction } from "react";
import { cn } from "@/lib/utils";

const categories = [
  "All",
  "Match Previews",
  "Fan Reactions",
  "Tactical Breakdowns",
  "Watch Parties",
  "Team Rooms",
  "Banter Clips",
  "Creator Shows",
  "Country Highlights",
];

export function CategoryTabs({
  category,
  setCategory,
}: {
  category: string;
  setCategory: Dispatch<SetStateAction<string>>;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {categories.map((item) => (
        <button
          key={item}
          onClick={() => setCategory(item)}
          className={cn(
            "rounded-full border px-3 py-1 text-xs whitespace-nowrap",
            category === item
              ? "border-floodlight bg-floodlight/20 text-floodlight"
              : "border-white/20 text-chalk/70",
          )}
        >
          {item}
        </button>
      ))}
    </div>
  );
}
