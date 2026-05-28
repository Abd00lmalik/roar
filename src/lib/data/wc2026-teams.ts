/**
 * WC2026 Official 48-Team Dataset
 *
 * Source of truth for country codes, confederation, emoji, and color themes.
 * Uses official, verified flag specifications.
 */

export interface WC2026Team {
  readonly code: string;
  readonly name: string;
  readonly flag: string;
  readonly emoji: string;
  readonly confederation: string;
  readonly conf: string;
  readonly from: string;
  readonly via: string;
  readonly to: string;
  readonly accent: string;
  readonly colors: {
    readonly from: string;
    readonly via: string;
    readonly to: string;
    readonly accent: string;
  };
}

export const WC2026_TEAMS = [
  // ── UEFA ──────────────────────────────────────────────────────────────
  { code: "DE", name: "Germany", flag: "🇩🇪", emoji: "🇩🇪", confederation: "UEFA", conf: "UEFA", from: "#000000", via: "#DD0000", to: "#FFCE00", accent: "#FFCE00", colors: { from: "#000000", via: "#DD0000", to: "#FFCE00", accent: "#FFCE00" } },
  { code: "ES", name: "Spain", flag: "🇪🇸", emoji: "🇪🇸", confederation: "UEFA", conf: "UEFA", from: "#AA151B", via: "#F1BF00", to: "#AA151B", accent: "#F1BF00", colors: { from: "#AA151B", via: "#F1BF00", to: "#AA151B", accent: "#F1BF00" } },
  { code: "FR", name: "France", flag: "🇫🇷", emoji: "🇫🇷", confederation: "UEFA", conf: "UEFA", from: "#002395", via: "#FFFFFF", to: "#ED2939", accent: "#ED2939", colors: { from: "#002395", via: "#FFFFFF", to: "#ED2939", accent: "#ED2939" } },
  { code: "PT", name: "Portugal", flag: "🇵🇹", emoji: "🇵🇹", confederation: "UEFA", conf: "UEFA", from: "#006600", via: "#FF0000", to: "#006600", accent: "#FF0000", colors: { from: "#006600", via: "#FF0000", to: "#006600", accent: "#FF0000" } },
  { code: "NL", name: "Netherlands", flag: "🇳🇱", emoji: "🇳🇱", confederation: "UEFA", conf: "UEFA", from: "#AE1C28", via: "#FFFFFF", to: "#21468B", accent: "#AE1C28", colors: { from: "#AE1C28", via: "#FFFFFF", to: "#21468B", accent: "#AE1C28" } },
  { code: "BE", name: "Belgium", flag: "🇧🇪", emoji: "🇧🇪", confederation: "UEFA", conf: "UEFA", from: "#000000", via: "#FAE042", to: "#EF3340", accent: "#FAE042", colors: { from: "#000000", via: "#FAE042", to: "#EF3340", accent: "#FAE042" } },
  { code: "ENG", name: "England", flag: "🏴", emoji: "🏴", confederation: "UEFA", conf: "UEFA", from: "#FFFFFF", via: "#CF142B", to: "#FFFFFF", accent: "#CF142B", colors: { from: "#FFFFFF", via: "#CF142B", to: "#FFFFFF", accent: "#CF142B" } },
  { code: "GB-ENG", name: "England", flag: "🏴", emoji: "🏴", confederation: "UEFA", conf: "UEFA", from: "#FFFFFF", via: "#CF142B", to: "#FFFFFF", accent: "#CF142B", colors: { from: "#FFFFFF", via: "#CF142B", to: "#FFFFFF", accent: "#CF142B" } },
  { code: "EN", name: "England", flag: "🏴", emoji: "🏴", confederation: "UEFA", conf: "UEFA", from: "#FFFFFF", via: "#CF142B", to: "#FFFFFF", accent: "#CF142B", colors: { from: "#FFFFFF", via: "#CF142B", to: "#FFFFFF", accent: "#CF142B" } },
  { code: "HR", name: "Croatia", flag: "🇭🇷", emoji: "🇭🇷", confederation: "UEFA", conf: "UEFA", from: "#FF0000", via: "#FFFFFF", to: "#171796", accent: "#FF0000", colors: { from: "#FF0000", via: "#FFFFFF", to: "#171796", accent: "#FF0000" } },
  { code: "AT", name: "Austria", flag: "🇦🇹", emoji: "🇦🇹", confederation: "UEFA", conf: "UEFA", from: "#ED2939", via: "#FFFFFF", to: "#ED2939", accent: "#ED2939", colors: { from: "#ED2939", via: "#FFFFFF", to: "#ED2939", accent: "#ED2939" } },
  { code: "HU", name: "Hungary", flag: "🇭🇺", emoji: "🇭🇺", confederation: "UEFA", conf: "UEFA", from: "#CE2939", via: "#FFFFFF", to: "#477050", accent: "#CE2939", colors: { from: "#CE2939", via: "#FFFFFF", to: "#477050", accent: "#CE2939" } },
  { code: "CH", name: "Switzerland", flag: "🇨🇭", emoji: "🇨🇭", confederation: "UEFA", conf: "UEFA", from: "#FF0000", via: "#FFFFFF", to: "#FF0000", accent: "#FFFFFF", colors: { from: "#FF0000", via: "#FFFFFF", to: "#FF0000", accent: "#FFFFFF" } },
  { code: "RS", name: "Serbia", flag: "🇷🇸", emoji: "🇷🇸", confederation: "UEFA", conf: "UEFA", from: "#C6363C", via: "#0C4076", to: "#FFFFFF", accent: "#C6363C", colors: { from: "#C6363C", via: "#0C4076", to: "#FFFFFF", accent: "#C6363C" } },
  { code: "DK", name: "Denmark", flag: "🇩🇰", emoji: "🇩🇰", confederation: "UEFA", conf: "UEFA", from: "#C60C30", via: "#FFFFFF", to: "#C60C30", accent: "#FFFFFF", colors: { from: "#C60C30", via: "#FFFFFF", to: "#C60C30", accent: "#FFFFFF" } },
  { code: "SK", name: "Slovakia", flag: "🇸🇰", emoji: "🇸🇰", confederation: "UEFA", conf: "UEFA", from: "#FFFFFF", via: "#0B4EA2", to: "#EE1C25", accent: "#0B4EA2", colors: { from: "#FFFFFF", via: "#0B4EA2", to: "#EE1C25", accent: "#0B4EA2" } },
  { code: "AL", name: "Albania", flag: "🇦🇱", emoji: "🇦🇱", confederation: "UEFA", conf: "UEFA", from: "#E41E20", via: "#000000", to: "#E41E20", accent: "#E41E20", colors: { from: "#E41E20", via: "#000000", to: "#E41E20", accent: "#E41E20" } },
  { code: "GR", name: "Greece", flag: "🇬🇷", emoji: "🇬🇷", confederation: "UEFA", conf: "UEFA", from: "#0D5EAF", via: "#FFFFFF", to: "#0D5EAF", accent: "#FFFFFF", colors: { from: "#0D5EAF", via: "#FFFFFF", to: "#0D5EAF", accent: "#FFFFFF" } },

  // ── CONMEBOL ───────────────────────────────────────────────────────────
  { code: "AR", name: "Argentina", flag: "🇦🇷", emoji: "🇦🇷", confederation: "CONMEBOL", conf: "CONMEBOL", from: "#74ACDF", via: "#FFFFFF", to: "#74ACDF", accent: "#74ACDF", colors: { from: "#74ACDF", via: "#FFFFFF", to: "#74ACDF", accent: "#74ACDF" } },
  { code: "BR", name: "Brazil", flag: "🇧🇷", emoji: "🇧🇷", confederation: "CONMEBOL", conf: "CONMEBOL", from: "#009C3B", via: "#FFDF00", to: "#002776", accent: "#FFDF00", colors: { from: "#009C3B", via: "#FFDF00", to: "#002776", accent: "#FFDF00" } },
  { code: "CO", name: "Colombia", flag: "🇨🇴", emoji: "🇨🇴", confederation: "CONMEBOL", conf: "CONMEBOL", from: "#FCD116", via: "#003893", to: "#CE1126", accent: "#FCD116", colors: { from: "#FCD116", via: "#003893", to: "#CE1126", accent: "#FCD116" } },
  { code: "UY", name: "Uruguay", flag: "🇺🇾", emoji: "🇺🇾", confederation: "CONMEBOL", conf: "CONMEBOL", from: "#5EB6E4", via: "#FFFFFF", to: "#5EB6E4", accent: "#5EB6E4", colors: { from: "#5EB6E4", via: "#FFFFFF", to: "#5EB6E4", accent: "#5EB6E4" } },
  { code: "EC", name: "Ecuador", flag: "🇪🇨", emoji: "🇪🇨", confederation: "CONMEBOL", conf: "CONMEBOL", from: "#FFD100", via: "#003580", to: "#EF3340", accent: "#FFD100", colors: { from: "#FFD100", via: "#003580", to: "#EF3340", accent: "#FFD100" } },
  { code: "VE", name: "Venezuela", flag: "🇻🇪", emoji: "🇻🇪", confederation: "CONMEBOL", conf: "CONMEBOL", from: "#CF142B", via: "#003893", to: "#CF142B", accent: "#FCD116", colors: { from: "#CF142B", via: "#003893", to: "#CF142B", accent: "#FCD116" } },

  // ── CONCACAF ───────────────────────────────────────────────────────────
  { code: "US", name: "United States", flag: "🇺🇸", emoji: "🇺🇸", confederation: "CONCACAF", conf: "CONCACAF", from: "#B22234", via: "#FFFFFF", to: "#3C3B6E", accent: "#B22234", colors: { from: "#B22234", via: "#FFFFFF", to: "#3C3B6E", accent: "#B22234" } },
  { code: "MX", name: "Mexico", flag: "🇲🇽", emoji: "🇲🇽", confederation: "CONCACAF", conf: "CONCACAF", from: "#006847", via: "#FFFFFF", to: "#CE1126", accent: "#006847", colors: { from: "#006847", via: "#FFFFFF", to: "#CE1126", accent: "#006847" } },
  { code: "CA", name: "Canada", flag: "🇨🇦", emoji: "🇨🇦", confederation: "CONCACAF", conf: "CONCACAF", from: "#FF0000", via: "#FFFFFF", to: "#FF0000", accent: "#FF0000", colors: { from: "#FF0000", via: "#FFFFFF", to: "#FF0000", accent: "#FF0000" } },
  { code: "PA", name: "Panama", flag: "🇵🇦", emoji: "🇵🇦", confederation: "CONCACAF", conf: "CONCACAF", from: "#FFFFFF", via: "#005293", to: "#DA121A", accent: "#005293", colors: { from: "#FFFFFF", via: "#005293", to: "#DA121A", accent: "#005293" } },
  { code: "HN", name: "Honduras", flag: "🇭🇳", emoji: "🇭🇳", confederation: "CONCACAF", conf: "CONCACAF", from: "#0073CF", via: "#FFFFFF", to: "#0073CF", accent: "#0073CF", colors: { from: "#0073CF", via: "#FFFFFF", to: "#0073CF", accent: "#0073CF" } },
  { code: "JM", name: "Jamaica", flag: "🇯🇲", emoji: "🇯🇲", confederation: "CONCACAF", conf: "CONCACAF", from: "#000000", via: "#FED100", to: "#009B3A", accent: "#FED100", colors: { from: "#000000", via: "#FED100", to: "#009B3A", accent: "#FED100" } },

  // ── CAF ────────────────────────────────────────────────────────────────
  { code: "MA", name: "Morocco", flag: "🇲🇦", emoji: "🇲🇦", confederation: "CAF", conf: "CAF", from: "#C1272D", via: "#006233", to: "#C1272D", accent: "#006233", colors: { from: "#C1272D", via: "#006233", to: "#C1272D", accent: "#006233" } },
  { code: "EG", name: "Egypt", flag: "🇪🇬", emoji: "🇪🇬", confederation: "CAF", conf: "CAF", from: "#CE1126", via: "#FFFFFF", to: "#000000", accent: "#CE1126", colors: { from: "#CE1126", via: "#FFFFFF", to: "#000000", accent: "#CE1126" } },
  { code: "SN", name: "Senegal", flag: "🇸🇳", emoji: "🇸🇳", confederation: "CAF", conf: "CAF", from: "#00853F", via: "#FDEF42", to: "#E31B23", accent: "#FDEF42", colors: { from: "#00853F", via: "#FDEF42", to: "#E31B23", accent: "#FDEF42" } },
  { code: "ZA", name: "South Africa", flag: "🇿🇦", emoji: "🇿🇦", confederation: "CAF", conf: "CAF", from: "#007A4D", via: "#FFB612", to: "#002395", accent: "#FFB612", colors: { from: "#007A4D", via: "#FFB612", to: "#002395", accent: "#FFB612" } },
  { code: "CI", name: "Côte d'Ivoire", flag: "🇨🇮", emoji: "🇨🇮", confederation: "CAF", conf: "CAF", from: "#F77F00", via: "#FFFFFF", to: "#009A44", accent: "#F77F00", colors: { from: "#F77F00", via: "#FFFFFF", to: "#009A44", accent: "#F77F00" } },
  { code: "GH", name: "Ghana", flag: "🇬🇭", emoji: "🇬🇭", confederation: "CAF", conf: "CAF", from: "#006B3F", via: "#FCD116", to: "#CE1126", accent: "#FCD116", colors: { from: "#006B3F", via: "#FCD116", to: "#CE1126", accent: "#FCD116" } },
  { code: "TN", name: "Tunisia", flag: "🇹🇳", emoji: "🇹🇳", confederation: "CAF", conf: "CAF", from: "#E70013", via: "#FFFFFF", to: "#E70013", accent: "#E70013", colors: { from: "#E70013", via: "#FFFFFF", to: "#E70013", accent: "#E70013" } },
  { code: "ML", name: "Mali", flag: "🇲🇱", emoji: "🇲🇱", confederation: "CAF", conf: "CAF", from: "#14B53A", via: "#FCD116", to: "#CE1126", accent: "#FCD116", colors: { from: "#14B53A", via: "#FCD116", to: "#CE1126", accent: "#FCD116" } },
  { code: "DZ", name: "Algeria", flag: "🇩🇿", emoji: "🇩🇿", confederation: "CAF", conf: "CAF", from: "#006233", via: "#FFFFFF", to: "#006233", accent: "#D21034", colors: { from: "#006233", via: "#FFFFFF", to: "#006233", accent: "#D21034" } },

  // ── AFC ────────────────────────────────────────────────────────────────
  { code: "JP", name: "Japan", flag: "🇯🇵", emoji: "🇯🇵", confederation: "AFC", conf: "AFC", from: "#BC002D", via: "#FFFFFF", to: "#BC002D", accent: "#BC002D", colors: { from: "#BC002D", via: "#FFFFFF", to: "#BC002D", accent: "#BC002D" } },
  { code: "KR", name: "South Korea", flag: "🇰🇷", emoji: "🇰🇷", confederation: "AFC", conf: "AFC", from: "#003478", via: "#FFFFFF", to: "#CD2E3A", accent: "#CD2E3A", colors: { from: "#003478", via: "#FFFFFF", to: "#CD2E3A", accent: "#CD2E3A" } },
  { code: "IR", name: "Iran", flag: "🇮🇷", emoji: "🇮🇷", confederation: "AFC", conf: "AFC", from: "#239F40", via: "#FFFFFF", to: "#DA0000", accent: "#239F40", colors: { from: "#239F40", via: "#FFFFFF", to: "#DA0000", accent: "#239F40" } },
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦", emoji: "🇸🇦", confederation: "AFC", conf: "AFC", from: "#006C35", via: "#FFFFFF", to: "#006C35", accent: "#FFFFFF", colors: { from: "#006C35", via: "#FFFFFF", to: "#006C35", accent: "#FFFFFF" } },
  { code: "AU", name: "Australia", flag: "🇦🇺", emoji: "🇦🇺", confederation: "AFC", conf: "AFC", from: "#00008B", via: "#FFFFFF", to: "#FF0000", accent: "#FF0000", colors: { from: "#00008B", via: "#FFFFFF", to: "#FF0000", accent: "#FF0000" } },
  { code: "UZ", name: "Uzbekistan", flag: "🇺🇿", emoji: "🇺🇿", confederation: "AFC", conf: "AFC", from: "#1EB53A", via: "#FFFFFF", to: "#CE1126", accent: "#1EB53A", colors: { from: "#1EB53A", via: "#FFFFFF", to: "#CE1126", accent: "#1EB53A" } },
  { code: "QA", name: "Qatar", flag: "🇶🇦", emoji: "🇶🇦", confederation: "AFC", conf: "AFC", from: "#8D1B3D", via: "#FFFFFF", to: "#8D1B3D", accent: "#FFFFFF", colors: { from: "#8D1B3D", via: "#FFFFFF", to: "#8D1B3D", accent: "#FFFFFF" } },
  { code: "JO", name: "Jordan", flag: "🇯🇴", emoji: "🇯🇴", confederation: "AFC", conf: "AFC", from: "#007A3D", via: "#FFFFFF", to: "#CE1126", accent: "#CE1126", colors: { from: "#007A3D", via: "#FFFFFF", to: "#CE1126", accent: "#CE1126" } },
  { code: "IQ", name: "Iraq", flag: "🇮🇶", emoji: "🇮🇶", confederation: "AFC", conf: "AFC", from: "#CE1126", via: "#FFFFFF", to: "#000000", accent: "#007A3D", colors: { from: "#CE1126", via: "#FFFFFF", to: "#000000", accent: "#007A3D" } },

  // ── OFC ────────────────────────────────────────────────────────────────
  { code: "NZ", name: "New Zealand", flag: "🇳🇿", emoji: "🇳🇿", confederation: "OFC", conf: "OFC", from: "#00247D", via: "#FFFFFF", to: "#CC142B", accent: "#CC142B", colors: { from: "#00247D", via: "#FFFFFF", to: "#CC142B", accent: "#CC142B" } },

  // ── Intercontinental Playoffs ──────────────────────────────────────────
  { code: "CD", name: "DR Congo", flag: "🇨🇩", emoji: "🇨🇩", confederation: "PLAYOFF", conf: "PLAYOFF", from: "#007FFF", via: "#F7D900", to: "#CE1126", accent: "#F7D900", colors: { from: "#007FFF", via: "#F7D900", to: "#CE1126", accent: "#F7D900" } },
  { code: "IQ", name: "Iraq", flag: "🇮🇶", emoji: "🇮🇶", confederation: "PLAYOFF", conf: "PLAYOFF", from: "#CE1126", via: "#FFFFFF", to: "#000000", accent: "#007A3D", colors: { from: "#CE1126", via: "#FFFFFF", to: "#000000", accent: "#007A3D" } }
] as const;

export type WC2026Team = (typeof WC2026_TEAMS)[number];
export type WC2026Code = WC2026Team["code"];

/**
 * Look up a team by its country code. Returns undefined if not found.
 */
export function getTeamByCode(code: string): WC2026Team | undefined {
  return WC2026_TEAMS.find((t) => t.code === code);
}

/**
 * Get teams grouped by confederation.
 */
export function getTeamsByConf(): Record<string, WC2026Team[]> {
  return WC2026_TEAMS.reduce<Record<string, WC2026Team[]>>((acc, team) => {
    if (!acc[team.conf]) acc[team.conf] = [];
    acc[team.conf].push(team as any);
    return acc;
  }, {});
}
