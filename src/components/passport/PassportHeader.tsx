import { CountryGradientWrapper } from "@/components/shared/CountryGradientWrapper";

interface PassportHeaderProps {
  profile: any;
}

export function PassportHeader({ profile }: PassportHeaderProps) {
  if (!profile) {
    return (
      <div className="rounded-xl p-4 bg-white/5 border border-white/10 text-chalk text-sm">
        Connect your wallet to see your Fan Passport 🛂
      </div>
    );
  }

  const dateStr = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString(undefined, { month: "long", year: "numeric" })
    : "May 2026";

  return (
    <CountryGradientWrapper>
      <div className="rounded-xl p-4 text-black">
        <p className="text-sm font-semibold">{profile.display_name} (@{profile.handle})</p>
        <p className="text-xs">{profile.country_name} · Fan since {dateStr}</p>
      </div>
    </CountryGradientWrapper>
  );
}
