import { PassportHeader } from "@/components/passport/PassportHeader";
import { BadgeGrid } from "@/components/passport/BadgeGrid";
import { WatchHistory } from "@/components/passport/WatchHistory";
import { ShareCard } from "@/components/passport/ShareCard";

export default function PassportPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 px-4 py-6">
      <PassportHeader />
      <div className="grid gap-4 lg:grid-cols-2">
        <ShareCard />
        <WatchHistory />
      </div>
      <section className="space-y-2">
        <h2 className="font-display text-2xl font-semibold">My Badges</h2>
        <BadgeGrid />
      </section>
    </div>
  );
}
