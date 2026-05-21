import { COUNTRIES } from "@/lib/theme/countries";

export function CountryPreviewCards() {
  return (
    <div className="grid w-full max-w-xl grid-cols-2 gap-2 md:grid-cols-4">
      {COUNTRIES.slice(0, 8).map((country) => (
        <div
          key={country.code}
          className="glass-panel rounded-lg px-3 py-2 text-sm"
          style={{
            backgroundImage: `linear-gradient(120deg, ${country.gradientFrom}, ${country.gradientTo})`,
          }}
        >
          <div className="font-semibold text-black">{country.flag}</div>
          <div className="text-xs font-medium text-black/70">{country.name}</div>
        </div>
      ))}
    </div>
  );
}
