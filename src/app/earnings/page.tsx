"use client";

import { useUserProfile } from "@/hooks/useUserProfile";
import { EarningsOverview } from "@/components/earnings/EarningsOverview";
import { WithdrawButton } from "@/components/earnings/WithdrawButton";
import { TopEarningVideos } from "@/components/earnings/TopEarningVideos";
import Link from "next/link";

export default function EarningsPage() {
  const { data: profile, isLoading } = useUserProfile();

  const totalEarned = profile ? Number(profile.total_earned || 0) : 0;

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4 px-4 py-6">
      <h1 className="font-display text-4xl font-bold">Goal Earnings 💳</h1>

      {isLoading ? (
        <p className="text-sm text-chalk/50">Loading earnings...</p>
      ) : totalEarned === 0 ? (
        <div className="space-y-4">
          <div className="glass-panel p-6 space-y-4 max-w-md bg-stadium/80">
            <div className="flex items-center justify-between bg-black/20 p-3 rounded">
              <span className="text-sm text-chalk/70">
                Claimable: <span className="font-mono text-green-400 font-bold">0.00 USDC</span>
              </span>
              <button
                disabled
                className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/40 cursor-not-allowed font-medium"
              >
                Claim
              </button>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-chalk/80 font-medium">No videos on the pitch yet.</p>
              <Link
                href="/upload"
                className="inline-block text-xs font-semibold text-floodlight hover:underline bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-full transition-colors"
              >
                Enter the Pitch ⚽ to start earning
              </Link>
            </div>
          </div>
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
