import { COUNTRIES } from "@/lib/theme/countries";
import { CountryFlag } from "@/components/ui/CountryFlag";

export function CountryPreviewCards() {
  return (
    <div className="grid w-full max-w-xl grid-cols-2 gap-2 md:grid-cols-4">
      {COUNTRIES.slice(0, 8).map((country) => (
        <div
          key={country.code}
          className="glass-panel rounded-lg px-3 py-2 text-sm flex flex-col justify-between gap-1.5"
          style={{
            backgroundImage: `linear-gradient(120deg, ${country.gradientFrom}, ${country.gradientTo})`,
          }}
        >
          <CountryFlag code={country.code} className="w-7 h-4.5 object-cover rounded-sm shadow-sm select-none" />
          <div className="text-xs font-semibold text-black">{country.name}</div>
        </div>
      ))}
    </div>
  );
}
