"use client";

import { Dispatch, SetStateAction } from "react";
import { COUNTRIES } from "@/lib/theme/countries";

type Props = {
  category: string;
  setCategory: Dispatch<SetStateAction<string>>;
  country: string;
  setCountry: Dispatch<SetStateAction<string>>;
};

export function FeedFilters({ category, setCategory, country, setCountry }: Props) {
  return (
    <aside className="glass-panel p-3">
      <h3 className="mb-3 font-semibold">Filters</h3>
      <label className="mb-2 block text-xs text-chalk/70">Category</label>
      <select
        className="mb-4 w-full rounded bg-black/30 p-2 text-sm"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        <option value="All">All</option>
        <option>Match Previews</option>
        <option>Fan Reactions</option>
        <option>Tactical Breakdowns</option>
        <option>Banter Clips</option>
      </select>
      <label className="mb-2 block text-xs text-chalk/70">Country</label>
      <select
        className="w-full rounded bg-black/30 p-2 text-sm"
        value={country}
        onChange={(e) => setCountry(e.target.value)}
      >
        <option value="All">All</option>
        {COUNTRIES.map((c) => (
          <option key={c.code} value={c.code}>
            {c.flag} {c.name}
          </option>
        ))}
      </select>
    </aside>
  );
}
