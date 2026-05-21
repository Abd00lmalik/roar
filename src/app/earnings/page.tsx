import { EarningsOverview } from "@/components/earnings/EarningsOverview";
import { WithdrawButton } from "@/components/earnings/WithdrawButton";
import { TopEarningVideos } from "@/components/earnings/TopEarningVideos";

export default function EarningsPage() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-4 px-4 py-6">
      <h1 className="font-display text-4xl font-bold">💰 Goal Earnings</h1>
      <EarningsOverview />
      <WithdrawButton />
      <TopEarningVideos />
    </div>
  );
}
