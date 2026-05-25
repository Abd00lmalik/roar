export type WC2026Confederation =
  | "CONCACAF"
  | "AFC"
  | "CAF"
  | "CONMEBOL"
  | "OFC"
  | "UEFA";

export const WC2026_TEAMS = [
  { code: "US", name: "United States", confederation: "CONCACAF", flagEmoji: "🇺🇸", colors: { from: "#B22234", via: "#FFFFFF", to: "#3C3B6E", accent: "#B22234" } },
  { code: "CA", name: "Canada", confederation: "CONCACAF", flagEmoji: "🇨🇦", colors: { from: "#FF0000", via: "#FFFFFF", to: "#FF0000", accent: "#FF0000" } },
  { code: "MX", name: "Mexico", confederation: "CONCACAF", flagEmoji: "🇲🇽", colors: { from: "#006847", via: "#FFFFFF", to: "#CE1126", accent: "#006847" } },
  { code: "CW", name: "Curaçao", confederation: "CONCACAF", flagEmoji: "🇨🇼", colors: { from: "#002B7F", via: "#F9E814", to: "#FFFFFF", accent: "#002B7F" } },
  { code: "HT", name: "Haiti", confederation: "CONCACAF", flagEmoji: "🇭🇹", colors: { from: "#00209F", via: "#D21034", to: "#00209F", accent: "#D21034" } },
  { code: "PA", name: "Panama", confederation: "CONCACAF", flagEmoji: "🇵🇦", colors: { from: "#FFFFFF", via: "#DA121A", to: "#1B3F8F", accent: "#DA121A" } },

  { code: "JP", name: "Japan", confederation: "AFC", flagEmoji: "🇯🇵", colors: { from: "#FFFFFF", via: "#BC002D", to: "#FFFFFF", accent: "#BC002D" } },
  { code: "KR", name: "South Korea", confederation: "AFC", flagEmoji: "🇰🇷", colors: { from: "#003478", via: "#FFFFFF", to: "#CD2E3A", accent: "#CD2E3A" } },
  { code: "AU", name: "Australia", confederation: "AFC", flagEmoji: "🇦🇺", colors: { from: "#00008B", via: "#FFFFFF", to: "#FF0000", accent: "#FFCD00" } },
  { code: "IR", name: "Iran", confederation: "AFC", flagEmoji: "🇮🇷", colors: { from: "#239F40", via: "#FFFFFF", to: "#DA0000", accent: "#239F40" } },
  { code: "SA", name: "Saudi Arabia", confederation: "AFC", flagEmoji: "🇸🇦", colors: { from: "#006C35", via: "#FFFFFF", to: "#006C35", accent: "#FFFFFF" } },
  { code: "QA", name: "Qatar", confederation: "AFC", flagEmoji: "🇶🇦", colors: { from: "#8D1B3D", via: "#FFFFFF", to: "#8D1B3D", accent: "#FFFFFF" } },
  { code: "JO", name: "Jordan", confederation: "AFC", flagEmoji: "🇯🇴", colors: { from: "#007A3D", via: "#FFFFFF", to: "#CE1126", accent: "#000000" } },
  { code: "UZ", name: "Uzbekistan", confederation: "AFC", flagEmoji: "🇺🇿", colors: { from: "#1EB53A", via: "#FFFFFF", to: "#CE1126", accent: "#1EB53A" } },
  { code: "IQ", name: "Iraq", confederation: "AFC", flagEmoji: "🇮🇶", colors: { from: "#CE1126", via: "#FFFFFF", to: "#007A3D", accent: "#000000" } },

  { code: "DZ", name: "Algeria", confederation: "CAF", flagEmoji: "🇩🇿", colors: { from: "#006233", via: "#FFFFFF", to: "#006233", accent: "#D21034" } },
  { code: "MA", name: "Morocco", confederation: "CAF", flagEmoji: "🇲🇦", colors: { from: "#C1272D", via: "#006233", to: "#C1272D", accent: "#006233" } },
  { code: "EG", name: "Egypt", confederation: "CAF", flagEmoji: "🇪🇬", colors: { from: "#CE1126", via: "#FFFFFF", to: "#000000", accent: "#CE1126" } },
  { code: "TN", name: "Tunisia", confederation: "CAF", flagEmoji: "🇹🇳", colors: { from: "#E70013", via: "#FFFFFF", to: "#E70013", accent: "#FFFFFF" } },
  { code: "SN", name: "Senegal", confederation: "CAF", flagEmoji: "🇸🇳", colors: { from: "#00853F", via: "#FDEF42", to: "#E31B23", accent: "#00853F" } },
  { code: "ZA", name: "South Africa", confederation: "CAF", flagEmoji: "🇿🇦", colors: { from: "#007A4D", via: "#FFB81C", to: "#001489", accent: "#DE3831" } },
  { code: "GH", name: "Ghana", confederation: "CAF", flagEmoji: "🇬🇭", colors: { from: "#006B3F", via: "#FCD116", to: "#EF3340", accent: "#000000" } },
  { code: "CI", name: "Ivory Coast", confederation: "CAF", flagEmoji: "🇨🇮", colors: { from: "#F77F00", via: "#FFFFFF", to: "#009A44", accent: "#F77F00" } },
  { code: "CV", name: "Cape Verde", confederation: "CAF", flagEmoji: "🇨🇻", colors: { from: "#003893", via: "#CF2027", to: "#F7D116", accent: "#003893" } },
  { code: "CD", name: "DR Congo", confederation: "CAF", flagEmoji: "🇨🇩", colors: { from: "#007FFF", via: "#F7D618", to: "#CE1021", accent: "#007FFF" } },

  { code: "AR", name: "Argentina", confederation: "CONMEBOL", flagEmoji: "🇦🇷", colors: { from: "#74ACDF", via: "#FFFFFF", to: "#74ACDF", accent: "#F6B40E" } },
  { code: "BR", name: "Brazil", confederation: "CONMEBOL", flagEmoji: "🇧🇷", colors: { from: "#009C3B", via: "#FFDF00", to: "#002776", accent: "#FFDF00" } },
  { code: "CO", name: "Colombia", confederation: "CONMEBOL", flagEmoji: "🇨🇴", colors: { from: "#FCD116", via: "#003087", to: "#CE1126", accent: "#FCD116" } },
  { code: "EC", name: "Ecuador", confederation: "CONMEBOL", flagEmoji: "🇪🇨", colors: { from: "#FFD100", via: "#003087", to: "#EF3340", accent: "#FFD100" } },
  { code: "UY", name: "Uruguay", confederation: "CONMEBOL", flagEmoji: "🇺🇾", colors: { from: "#FFFFFF", via: "#75AADB", to: "#FFFFFF", accent: "#75AADB" } },
  { code: "PY", name: "Paraguay", confederation: "CONMEBOL", flagEmoji: "🇵🇾", colors: { from: "#D52B1E", via: "#FFFFFF", to: "#0038A8", accent: "#D52B1E" } },

  { code: "NZ", name: "New Zealand", confederation: "OFC", flagEmoji: "🇳🇿", colors: { from: "#00247D", via: "#FFFFFF", to: "#CC142B", accent: "#CC142B" } },

  { code: "GB-ENG", name: "England", confederation: "UEFA", flagEmoji: "🏴", colors: { from: "#FFFFFF", via: "#CF142B", to: "#FFFFFF", accent: "#CF142B" } },
  { code: "FR", name: "France", confederation: "UEFA", flagEmoji: "🇫🇷", colors: { from: "#002395", via: "#FFFFFF", to: "#ED2939", accent: "#002395" } },
  { code: "DE", name: "Germany", confederation: "UEFA", flagEmoji: "🇩🇪", colors: { from: "#000000", via: "#DD0000", to: "#FFCE00", accent: "#FFCE00" } },
  { code: "ES", name: "Spain", confederation: "UEFA", flagEmoji: "🇪🇸", colors: { from: "#AA151B", via: "#F1BF00", to: "#AA151B", accent: "#F1BF00" } },
  { code: "PT", name: "Portugal", confederation: "UEFA", flagEmoji: "🇵🇹", colors: { from: "#006600", via: "#FF0000", to: "#006600", accent: "#FF0000" } },
  { code: "NL", name: "Netherlands", confederation: "UEFA", flagEmoji: "🇳🇱", colors: { from: "#AE1C28", via: "#FFFFFF", to: "#21468B", accent: "#FF6600" } },
  { code: "BE", name: "Belgium", confederation: "UEFA", flagEmoji: "🇧🇪", colors: { from: "#000000", via: "#FAE042", to: "#EF3340", accent: "#FAE042" } },
  { code: "HR", name: "Croatia", confederation: "UEFA", flagEmoji: "🇭🇷", colors: { from: "#FF0000", via: "#FFFFFF", to: "#003DA5", accent: "#FF0000" } },
  { code: "NO", name: "Norway", confederation: "UEFA", flagEmoji: "🇳🇴", colors: { from: "#EF2B2D", via: "#FFFFFF", to: "#002868", accent: "#EF2B2D" } },
  { code: "GB-SCT", name: "Scotland", confederation: "UEFA", flagEmoji: "🏴", colors: { from: "#003078", via: "#FFFFFF", to: "#003078", accent: "#FFFFFF" } },
  { code: "AT", name: "Austria", confederation: "UEFA", flagEmoji: "🇦🇹", colors: { from: "#ED2939", via: "#FFFFFF", to: "#ED2939", accent: "#FFFFFF" } },
  { code: "CH", name: "Switzerland", confederation: "UEFA", flagEmoji: "🇨🇭", colors: { from: "#FF0000", via: "#FFFFFF", to: "#FF0000", accent: "#FFFFFF" } },
  { code: "BA", name: "Bosnia & Herzegovina", confederation: "UEFA", flagEmoji: "🇧🇦", colors: { from: "#002395", via: "#FFCD00", to: "#002395", accent: "#FFCD00" } },
  { code: "SE", name: "Sweden", confederation: "UEFA", flagEmoji: "🇸🇪", colors: { from: "#006AA7", via: "#FECC02", to: "#006AA7", accent: "#FECC02" } },
  { code: "TR", name: "Türkiye", confederation: "UEFA", flagEmoji: "🇹🇷", colors: { from: "#E30A17", via: "#FFFFFF", to: "#E30A17", accent: "#FFFFFF" } },
  { code: "CZ", name: "Czechia", confederation: "UEFA", flagEmoji: "🇨🇿", colors: { from: "#D7141A", via: "#FFFFFF", to: "#11457E", accent: "#D7141A" } },
] as const;

export type WC2026Team = (typeof WC2026_TEAMS)[number];
