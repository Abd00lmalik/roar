"use client";

import { Dispatch, SetStateAction, useState, useRef, useEffect } from "react";
import { COUNTRIES } from "@/lib/theme/countries";
import { CountryFlag } from "@/components/ui/CountryFlag";

type Props = {
  category: string;
  setCategory: Dispatch<SetStateAction<string>>;
  country: string;
  setCountry: Dispatch<SetStateAction<string>>;
};

function CountrySelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const displayTeams = COUNTRIES.filter(
    (c) => !c.code.startsWith("TBD") && c.confederation !== "PLAYOFF"
  );

  const selectedTeam = displayTeams.find((t) => t.code === value);

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full rounded bg-black/30 p-2 text-sm text-left flex items-center justify-between border border-white/5 hover:border-white/10 transition-all cursor-pointer text-white"
      >
        <span className="flex items-center gap-2">
          {selectedTeam ? (
            <>
              <CountryFlag code={selectedTeam.code} className="w-5 h-3.5 object-cover rounded-sm shadow-sm inline-block" />
              <span className="truncate">{selectedTeam.name}</span>
            </>
          ) : (
            <span>All Countries</span>
          )}
        </span>
        <span className="text-white/40 text-xs select-none">▼</span>
      </button>

      {open && (
        <div className="absolute left-0 right-0 mt-1 max-h-[220px] overflow-y-auto z-50 rounded border border-white/15 bg-slate-900 shadow-2xl p-1 space-y-0.5 custom-scrollbar">
          <button
            type="button"
            onClick={() => {
              onChange("All");
              setOpen(false);
            }}
            className={`w-full rounded p-2 text-xs text-left hover:bg-white/10 transition-colors flex items-center gap-2 cursor-pointer text-white ${
              value === "All" ? "bg-white/5 font-semibold" : ""
            }`}
          >
            All Countries
          </button>
          {displayTeams.map((c) => (
            <button
              key={c.code}
              type="button"
              onClick={() => {
                onChange(c.code);
                setOpen(false);
              }}
              className={`w-full rounded p-2 text-xs text-left hover:bg-white/10 transition-colors flex items-center gap-2 cursor-pointer text-white ${
                value === c.code ? "bg-white/5 font-semibold text-[var(--country-accent)]" : ""
              }`}
            >
              <CountryFlag code={c.code} className="w-5 h-3.5 object-cover rounded-sm shadow-sm" />
              <span className="truncate">{c.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function CategorySelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const options = [
    "All",
    "Match Previews",
    "Fan Reactions",
    "Tactical Breakdowns",
    "Banter Clips",
  ];

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full rounded bg-black/30 p-2 text-sm text-left flex items-center justify-between border border-white/5 hover:border-white/10 transition-all cursor-pointer text-white"
      >
        <span>{value}</span>
        <span className="text-white/40 text-xs select-none">▼</span>
      </button>

      {open && (
        <div className="absolute left-0 right-0 mt-1 max-h-[220px] overflow-y-auto z-50 rounded border border-white/15 bg-slate-900 shadow-2xl p-1 space-y-0.5 custom-scrollbar">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className={`w-full rounded p-2 text-xs text-left hover:bg-white/10 transition-colors cursor-pointer text-white ${
                value === opt ? "bg-white/5 font-semibold text-[var(--country-accent)]" : ""
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function FeedFilters({ category, setCategory, country, setCountry }: Props) {
  return (
    <aside className="glass-panel p-3 space-y-3">
      <h3 className="font-semibold text-sm">Filters</h3>
      
      <div>
        <label className="mb-1.5 block text-xs text-chalk/70">Category</label>
        <CategorySelect value={category} onChange={setCategory} />
      </div>

      <div>
        <label className="mb-1.5 block text-xs text-chalk/70">Country</label>
        <CountrySelect value={country} onChange={setCountry} />
      </div>
    </aside>
  );
}
