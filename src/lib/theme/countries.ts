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
  // UEFA (16)
  { code: "DE", name: "Germany", flag: "🇩🇪", confederation: "UEFA", gradientFrom: "#000000", gradientVia: "#DD0000", gradientTo: "#FFCE00", accent: "#FFCE00" },
  { code: "ES", name: "Spain", flag: "🇪🇸", confederation: "UEFA", gradientFrom: "#AA151B", gradientVia: "#F1BF00", gradientTo: "#AA151B", accent: "#F1BF00" },
  { code: "FR", name: "France", flag: "🇫🇷", confederation: "UEFA", gradientFrom: "#002395", gradientVia: "#EDEDED", gradientTo: "#ED2939", accent: "#ED2939" },
  { code: "PT", name: "Portugal", flag: "🇵🇹", confederation: "UEFA", gradientFrom: "#006600", gradientVia: "#FF0000", gradientTo: "#FFD700", accent: "#FFD700" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱", confederation: "UEFA", gradientFrom: "#AE1C28", gradientVia: "#FFFFFF", gradientTo: "#21468B", accent: "#FF4F00" },
  { code: "BE", name: "Belgium", flag: "🇧🇪", confederation: "UEFA", gradientFrom: "#000000", gradientVia: "#FDDA0D", gradientTo: "#EF3340", accent: "#EF3340" },
  { code: "EN", name: "England", flag: "🏴", confederation: "UEFA", gradientFrom: "#FFFFFF", gradientVia: "#CF0820", gradientTo: "#FFFFFF", accent: "#CF0820" },
  { code: "HR", name: "Croatia", flag: "🇭🇷", confederation: "UEFA", gradientFrom: "#FF0000", gradientVia: "#FFFFFF", gradientTo: "#171796", accent: "#FF0000" },
  { code: "AT", name: "Austria", flag: "🇦🇹", confederation: "UEFA", gradientFrom: "#ED2939", gradientVia: "#FFFFFF", gradientTo: "#ED2939", accent: "#ED2939" },
  { code: "HU", name: "Hungary", flag: "🇭🇺", confederation: "UEFA", gradientFrom: "#CE1126", gradientVia: "#FFFFFF", gradientTo: "#477050", accent: "#CE1126" },
  { code: "CH", name: "Switzerland", flag: "🇨🇭", confederation: "UEFA", gradientFrom: "#FF0000", gradientVia: "#FFFFFF", gradientTo: "#FF0000", accent: "#FF0000" },
  { code: "RS", name: "Serbia", flag: "🇷🇸", confederation: "UEFA", gradientFrom: "#C6363C", gradientVia: "#0C4076", gradientTo: "#FFFFFF", accent: "#D4A373" },
  { code: "DK", name: "Denmark", flag: "🇩🇰", confederation: "UEFA", gradientFrom: "#C8102E", gradientVia: "#FFFFFF", gradientTo: "#C8102E", accent: "#C8102E" },
  { code: "SK", name: "Slovakia", flag: "🇸🇰", confederation: "UEFA", gradientFrom: "#FFFFFF", gradientVia: "#0B4EA2", gradientTo: "#EE1C25", accent: "#EE1C25" },
  { code: "AL", name: "Albania", flag: "🇦🇱", confederation: "UEFA", gradientFrom: "#E41B13", gradientVia: "#000000", gradientTo: "#E41B13", accent: "#E41B13" },
  { code: "GR", name: "Greece", flag: "🇬🇷", confederation: "UEFA", gradientFrom: "#0D5EAF", gradientVia: "#FFFFFF", gradientTo: "#0D5EAF", accent: "#0D5EAF" },

  // CONMEBOL (6)
  { code: "AR", name: "Argentina", flag: "🇦🇷", confederation: "CONMEBOL", gradientFrom: "#74ACDF", gradientVia: "#FFFFFF", gradientTo: "#74ACDF", accent: "#F6B40E" },
  { code: "BR", name: "Brazil", flag: "🇧🇷", confederation: "CONMEBOL", gradientFrom: "#009C3B", gradientVia: "#FFDF00", gradientTo: "#002776", accent: "#FFDF00" },
  { code: "CO", name: "Colombia", flag: "🇨🇴", confederation: "CONMEBOL", gradientFrom: "#FCD116", gradientVia: "#003893", gradientTo: "#CE1126", accent: "#FCD116" },
  { code: "UY", name: "Uruguay", flag: "🇺🇾", confederation: "CONMEBOL", gradientFrom: "#0081C6", gradientVia: "#FFFFFF", gradientTo: "#FCD116", accent: "#FCD116" },
  { code: "EC", name: "Ecuador", flag: "🇪🇨", confederation: "CONMEBOL", gradientFrom: "#FFD700", gradientVia: "#003087", gradientTo: "#DA291C", accent: "#FFD700" },
  { code: "VE", name: "Venezuela", flag: "🇻🇪", confederation: "CONMEBOL", gradientFrom: "#FCD116", gradientVia: "#003893", gradientTo: "#CE1126", accent: "#FCD116" },

  // CONCACAF (6)
  { code: "US", name: "United States", flag: "🇺🇸", confederation: "CONCACAF", gradientFrom: "#B22234", gradientVia: "#FFFFFF", gradientTo: "#3C3B6E", accent: "#B22234" },
  { code: "MX", name: "Mexico", flag: "🇲🇽", confederation: "CONCACAF", gradientFrom: "#006847", gradientVia: "#FFFFFF", gradientTo: "#CE1126", accent: "#006847" },
  { code: "CA", name: "Canada", flag: "🇨🇦", confederation: "CONCACAF", gradientFrom: "#FF0000", gradientVia: "#FFFFFF", gradientTo: "#FF0000", accent: "#FF0000" },
  { code: "PA", name: "Panama", flag: "🇵🇦", confederation: "CONCACAF", gradientFrom: "#002F6C", gradientVia: "#FFFFFF", gradientTo: "#D21034", accent: "#D21034" },
  { code: "HN", name: "Honduras", flag: "🇭🇳", confederation: "CONCACAF", gradientFrom: "#0073CF", gradientVia: "#FFFFFF", gradientTo: "#0073CF", accent: "#0073CF" },
  { code: "JM", name: "Jamaica", flag: "🇯🇲", confederation: "CONCACAF", gradientFrom: "#009B3A", gradientVia: "#000000", gradientTo: "#FCD116", accent: "#FCD116" },

  // CAF (9)
  { code: "MA", name: "Morocco", flag: "🇲🇦", confederation: "CAF", gradientFrom: "#C1272D", gradientVia: "#006233", gradientTo: "#C1272D", accent: "#006233" },
  { code: "EG", name: "Egypt", flag: "🇪🇬", confederation: "CAF", gradientFrom: "#CE1126", gradientVia: "#FFFFFF", gradientTo: "#000000", accent: "#C09300" },
  { code: "SN", name: "Senegal", flag: "🇸🇳", confederation: "CAF", gradientFrom: "#00853F", gradientVia: "#FDEF42", gradientTo: "#E31B23", accent: "#FDEF42" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦", confederation: "CAF", gradientFrom: "#007A4D", gradientVia: "#FFB612", gradientTo: "#000000", accent: "#FFB612" },
  { code: "CI", name: "Côte d'Ivoire", flag: "🇨🇮", confederation: "CAF", gradientFrom: "#FF8200", gradientVia: "#FFFFFF", gradientTo: "#009A44", accent: "#FF8200" },
  { code: "GH", name: "Ghana", flag: "🇬🇭", confederation: "CAF", gradientFrom: "#CE1126", gradientVia: "#FCD116", gradientTo: "#006B3F", accent: "#FCD116" },
  { code: "TN", name: "Tunisia", flag: "🇹🇳", confederation: "CAF", gradientFrom: "#E41B13", gradientVia: "#FFFFFF", gradientTo: "#E41B13", accent: "#E41B13" },
  { code: "ML", name: "Mali", flag: "🇲🇱", confederation: "CAF", gradientFrom: "#14B53A", gradientVia: "#FED105", gradientTo: "#E51D28", accent: "#FED105" },
  { code: "DZ", name: "Algeria", flag: "🇩🇿", confederation: "CAF", gradientFrom: "#006233", gradientVia: "#FFFFFF", gradientTo: "#D21034", accent: "#D21034" },

  // AFC (8)
  { code: "JP", name: "Japan", flag: "🇯🇵", confederation: "AFC", gradientFrom: "#BC002D", gradientVia: "#FFFFFF", gradientTo: "#BC002D", accent: "#BC002D" },
  { code: "KR", name: "South Korea", flag: "🇰🇷", confederation: "AFC", gradientFrom: "#FFFFFF", gradientVia: "#003478", gradientTo: "#CD2E3A", accent: "#CD2E3A" },
  { code: "IR", name: "Iran", flag: "🇮🇷", confederation: "AFC", gradientFrom: "#239F40", gradientVia: "#FFFFFF", gradientTo: "#DA251D", accent: "#239F40" },
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦", confederation: "AFC", gradientFrom: "#006C35", gradientVia: "#FFFFFF", gradientTo: "#006C35", accent: "#006C35" },
  { code: "AU", name: "Australia", flag: "🇦🇺", confederation: "AFC", gradientFrom: "#00008B", gradientVia: "#FF0000", gradientTo: "#FFFFFF", accent: "#FFD700" },
  { code: "UZ", name: "Uzbekistan", flag: "🇺🇿", confederation: "AFC", gradientFrom: "#00AEF0", gradientVia: "#FFFFFF", gradientTo: "#1EB53A", accent: "#00AEF0" },
  { code: "QA", name: "Qatar", flag: "🇶🇦", confederation: "AFC", gradientFrom: "#8A1538", gradientVia: "#FFFFFF", gradientTo: "#8A1538", accent: "#8A1538" },
  { code: "JO", name: "Jordan", flag: "🇯🇴", confederation: "AFC", gradientFrom: "#000000", gradientVia: "#FFFFFF", gradientTo: "#1A9345", accent: "#E60000" },

  // OFC (1)
  { code: "NZ", name: "New Zealand", flag: "🇳🇿", confederation: "OFC", gradientFrom: "#000000", gradientVia: "#FFFFFF", gradientTo: "#000000", accent: "#FFFFFF" },

  // PLAYOFF (2)
  { code: "TBD_A", name: "Intercontinental Playoff A", flag: "🏳️", confederation: "PLAYOFF", gradientFrom: "#4B5563", gradientVia: "#1F2937", gradientTo: "#9CA3AF", accent: "#FFFFFF" }, // FIXME: confirm post-playoff
  { code: "TBD_B", name: "Intercontinental Playoff B", flag: "🏳️", confederation: "PLAYOFF", gradientFrom: "#4B5563", gradientVia: "#1F2937", gradientTo: "#9CA3AF", accent: "#FFFFFF" }, // FIXME: confirm post-playoff
];

export const COUNTRY_MAP = new Map(COUNTRIES.map((country) => [country.code, country]));
export const WC2026_QUALIFIERS = COUNTRIES;
