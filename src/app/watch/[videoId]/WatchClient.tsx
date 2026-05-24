"use client";

import { useState, useRef } from "react";
import ReactPlayer from "react-player";
import { useAccount } from "wagmi";
import { getAddress } from "viem";
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
import { BILLING } from "@/lib/constants/protocol";

interface WatchClientProps {
  video: any;
}

export function WatchClient({ video }: WatchClientProps) {
  const { address: userAddress } = useAccount();
  const { remaining } = useFreeTime();
  const session = useSessionStore();

  const [depositOpen, setDepositOpen] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [txHash] = useState<string | null>(null);
  const [playedSeconds, setPlayedSeconds] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const playerRef = useRef<ReactPlayer | null>(null);
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);

  const creatorAddress = (video.profiles?.wallet_address || "0x0000000000000000000000000000000000000000") as `0x${string}`;
  const isOwner = userAddress && creatorAddress && getAddress(userAddress) === getAddress(creatorAddress);
  const isBilled = playedSeconds >= BILLING.FREE_PREVIEW_SECS;
  const billingEnabled = !isOwner && isBilled && !!userAddress;

  useWatchSession({
    creatorAddress,
    videoId: video.id,
    videoElement,
    enabled: !!billingEnabled,
  });

  const onReady = () => {
    const internalPlayer = playerRef.current?.getInternalPlayer();
    if (internalPlayer instanceof HTMLVideoElement) {
      setVideoElement(internalPlayer);
    }
  };

  const onProgress = (state: { playedSeconds: number }) => {
    const secs = Math.floor(state.playedSeconds);
    setPlayedSeconds(secs);

    if (secs >= BILLING.FREE_PREVIEW_SECS && !isOwner && !userAddress) {
      setIsPlaying(false);
      setDepositOpen(true);
    }
  };

  const remainingPreview = Math.max(0, BILLING.FREE_PREVIEW_SECS - playedSeconds);

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-6 lg:grid-cols-[1fr_320px]">
      <section className="space-y-4">
        <div className="relative">
          <VideoPlayer
            url={video.video_url}
            playerRef={playerRef}
            playing={isPlaying}
            onReady={onReady}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setReceiptOpen(true)}
            onBuffer={() => {}}
            onBufferEnd={() => {}}
            onProgress={onProgress}
          />
          <div className="absolute right-3 top-3 flex flex-col gap-2">
            <FreeTimeCountdown remaining={remaining} />
            {remainingPreview > 0 && (
              <span className="rounded bg-amber-500/80 px-2 py-1 text-xs font-semibold text-black">
                Preview: {remainingPreview}s
              </span>
            )}
          </div>
        </div>
        {isOwner && (
          <div className="rounded bg-amber-500/20 p-2 text-center font-mono text-xs text-amber-300">
            You created this video - watching your own content is free.
          </div>
        )}
        <ReactionBar />
        <MatchTakes videoId={video.id} />
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
        open={depositOpen}
        isApproving={false}
        onClose={() => {
          setDepositOpen(false);
          setIsPlaying(false);
        }}
        onApprove={() => {
          setDepositOpen(false);
          setIsPlaying(true);
        }}
      />
      {receiptOpen && (
        <WatchReceipt
          summary={session.latestSummary}
          txHash={txHash}
          onClose={() => setReceiptOpen(false)}
        />
      )}
    </div>
  );
}
