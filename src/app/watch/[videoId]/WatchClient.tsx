"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import ReactPlayer from "react-player";
import { useSession } from "next-auth/react";
import { useAccount } from "wagmi";
import { VideoPlayer } from "@/components/watch/VideoPlayer";
import { FreeTimeCountdown } from "@/components/watch/FreeTimeCountdown";
import { FundingModal } from "@/components/payments/FundingModal";
import { DepositModal } from "@/components/watch/DepositModal";
import { SessionPanel } from "@/components/watch/SessionPanel";
import { ReactionBar } from "@/components/watch/ReactionBar";
import { MatchTakes } from "@/components/watch/MatchTakes";
import { AuthGate } from "@/components/watch/AuthGate";
import { useSessionStore } from "@/store/sessionStore";
import { useVARLock } from "@/hooks/useVARLock";
import { FREE_SECONDS, COST_PER_SECOND_USDC } from "@/lib/payments/micropayments";

interface WatchClientProps {
  video: any;
}

export function WatchClient({ video }: WatchClientProps) {
  const { data: session } = useSession();
  const { address: connectedAddress, isConnected } = useAccount();
  const session_ = useSessionStore();

  const matchId = video.match_id ?? "default-match";
  const varLocked = useVARLock(matchId);

  const playerRef = useRef<ReactPlayer | null>(null);
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  // Stages: "free" | "auth-gate" | "fund-gate" | "billed"
  const [stage, setStage] = useState<"free" | "auth-gate" | "fund-gate" | "billed" >("free");
  const [freeSecondsLeft, setFreeSecondsLeft] = useState(FREE_SECONDS);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const billingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const varLockedRef = useRef(varLocked);

  // Keep varLocked ref in sync
  useEffect(() => {
    varLockedRef.current = varLocked;
  }, [varLocked]);

  const [walletId, setWalletId] = useState<string | null>(session?.user?.circleWalletId ?? null);
  const [walletAddress, setWalletAddress] = useState<string | null>(session?.user?.walletAddress ?? null);

  const isOwner = session?.user?.id && video.profiles?.id === session.user.id;
  const isPaid = video.is_paid !== false;

  // Sync session wallet details when loaded
  useEffect(() => {
    if (session?.user?.circleWalletId) setWalletId(session.user.circleWalletId);
    if (session?.user?.walletAddress) setWalletAddress(session.user.walletAddress);
  }, [session]);

  // Provision user wallet and passport
  const provisionUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/provision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          countryCode: localStorage.getItem("supporter_nation") || "US",
          walletAddress: connectedAddress || session?.user?.walletAddress || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.walletId) setWalletId(data.walletId);
        if (data.walletAddress) setWalletAddress(data.walletAddress);
        return data;
      }
    } catch (err) {
      console.error("[WatchClient] provision error:", err);
    }
    return null;
  }, [connectedAddress, session?.user?.walletAddress]);

  // Start billing loop
  const startBillingLoop = useCallback(() => {
    if (billingIntervalRef.current) return;

    billingIntervalRef.current = setInterval(async () => {
      if (!videoElement) return;

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
            walletAddress: connectedAddress || walletAddress || undefined,
          }),
        });

        const data = await res.json();

        if (data.locked) return;

        if (!data.success) {
          // Insufficient balance
          videoElement.pause();
          videoElement.style.pointerEvents = "none";
          setIsPlaying(false);
          setStage("fund-gate");
          if (billingIntervalRef.current) {
            clearInterval(billingIntervalRef.current);
            billingIntervalRef.current = null;
          }
        } else {
          // Increment session store statistics
          session_.setLive({
            isActive: true,
            isPaused: false,
            totalSeconds: session_.totalSeconds + 1,
            billableSeconds: session_.billableSeconds + 1,
            currentCost: (session_.billableSeconds + 1) * COST_PER_SECOND_USDC,
          });
        }
      } catch (err) {
        console.error("[WatchClient] billing tick failed:", err);
      }
    }, 1000);
  }, [videoElement, matchId, video.profiles, connectedAddress, walletAddress, session_]);

  const stopBillingLoop = useCallback(() => {
    if (billingIntervalRef.current) {
      clearInterval(billingIntervalRef.current);
      billingIntervalRef.current = null;
    }
  }, []);

  // Free timer loop
  useEffect(() => {
    if (!videoElement || isOwner || !isPaid || stage !== "free") return;

    const freeInterval = setInterval(() => {
      if (videoElement.paused || document.hidden || videoElement.readyState < 3) return;

      setFreeSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(freeInterval);
          
          // Check if authenticated
          const hasUser = session?.user?.id || isConnected || connectedAddress;
          if (hasUser) {
            provisionUser().then(() => {
              setStage("billed");
            });
          } else {
            videoElement.pause();
            setIsPlaying(false);
            setStage("auth-gate");
          }
          return 0;
        }

        // Increment stats
        session_.setLive({
          isActive: true,
          isPaused: false,
          totalSeconds: session_.totalSeconds + 1,
          billableSeconds: session_.billableSeconds,
          currentCost: session_.currentCost,
        });

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(freeInterval);
  }, [videoElement, isOwner, isPaid, stage, session?.user?.id, isConnected, connectedAddress, provisionUser, session_]);

  // Start billing if free time was already consumed
  useEffect(() => {
    if (freeSecondsLeft <= 0 && !isOwner && isPaid && videoElement && stage === "free") {
      const hasUser = session?.user?.id || isConnected || connectedAddress;
      if (hasUser) {
        provisionUser().then(() => {
          setStage("billed");
        });
      } else {
        videoElement.pause();
        setIsPlaying(false);
        setStage("auth-gate");
      }
    }
  }, [freeSecondsLeft, isOwner, isPaid, videoElement, stage, session?.user?.id, isConnected, connectedAddress, provisionUser]);

  // Billing trigger on stage transition
  useEffect(() => {
    if (stage === "billed" && !isOwner && isPaid && videoElement) {
      startBillingLoop();
    }
    return stopBillingLoop;
  }, [stage, isOwner, isPaid, videoElement, startBillingLoop, stopBillingLoop]);

  // Resume after funding
  const handleFundingSuccess = useCallback(() => {
    if (videoElement) {
      videoElement.style.pointerEvents = "";
      videoElement.play().catch(console.error);
    }
    setIsPlaying(true);
    setStage("billed");
  }, [videoElement]);

  // Auth gate complete callback
  const handleAuthenticated = useCallback(() => {
    provisionUser().then(() => {
      if (videoElement) {
        videoElement.style.pointerEvents = "";
        videoElement.play().catch(console.error);
      }
      setIsPlaying(true);
      setStage("billed");
    });
  }, [videoElement, provisionUser]);

  const onReady = () => {
    const internal = playerRef.current?.getInternalPlayer();
    if (internal instanceof HTMLVideoElement) {
      setVideoElement(internal);
    }
  };

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
              className="text-xs text-white/50 underline mt-1 cursor-pointer"
              onClick={() => setShowDepositModal(true)}
            >
              Deposit USDC
            </button>
          </div>
        )}
      </aside>

      {/* Auth Gate Modal */}
      {stage === "auth-gate" && (
        <AuthGate onAuthenticated={handleAuthenticated} />
      )}

      {/* Non-dismissable funding gate */}
      {stage === "fund-gate" && (
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
