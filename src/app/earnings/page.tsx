"use client";

import { useUserProfile } from "@/hooks/useUserProfile";
import { EarningsOverview } from "@/components/earnings/EarningsOverview";
import { WithdrawButton } from "@/components/earnings/WithdrawButton";
import { TopEarningVideos } from "@/components/earnings/TopEarningVideos";
import { EmptyState } from "@/components/ui/EmptyState";

export default function EarningsPage() {
  const { data: profile, isLoading } = useUserProfile();

  const totalEarned = profile ? Number(profile.total_earned || 0) : 0;

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4 px-4 py-6">
      <h1 className="font-display text-4xl font-bold">💰 Goal Earnings</h1>

      {isLoading ? (
        <p className="text-sm text-chalk/50">Loading earnings...</p>
      ) : totalEarned === 0 ? (
        <div className="space-y-4">
          <EarningsOverview profile={profile} />
          <EmptyState
            icon="💳"
            heading="No earnings yet"
            body="Your match wallet fills up as fans watch your content."
          />
        </div>
      ) : (
        <>
          <EarningsOverview profile={profile} />
          <WithdrawButton />
          <TopEarningVideos profileId={profile?.id} />
        </>
      )}
    </div>
  );
}
