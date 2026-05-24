"use client";

import { useUserProfile } from "@/hooks/useUserProfile";
import { useBadges } from "@/hooks/useBadges";
import { DualStatsPassport } from "@/components/passport/DualStatsPassport";
import { BadgeGrid } from "@/components/passport/BadgeGrid";
import { WatchHistory } from "@/components/passport/WatchHistory";
import { ShareCard } from "@/components/passport/ShareCard";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function PassportPage() {
  const { isConnected } = useAccount();
  const { data: profile } = useUserProfile();
  const { data: badges } = useBadges(profile?.id);

  if (!isConnected) {
    return (
      <div className="mx-auto w-full max-w-md px-4 py-12 text-center space-y-4">
        <h1 className="font-display text-3xl font-bold">Fan Passport 🛂</h1>
        <div className="glass-panel p-6 space-y-4 bg-stadium/80">
          <p className="text-sm text-chalk/70">
            Connect your wallet to view your personalized Fan Passport, watch history, and badges.
          </p>
          <div className="flex justify-center">
            <ConnectButton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 px-4 py-6">
      <DualStatsPassport profile={profile} />
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
