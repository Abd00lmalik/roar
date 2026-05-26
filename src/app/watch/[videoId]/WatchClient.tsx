"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import ReactPlayer from "react-player";
import { useSession } from "next-auth/react";
import { VideoPlayer } from "@/components/watch/VideoPlayer";
import { FreeTimeCountdown } from "@/components/watch/FreeTimeCountdown";
import { FundingModal } from "@/components/payments/FundingModal";
import { DepositModal } from "@/components/watch/DepositModal";
import { SessionPanel } from "@/components/watch/SessionPanel";
import { ReactionBar } from "@/components/watch/ReactionBar";
import { MatchTakes } from "@/components/watch/MatchTakes";
import { useSessionStore } from "@/store/sessionStore";
import { useVARLock } from "@/hooks/useVARLock";
import { FREE_SECONDS } from "@/lib/payments/micropayments";

interface WatchClientProps {
  video: any;
}

/**
 * WatchClient — Circle × X Layer billing engine.
 *
 * Free window: 120 seconds per user (FREE_SECONDS from micropayments.ts).
 * Paid window: 0.001 USDC/sec via /api/stream/charge (Circle micropayments).
 *
 * Billing loop freeze conditions (ALL must be false to charge):
 *   1. video.paused
 *   2. document.hidden (tab not visible)
 *   3. video.readyState < 3 (buffering)
 *   4. varLocked (VAR review on-chain event)
 *
 * On insufficient balance: FundingModal (non-dismissable) blocks video.
 * VAR lock: billing silently skips, video continues playing.
 */
export function WatchClient({ video }: WatchClientProps) {
  const { data: session } = useSession();
  const session_ = useSessionStore();

  // VAR lock — watches BillingController events on X Layer
  const matchId = video.match_id ?? "default-match";
  const varLocked = useVARLock(matchId);

  // Video state
  const playerRef = useRef<ReactPlayer | null>(null);
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  // Billing state
  const [freeSecondsLeft, setFreeSecondsLeft] = useState(FREE_SECONDS);
  const [showFundingModal, setShowFundingModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const billingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const varLockedRef = useRef(varLocked);

  // Keep varLocked ref in sync (used inside interval closure)
  useEffect(() => {
    varLockedRef.current = varLocked;
  }, [varLocked]);

  const walletId = session?.user?.circleWalletId ?? null;
  const walletAddress = session?.user?.walletAddress ?? null;
  const isOwner =
    session?.user?.id && video.profiles?.id === session.user.id;
  const isPaid = video.is_paid !== false;

  // ── Billing loop ───────────────────────────────────────────────────────────
  const startBillingLoop = useCallback(() => {
    if (billingIntervalRef.current) return; // already running

    billingIntervalRef.current = setInterval(async () => {
      if (!videoElement) return;

      // Freeze conditions
      const shouldFreeze =
        videoElement.paused ||
        document.hidden ||
        videoElement.readyState < 3 ||
        varLockedRef.current;

      if (shouldFreeze) return;

      try {
        const res = await fetch("/api/stream/charge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            matchId,
            creatorWalletId: video.profiles?.circle_wallet_id ?? null,
            seconds: 1,
          }),
        });

        const data = (await res.json()) as {
          success?: boolean;
          locked?: boolean;
          remainingBalance?: number | null;
        };

        if (data.locked) {
          // VAR lock from server — skip silently (event will update varLocked)
          return;
        }

        if (!data.success) {
          // Insufficient balance — pause and show funding modal
          videoElement.pause();
          videoElement.src = "";
          videoElement.style.pointerEvents = "none";
          setIsPlaying(false);
          setShowFundingModal(true);

          if (billingIntervalRef.current) {
            clearInterval(billingIntervalRef.current);
            billingIntervalRef.current = null;
          }
        }
      } catch (err) {
        // Network failure — skip tick, billing resumes next interval
        console.error("[WatchClient] billing tick failed:", err);
      }
    }, 1_000);
  }, [videoElement, matchId, video.profiles]);

  const stopBillingLoop = useCallback(() => {
    if (billingIntervalRef.current) {
      clearInterval(billingIntervalRef.current);
      billingIntervalRef.current = null;
    }
  }, []);

  // ── Free window countdown ───────────────────────────────────────────────────
  useEffect(() => {
    if (!videoElement || isOwner || !isPaid) return;

    const freeInterval = setInterval(() => {
      if (videoElement.paused || document.hidden || videoElement.readyState < 3) return;

      setFreeSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(freeInterval);
          // Free time expired — start billing loop
          if (!isOwner && isPaid && session?.user?.id) {
            startBillingLoop();
          } else if (!session?.user?.id) {
            // Not signed in — show funding modal
            videoElement.pause();
            setIsPlaying(false);
            setShowFundingModal(true);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1_000);

    return () => clearInterval(freeInterval);
  }, [videoElement, isOwner, isPaid, session?.user?.id, startBillingLoop]);

  // Start billing immediately if free time was already consumed (e.g. page reload)
  useEffect(() => {
    if (freeSecondsLeft <= 0 && !isOwner && isPaid && videoElement && session?.user?.id) {
      startBillingLoop();
    }
    return stopBillingLoop;
  }, [freeSecondsLeft, isOwner, isPaid, videoElement, session?.user?.id, startBillingLoop, stopBillingLoop]);

  // ── Resume stream after funding ─────────────────────────────────────────────
  const handleFundingSuccess = useCallback(() => {
    setShowFundingModal(false);

    if (videoElement) {
      videoElement.style.pointerEvents = "";
      // Re-create video src to restart stream
      const src = video.video_url;
      videoElement.src = src;
      videoElement.play().catch(console.error);
    }
    setIsPlaying(true);
    startBillingLoop();
  }, [videoElement, video.video_url, startBillingLoop]);

  const onReady = () => {
    const internal = playerRef.current?.getInternalPlayer();
    if (internal instanceof HTMLVideoElement) {
      setVideoElement(internal);
    }
  };

  // onProgress is kept for future use (e.g. session panel display)
  const onProgress = (_state: { playedSeconds: number }) => {};


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
            onEnded={() => stopBillingLoop()}
            onBuffer={() => {}}
            onBufferEnd={() => {}}
            onProgress={onProgress}
          />

          {/* HUD overlays */}
          <div className="absolute right-3 top-3 flex flex-col gap-2">
            {freeSecondsLeft > 0 && !isOwner && (
              <FreeTimeCountdown remaining={freeSecondsLeft} />
            )}
            {varLocked && (
              <div
                className="rounded-lg px-3 py-1.5 text-xs font-bold text-white"
                style={{
                  background: "rgba(234,69,96,0.9)",
                  border: "1px solid rgba(234,69,96,0.4)",
                  boxShadow: "0 0 12px rgba(234,69,96,0.5)",
                }}
              >
                🔍 VAR Review — Billing Paused
              </div>
            )}
          </div>
        </div>

        {isOwner && (
          <div className="bg-amber-500/20 text-amber-300 p-2 text-xs rounded text-center font-mono">
            You created this video — watching your own content is free.
          </div>
        )}

        <ReactionBar />
        <MatchTakes videoId={video.id} />
      </section>

      <aside className="space-y-4">
        <SessionPanel
          totalSeconds={session_.totalSeconds}
          billableSeconds={session_.billableSeconds}
          cost={session_.currentCost}
          isPaused={session_.isPaused}
        />

        {/* USDC balance info for signed-in users */}
        {walletId && (
          <div
            className="rounded-xl p-4 text-sm space-y-1"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <p className="text-white/40 text-xs uppercase tracking-wider font-medium">Circle Wallet</p>
            {walletAddress && (
              <p className="font-mono text-white/60 text-xs truncate">
                {walletAddress.slice(0, 8)}…{walletAddress.slice(-6)}
              </p>
            )}
            <button
              className="text-xs text-white/50 underline mt-1"
              onClick={() => setShowDepositModal(true)}
            >
              Deposit USDC
            </button>
          </div>
        )}
      </aside>

      {/* Non-dismissable funding gate */}
      {showFundingModal && (
        <FundingModal
          walletId={walletId}
          walletAddress={walletAddress}
          onFundingSuccess={handleFundingSuccess}
        />
      )}

      {/* Optional on-chain USDC deposit modal */}
      <DepositModal
        open={showDepositModal}
        isApproving={false}
        onClose={() => setShowDepositModal(false)}
        onApprove={() => setShowDepositModal(false)}
      />
    </div>
  );
}
