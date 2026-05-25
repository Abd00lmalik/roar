import { WC2026_TEAMS } from "@/lib/data/wc2026-teams";

export interface CountryConfig {
  code: string;
  name: string;
  flag: string;
  confederation: "CONCACAF" | "AFC" | "CAF" | "CONMEBOL" | "OFC" | "UEFA";
  gradientFrom: string;
  gradientVia: string;
  gradientTo: string;
  accent: string;
}

export const COUNTRIES: CountryConfig[] = WC2026_TEAMS.map((team) => ({
  code: team.code,
  name: team.name,
  flag: team.flagEmoji,
  confederation: team.confederation,
  gradientFrom: team.colors.from,
  gradientVia: team.colors.via,
  gradientTo: team.colors.to,
  accent: team.colors.accent,
}));

export const COUNTRY_MAP = new Map(COUNTRIES.map((country) => [country.code, country]));
export const WC2026_QUALIFIERS = COUNTRIES;
