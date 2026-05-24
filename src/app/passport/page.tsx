"use client";

import { useUserProfile } from "@/hooks/useUserProfile";
import { useBadges } from "@/hooks/useBadges";
import { PassportHeader } from "@/components/passport/PassportHeader";
import { BadgeGrid } from "@/components/passport/BadgeGrid";
import { WatchHistory } from "@/components/passport/WatchHistory";
import { ShareCard } from "@/components/passport/ShareCard";

export default function PassportPage() {
  const { data: profile } = useUserProfile();
  const { data: badges } = useBadges(profile?.id);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 px-4 py-6">
      <PassportHeader profile={profile} />
      <div className="grid gap-4 lg:grid-cols-2">
        <ShareCard profile={profile} badgesCount={badges?.length || 0} />
        <WatchHistory profileId={profile?.id} />
      </div>
      <section className="space-y-2">
        <h2 className="font-display text-2xl font-semibold">My Badges</h2>
        <BadgeGrid badges={badges} />
      </section>
    </div>
  );
}
