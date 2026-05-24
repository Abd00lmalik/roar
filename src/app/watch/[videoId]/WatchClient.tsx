"use client";

import { useState, useRef } from "react";
import ReactPlayer from "react-player";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { getAddress } from "viem";
import { VideoPlayer } from "@/components/watch/VideoPlayer";
import { FreeTimeCountdown } from "@/components/watch/FreeTimeCountdown";
import { DepositModal } from "@/components/watch/DepositModal";
import { UnsignedVoucherModal } from "@/components/watch/UnsignedVoucherModal";
import { SessionPanel } from "@/components/watch/SessionPanel";
import { WatchReceipt } from "@/components/watch/WatchReceipt";
import { ReactionBar } from "@/components/watch/ReactionBar";
import { MatchTakes } from "@/components/watch/MatchTakes";
import { useWatchSession } from "@/hooks/useWatchSession";
import { useSessionStore } from "@/store/sessionStore";
import { useFreeTime } from "@/hooks/useFreeTime";
import { PROTOCOL } from "@/lib/constants/protocol";
import { erc20Abi } from "@/lib/contracts/abis";

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
  const [isApproving, setIsApproving] = useState(false);

  const playerRef = useRef<ReactPlayer | null>(null);
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);

  const creatorAddress = (video.profiles?.wallet_address || "0x0000000000000000000000000000000000000000") as `0x${string}`;

  // ── On-chain USDC allowance check ──────────────────────────────────────────
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: PROTOCOL.USDC_ADDRESS,
    abi:     erc20Abi,
    functionName: "allowance",
    args:    userAddress ? [userAddress, PROTOCOL.VAULT_ADDRESS] : undefined,
    query:   { enabled: !!userAddress },
  });

  const isOwner = userAddress && creatorAddress && getAddress(userAddress) === getAddress(creatorAddress);
  const hasAllowance = allowance !== undefined && allowance > BigInt(0);
  const isBilled = playedSeconds >= PROTOCOL.FREE_PREVIEW_SECONDS;

  // Billing is active only if not owner, free tier expired, and allowance approved
  const billingEnabled = !isOwner && isBilled && hasAllowance;

  const { unsignedVoucher, resignLoading, handleResign, dismissUnsigned } = useWatchSession({
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

    if (secs >= PROTOCOL.FREE_PREVIEW_SECONDS && !isOwner) {
      const approved = allowance !== undefined && allowance > BigInt(0);
      if (!approved) {
        setIsPlaying(false);
        setDepositOpen(true);
      }
    }
  };

  const { writeContractAsync } = useWriteContract();

  const handleApprove = async () => {
    try {
      setIsApproving(true);
      // Approve 100 USDC (6 decimals)
      await writeContractAsync({
        abi: erc20Abi,
        address: PROTOCOL.USDC_ADDRESS,
        functionName: "approve",
        args: [PROTOCOL.VAULT_ADDRESS, BigInt(100_000_000)],
      });
      // Wait for tx propagation then refetch
      await new Promise((resolve) => setTimeout(resolve, 3000));
      await refetchAllowance();
      setDepositOpen(false);
      setIsPlaying(true);
    } catch (err) {
      console.error("USDC approval failed:", err);
    } finally {
      setIsApproving(false);
    }
  };

  const remainingPreview = Math.max(0, PROTOCOL.FREE_PREVIEW_SECONDS - playedSeconds);

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
              <span className="rounded bg-amber-500/80 px-2 py-1 text-xs text-black font-semibold">
                Preview: {remainingPreview}s
              </span>
            )}
          </div>
        </div>
        {isOwner && (
          <div className="bg-amber-500/20 text-amber-300 p-2 text-xs rounded text-center font-mono">
            You created this video — watching your own content is free.
          </div>
        )}
        <ReactionBar />
        <MatchTakes videoId={video.id} authorId={video.owner_profile_id} />
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
        isApproving={isApproving}
        onClose={() => {
          setDepositOpen(false);
          setIsPlaying(false);
        }}
        onApprove={handleApprove}
      />
      {unsignedVoucher && (
        <UnsignedVoucherModal
          totalOwed={(Number(unsignedVoucher.rawTotalOwed) / 1_000_000).toFixed(4)}
          onSign={handleResign}
          onDismiss={dismissUnsigned}
          loading={resignLoading}
        />
      )}
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
