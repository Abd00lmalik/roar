export type CountryConfig = {
  code: string;
  name: string;
  flag: string;
  gradientFrom: string;
  gradientTo: string;
  accent: string;
};

export const COUNTRIES: CountryConfig[] = [
  { code: "NG", name: "Nigeria", flag: "🇳🇬", gradientFrom: "#008751", gradientTo: "#FFFFFF", accent: "#00C853" },
  { code: "BR", name: "Brazil", flag: "🇧🇷", gradientFrom: "#009C3B", gradientTo: "#FFDF00", accent: "#002776" },
  { code: "AR", name: "Argentina", flag: "🇦🇷", gradientFrom: "#74ACDF", gradientTo: "#FFFFFF", accent: "#F6B40E" },
  { code: "FR", name: "France", flag: "🇫🇷", gradientFrom: "#002395", gradientTo: "#ED2939", accent: "#FFFFFF" },
  { code: "MA", name: "Morocco", flag: "🇲🇦", gradientFrom: "#C1272D", gradientTo: "#006233", accent: "#FFD700" },
  { code: "GH", name: "Ghana", flag: "🇬🇭", gradientFrom: "#006B3F", gradientTo: "#CE1126", accent: "#FCD116" },
  { code: "EN", name: "England", flag: "🏴", gradientFrom: "#CF091D", gradientTo: "#012169", accent: "#FFFFFF" },
  { code: "PT", name: "Portugal", flag: "🇵🇹", gradientFrom: "#006600", gradientTo: "#FF0000", accent: "#FFD700" },
  { code: "ES", name: "Spain", flag: "🇪🇸", gradientFrom: "#AA151B", gradientTo: "#F1BF00", accent: "#FFFFFF" },
  { code: "DE", name: "Germany", flag: "🇩🇪", gradientFrom: "#000000", gradientTo: "#DD0000", accent: "#FFCE00" },
  { code: "US", name: "USA", flag: "🇺🇸", gradientFrom: "#002868", gradientTo: "#BF0A30", accent: "#FFFFFF" },
  { code: "MX", name: "Mexico", flag: "🇲🇽", gradientFrom: "#006847", gradientTo: "#CE1126", accent: "#FFFFFF" },
  { code: "JP", name: "Japan", flag: "🇯🇵", gradientFrom: "#FFFFFF", gradientTo: "#BC002D", accent: "#BC002D" },
  { code: "KR", name: "South Korea", flag: "🇰🇷", gradientFrom: "#FFFFFF", gradientTo: "#CD2E3A", accent: "#003478" },
  { code: "SN", name: "Senegal", flag: "🇸🇳", gradientFrom: "#00853F", gradientTo: "#E31B23", accent: "#FDEF42" },
  { code: "CM", name: "Cameroon", flag: "🇨🇲", gradientFrom: "#007A5E", gradientTo: "#CE1126", accent: "#FCD116" },
];

export const COUNTRY_MAP = new Map(COUNTRIES.map((country) => [country.code, country]));
