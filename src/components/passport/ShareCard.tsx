import { COUNTRY_MAP } from "@/lib/theme/countries";

interface ShareCardProps {
  profile?: any;
  badgesCount?: number;
}

export function ShareCard({ profile, badgesCount = 0 }: ShareCardProps) {
  const country = profile?.country_code ? COUNTRY_MAP.get(profile.country_code) : null;
  const countryText = country ? `${country.name} ${country.flag}` : "Germany 🇩🇪";

  return (
    <div className="glass-panel p-4">
      <h3 className="mb-2 font-semibold">Share Passport to X 🐦</h3>
      <p className="text-sm text-chalk/80">
        I&apos;m backing {countryText} on RoarTube. I&apos;ve watched {profile?.cumulative_free_seconds_used || 0} seconds, claimed {badgesCount} badges, and supported
        football creators on X Layer.
      </p>
    </div>
  );
}

