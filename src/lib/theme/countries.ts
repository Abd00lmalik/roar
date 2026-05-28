export interface CountryConfig {
  code:         string;
  name:         string;
  flag:         string;
  confederation: "UEFA" | "CONMEBOL" | "CONCACAF" | "CAF" | "AFC" | "OFC" | "PLAYOFF";
  gradientFrom: string;
  gradientVia:  string;
  gradientTo:   string;
  accent:       string;
}

export const COUNTRIES: CountryConfig[] = [
  // ── UEFA ──────────────────────────────────────────────────────────────
  { code: "DE", name: "Germany", flag: "🇩🇪", confederation: "UEFA", gradientFrom: "#000000", gradientVia: "#DD0000", gradientTo: "#FFCE00", accent: "#FFCE00" },
  { code: "ES", name: "Spain", flag: "🇪🇸", confederation: "UEFA", gradientFrom: "#AA151B", gradientVia: "#F1BF00", gradientTo: "#AA151B", accent: "#F1BF00" },
  { code: "FR", name: "France", flag: "🇫🇷", confederation: "UEFA", gradientFrom: "#002395", gradientVia: "#FFFFFF", gradientTo: "#ED2939", accent: "#ED2939" },
  { code: "PT", name: "Portugal", flag: "🇵🇹", confederation: "UEFA", gradientFrom: "#006600", gradientVia: "#FF0000", gradientTo: "#006600", accent: "#FF0000" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱", confederation: "UEFA", gradientFrom: "#AE1C28", gradientVia: "#FFFFFF", gradientTo: "#21468B", accent: "#AE1C28" },
  { code: "BE", name: "Belgium", flag: "🇧🇪", confederation: "UEFA", gradientFrom: "#000000", gradientVia: "#FAE042", gradientTo: "#EF3340", accent: "#FAE042" },
  { code: "ENG", name: "England", flag: "🏴", confederation: "UEFA", gradientFrom: "#FFFFFF", gradientVia: "#CF142B", gradientTo: "#FFFFFF", accent: "#CF142B" },
  { code: "GB-ENG", name: "England", flag: "🏴", confederation: "UEFA", gradientFrom: "#FFFFFF", gradientVia: "#CF142B", gradientTo: "#FFFFFF", accent: "#CF142B" },
  { code: "EN", name: "England", flag: "🏴", confederation: "UEFA", gradientFrom: "#FFFFFF", gradientVia: "#CF142B", gradientTo: "#FFFFFF", accent: "#CF142B" },
  { code: "HR", name: "Croatia", flag: "🇭🇷", confederation: "UEFA", gradientFrom: "#FF0000", gradientVia: "#FFFFFF", gradientTo: "#171796", accent: "#FF0000" },
  { code: "AT", name: "Austria", flag: "🇦🇹", confederation: "UEFA", gradientFrom: "#ED2939", gradientVia: "#FFFFFF", gradientTo: "#ED2939", accent: "#ED2939" },
  { code: "HU", name: "Hungary", flag: "🇭🇺", confederation: "UEFA", gradientFrom: "#CE2939", gradientVia: "#FFFFFF", gradientTo: "#477050", accent: "#CE2939" },
  { code: "CH", name: "Switzerland", flag: "🇨🇭", confederation: "UEFA", gradientFrom: "#FF0000", gradientVia: "#FFFFFF", gradientTo: "#FF0000", accent: "#FFFFFF" },
  { code: "RS", name: "Serbia", flag: "🇷🇸", confederation: "UEFA", gradientFrom: "#C6363C", gradientVia: "#0C4076", gradientTo: "#FFFFFF", accent: "#C6363C" },
  { code: "DK", name: "Denmark", flag: "🇩🇰", confederation: "UEFA", gradientFrom: "#C60C30", gradientVia: "#FFFFFF", gradientTo: "#C60C30", accent: "#FFFFFF" },
  { code: "SK", name: "Slovakia", flag: "🇸🇰", confederation: "UEFA", gradientFrom: "#FFFFFF", gradientVia: "#0B4EA2", gradientTo: "#EE1C25", accent: "#0B4EA2" },
  { code: "AL", name: "Albania", flag: "🇦🇱", confederation: "UEFA", gradientFrom: "#E41E20", gradientVia: "#000000", gradientTo: "#E41E20", accent: "#E41E20" },
  { code: "GR", name: "Greece", flag: "🇬🇷", confederation: "UEFA", gradientFrom: "#0D5EAF", gradientVia: "#FFFFFF", gradientTo: "#0D5EAF", accent: "#FFFFFF" },

  // ── CONMEBOL ───────────────────────────────────────────────────────────
  { code: "AR", name: "Argentina", flag: "🇦🇷", confederation: "CONMEBOL", gradientFrom: "#74ACDF", gradientVia: "#FFFFFF", gradientTo: "#74ACDF", accent: "#74ACDF" },
  { code: "BR", name: "Brazil", flag: "🇧🇷", confederation: "CONMEBOL", gradientFrom: "#009C3B", gradientVia: "#FFDF00", gradientTo: "#002776", accent: "#FFDF00" },
  { code: "CO", name: "Colombia", flag: "🇨🇴", confederation: "CONMEBOL", gradientFrom: "#FCD116", gradientVia: "#003893", gradientTo: "#CE1126", accent: "#FCD116" },
  { code: "UY", name: "Uruguay", flag: "🇺🇾", confederation: "CONMEBOL", gradientFrom: "#5EB6E4", gradientVia: "#FFFFFF", gradientTo: "#5EB6E4", accent: "#5EB6E4" },
  { code: "EC", name: "Ecuador", flag: "🇪🇨", confederation: "CONMEBOL", gradientFrom: "#FFD100", gradientVia: "#003580", gradientTo: "#EF3340", accent: "#FFD100" },
  { code: "VE", name: "Venezuela", flag: "🇻🇪", confederation: "CONMEBOL", gradientFrom: "#CF142B", gradientVia: "#003893", gradientTo: "#CF142B", accent: "#FCD116" },

  // ── CONCACAF ───────────────────────────────────────────────────────────
  { code: "US", name: "United States", flag: "🇺🇸", confederation: "CONCACAF", gradientFrom: "#B22234", gradientVia: "#FFFFFF", gradientTo: "#3C3B6E", accent: "#B22234" },
  { code: "MX", name: "Mexico", flag: "🇲🇽", confederation: "CONCACAF", gradientFrom: "#006847", gradientVia: "#FFFFFF", gradientTo: "#CE1126", accent: "#006847" },
  { code: "CA", name: "Canada", flag: "🇨🇦", confederation: "CONCACAF", gradientFrom: "#FF0000", gradientVia: "#FFFFFF", gradientTo: "#FF0000", accent: "#FF0000" },
  { code: "PA", name: "Panama", flag: "🇵🇦", confederation: "CONCACAF", gradientFrom: "#FFFFFF", gradientVia: "#005293", gradientTo: "#DA121A", accent: "#005293" },
  { code: "HN", name: "Honduras", flag: "🇭🇳", confederation: "CONCACAF", gradientFrom: "#0073CF", gradientVia: "#FFFFFF", gradientTo: "#0073CF", accent: "#0073CF" },
  { code: "JM", name: "Jamaica", flag: "🇯🇲", confederation: "CONCACAF", gradientFrom: "#000000", gradientVia: "#FED100", gradientTo: "#009B3A", accent: "#FED100" },

  // ── CAF ────────────────────────────────────────────────────────────────
  { code: "MA", name: "Morocco", flag: "🇲🇦", confederation: "CAF", gradientFrom: "#C1272D", gradientVia: "#006233", gradientTo: "#C1272D", accent: "#006233" },
  { code: "EG", name: "Egypt", flag: "🇪🇬", confederation: "CAF", gradientFrom: "#CE1126", gradientVia: "#FFFFFF", gradientTo: "#000000", accent: "#CE1126" },
  { code: "SN", name: "Senegal", flag: "🇸🇳", confederation: "CAF", gradientFrom: "#00853F", gradientVia: "#FDEF42", gradientTo: "#E31B23", accent: "#FDEF42" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦", confederation: "CAF", gradientFrom: "#007A4D", gradientVia: "#FFB612", gradientTo: "#002395", accent: "#FFB612" },
  { code: "CI", name: "Côte d'Ivoire", flag: "🇨🇮", confederation: "CAF", gradientFrom: "#F77F00", gradientVia: "#FFFFFF", gradientTo: "#009A44", accent: "#F77F00" },
  { code: "GH", name: "Ghana", flag: "🇬🇭", confederation: "CAF", gradientFrom: "#006B3F", gradientVia: "#FCD116", gradientTo: "#CE1126", accent: "#FCD116" },
  { code: "TN", name: "Tunisia", flag: "🇹🇳", confederation: "CAF", gradientFrom: "#E70013", gradientVia: "#FFFFFF", gradientTo: "#E70013", accent: "#E70013" },
  { code: "ML", name: "Mali", flag: "🇲🇱", confederation: "CAF", gradientFrom: "#14B53A", gradientVia: "#FCD116", gradientTo: "#CE1126", accent: "#FCD116" },
  { code: "DZ", name: "Algeria", flag: "🇩🇿", confederation: "CAF", gradientFrom: "#006233", gradientVia: "#FFFFFF", gradientTo: "#006233", accent: "#D21034" },

  // ── AFC ────────────────────────────────────────────────────────────────
  { code: "JP", name: "Japan", flag: "🇯🇵", confederation: "AFC", gradientFrom: "#BC002D", gradientVia: "#FFFFFF", gradientTo: "#BC002D", accent: "#BC002D" },
  { code: "KR", name: "South Korea", flag: "🇰🇷", confederation: "AFC", gradientFrom: "#003478", gradientVia: "#FFFFFF", gradientTo: "#CD2E3A", accent: "#CD2E3A" },
  { code: "IR", name: "Iran", flag: "🇮🇷", confederation: "AFC", gradientFrom: "#239F40", gradientVia: "#FFFFFF", gradientTo: "#DA0000", accent: "#239F40" },
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦", confederation: "AFC", gradientFrom: "#006C35", gradientVia: "#FFFFFF", gradientTo: "#006C35", accent: "#FFFFFF" },
  { code: "AU", name: "Australia", flag: "🇦🇺", confederation: "AFC", gradientFrom: "#00008B", gradientVia: "#FFFFFF", gradientTo: "#FF0000", accent: "#FF0000" },
  { code: "UZ", name: "Uzbekistan", flag: "🇺🇿", confederation: "AFC", gradientFrom: "#1EB53A", gradientVia: "#FFFFFF", gradientTo: "#CE1126", accent: "#1EB53A" },
  { code: "QA", name: "Qatar", flag: "🇶🇦", confederation: "AFC", gradientFrom: "#8D1B3D", gradientVia: "#FFFFFF", gradientTo: "#8D1B3D", accent: "#FFFFFF" },
  { code: "JO", name: "Jordan", flag: "🇯🇴", confederation: "AFC", gradientFrom: "#007A3D", gradientVia: "#FFFFFF", gradientTo: "#CE1126", accent: "#CE1126" },
  { code: "IQ", name: "Iraq", flag: "🇮🇶", confederation: "AFC", gradientFrom: "#CE1126", gradientVia: "#FFFFFF", gradientTo: "#000000", accent: "#007A3D" },

  // ── OFC ────────────────────────────────────────────────────────────────
  { code: "NZ", name: "New Zealand", flag: "🇳🇿", confederation: "OFC", gradientFrom: "#00247D", gradientVia: "#FFFFFF", gradientTo: "#CC142B", accent: "#CC142B" },

  // ── Intercontinental Playoffs ──────────────────────────────────────────
  { code: "CD", name: "DR Congo", flag: "🇨🇩", confederation: "PLAYOFF", gradientFrom: "#007FFF", gradientVia: "#F7D900", gradientTo: "#CE1126", accent: "#F7D900" },
  { code: "IQ", name: "Iraq", flag: "🇮🇶", confederation: "PLAYOFF", gradientFrom: "#CE1126", gradientVia: "#FFFFFF", gradientTo: "#000000", accent: "#007A3D" }
];

export const COUNTRY_MAP = new Map(COUNTRIES.map((country) => [country.code, country]));
