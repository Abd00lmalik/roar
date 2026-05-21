"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { seededVideos } from "@/lib/mockData";
import { VideoPlayer } from "@/components/watch/VideoPlayer";
import { FreeTimeCountdown } from "@/components/watch/FreeTimeCountdown";
import { DepositModal } from "@/components/watch/DepositModal";
import { SessionPanel } from "@/components/watch/SessionPanel";
import { WatchReceipt } from "@/components/watch/WatchReceipt";
import { ReactionBar } from "@/components/watch/ReactionBar";
import { MatchTakes } from "@/components/watch/MatchTakes";
import { useWatchSession } from "@/hooks/useWatchSession";
import { useSessionStore } from "@/store/sessionStore";
import { useFreeTime } from "@/hooks/useFreeTime";

export default function WatchPage() {
  const params = useParams<{ videoId: string }>();
  const video = useMemo(
    () => seededVideos.find((item) => item.id === params.videoId) ?? seededVideos[0],
    [params.videoId],
  );

  const [depositOpen, setDepositOpen] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const { remaining } = useFreeTime();
  const session = useSessionStore();
  const watch = useWatchSession();

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-6 lg:grid-cols-[1fr_320px]">
      <section className="space-y-4">
        <div className="relative">
          <VideoPlayer
            url={video.video_url}
            onPlay={() => {
              watch.setPlaying(true);
              watch.startSession();
            }}
            onPause={() => {
              watch.setPlaying(false);
              watch.stopSession("pause");
            }}
            onEnded={() => {
              watch.stopSession("end");
              setReceiptOpen(true);
              setTxHash("0xabc...def");
            }}
            onBuffer={() => watch.setBuffering(true)}
            onBufferEnd={() => watch.setBuffering(false)}
          />
          <div className="absolute right-3 top-3">
            <FreeTimeCountdown remaining={remaining} />
          </div>
        </div>
        <ReactionBar />
        <MatchTakes />
      </section>
      <aside className="space-y-4">
        <SessionPanel
          totalSeconds={session.totalSeconds}
          billableSeconds={session.billableSeconds}
          cost={session.currentCost}
          isPaused={session.isPaused}
        />
      </aside>
      <DepositModal
        open={watch.freeTimeExhausted || depositOpen}
        onClose={() => setDepositOpen(false)}
        onDeposit={() => {
          setDepositOpen(false);
          watch.setPlaying(true);
        }}
      />
      {receiptOpen && (
        <WatchReceipt
          summary={session.latestSummary}
          txHash={txHash}
          onClose={() => {
            setReceiptOpen(false);
            watch.resetSession();
          }}
        />
      )}
    </div>
  );
}
