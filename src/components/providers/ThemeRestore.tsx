"use client";

import { useEffect } from "react";

export function ThemeRestore() {
  useEffect(() => {
    const saved = localStorage.getItem("roar_selected_team");
    if (!saved) return;
    try {
      const team = JSON.parse(saved);
      const root = document.documentElement;
      root.style.setProperty("--country-from",   team.gradientFrom || team.colors?.from);
      root.style.setProperty("--country-via",    team.gradientVia || team.colors?.via);
      root.style.setProperty("--country-to",     team.gradientTo || team.colors?.to);
      root.style.setProperty("--country-accent", team.accent || team.colors?.accent);
    } catch {}
  }, []);

  return null;
}
