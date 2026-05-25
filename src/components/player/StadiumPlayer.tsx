"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useWalletBalance } from "@/lib/payments/useWalletBalance";
import { STREAM_RATE_USDC_PER_SEC } from "@/lib/payments/constants";

type StadiumPlayerProps = {
  videoUrl: string;
  creatorWalletAddress: string;
};

export function StadiumPlayer({ videoUrl, creatorWalletAddress }: StadiumPlayerProps) {
  const { status } = useSession();
  const pathname = usePathname();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const freezeTimeRef = useRef(0);
  const wasPlayingRef = useRef(false);
  const navPathRef = useRef(pathname);
  const syncTickRef = useRef(0);

  const [freeSecondsRemaining, setFreeSecondsRemaining] = useState(120);
  const [gateLocked, setGateLocked] = useState(false);
  const [fundingAmount, setFundingAmount] = useState("5");
  const [isFunding, setIsFunding] = useState(false);
  const [isFunded, setIsFunded] = useState(false);
  const [videoSrc, setVideoSrc] = useState(videoUrl);
  const [chargeError, setChargeError] = useState<string | null>(null);

  const { data: balance, refetch: refetchBalance } = useWalletBalance("me", gateLocked);

  const canRunTimer = useMemo(() => {
    const video = videoRef.current;
    if (!video) return false;
    if (video.paused) return false;
    if (video.seeking) return false;
    if (video.readyState < HTMLMediaElement.HAVE_FUTURE_DATA) return false;
    if (document.hidden) return false;
    return true;
  }, [videoSrc, gateLocked, isFunded, freeSecondsRemaining]);

  const freezeTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    const video = videoRef.current;
    if (video) {
      wasPlayingRef.current = !video.paused;
    }
  };

  const persistFreeTime = async (nextValue: number) => {
    await fetch("/api/passport/free-time", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ freeSecondsRemaining: nextValue }),
    });
  };

  const hardLock = () => {
    const video = videoRef.current;
    if (video) {
      freezeTimeRef.current = video.currentTime;
      video.pause();
    }
    setVideoSrc("");
    setGateLocked(true);
    freezeTimer();
  };

  const runCharge = async () => {
    const response = await fetch("/api/payments/charge-second", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ creatorWalletAddress }),
    });

    if (!response.ok) {
      throw new Error("Micropayment failed");
    }
  };

  const resumeTimer = () => {
    if (timerRef.current || gateLocked) return;

    timerRef.current = setInterval(() => {
      if (!canRunTimer) return;

      if (freeSecondsRemaining > 0) {
        const next = Math.max(0, freeSecondsRemaining - 1);
        setFreeSecondsRemaining(next);
        syncTickRef.current += 1;

        if (syncTickRef.current >= 10) {
          syncTickRef.current = 0;
          void persistFreeTime(next);
        }

        if (next === 0) {
          hardLock();
        }
        return;
      }

      if (!isFunded) {
        hardLock();
        return;
      }

      void runCharge().catch(() => {
        setChargeError("Live charge failed. Please retry funding.");
        setIsFunded(false);
        hardLock();
      });
    }, 1000);
  };

  useEffect(() => {
    if (status !== "authenticated") return;
    void fetch("/api/passport/free-time", { method: "GET" })
      .then((res) => res.json())
      .then((payload: { freeSecondsRemaining: number }) => {
        setFreeSecondsRemaining(payload.freeSecondsRemaining ?? 120);
      })
      .catch(() => {
        setFreeSecondsRemaining(120);
      });
  }, [status]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) {
        freezeTimer();
      } else {
        resumeTimer();
      }
    };

    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  });

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPause = () => freezeTimer();
    const onPlay = () => resumeTimer();
    const onWaiting = () => freezeTimer();
    const onPlaying = () => resumeTimer();

    video.addEventListener("pause", onPause);
    video.addEventListener("play", onPlay);
    video.addEventListener("waiting", onWaiting);
    video.addEventListener("playing", onPlaying);

    return () => {
      video.removeEventListener("pause", onPause);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("playing", onPlaying);
      freezeTimer();
    };
  }, [videoSrc, gateLocked]);

  useEffect(() => {
    if (navPathRef.current !== pathname) {
      freezeTimer();
      navPathRef.current = pathname;
    }
  }, [pathname]);

  const fundAndResume = async () => {
    setIsFunding(true);
    setChargeError(null);

    const amount = Number(fundingAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setIsFunding(false);
      setChargeError("Enter a valid USDC amount");
      return;
    }

    const response = await fetch("/api/wallet/fund", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amountUSDC: amount }),
    });

    if (!response.ok) {
      setIsFunding(false);
      setChargeError("Funding failed");
      return;
    }

    await refetchBalance();
    setIsFunded(true);
    setGateLocked(false);
    setVideoSrc(videoUrl);

    requestAnimationFrame(() => {
      const video = videoRef.current;
      if (!video) return;
      video.currentTime = freezeTimeRef.current;
      void video.play();
      resumeTimer();
    });

    setIsFunding(false);
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="rounded-2xl border border-white/10 bg-black/40 p-4 backdrop-blur-xl">
        <div className="mb-3 flex items-center justify-between text-sm text-white/70">
          <span>Free time remaining: {freeSecondsRemaining}s</span>
          <span>Rate: {STREAM_RATE_USDC_PER_SEC.toFixed(3)} USDC/sec</span>
        </div>

        <div className="relative">
          <video
            ref={videoRef}
            src={videoSrc}
            controls
            autoPlay
            className="aspect-video w-full rounded-xl bg-black"
            style={{ pointerEvents: gateLocked ? "none" : "auto" }}
          />

          {gateLocked ? (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
              <div className="w-full max-w-md rounded-2xl border border-[color:var(--country-accent)]/40 bg-gradient-to-r from-[var(--country-from)] via-[var(--country-via)] to-[var(--country-to)] p-6 text-center shadow-[0_0_30px_var(--country-accent)]">
                <h2 className="text-2xl font-bold text-white">Your Free Pass Has Expired.</h2>
                <p className="mt-2 text-sm text-white/80">Fund Your App Wallet to Continue.</p>

                <div className="mt-5 rounded-xl border border-white/20 bg-black/35 p-4 text-left">
                  <label className="block text-xs uppercase tracking-wide text-white/60">Deposit (USDC)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={fundingAmount}
                    onChange={(event) => setFundingAmount(event.target.value)}
                    className="mt-2 w-full rounded-lg border border-white/20 bg-black/50 px-3 py-2 text-white outline-none"
                  />
                  <p className="mt-2 text-xs text-white/60">Current balance: {Number(balance ?? 0).toFixed(4)} USDC</p>
                </div>

                {chargeError ? <p className="mt-3 text-xs text-rose-300">{chargeError}</p> : null}

                <button
                  onClick={() => {
                    void fundAndResume();
                  }}
                  disabled={isFunding}
                  className="mt-5 w-full rounded-xl bg-[var(--country-accent)] px-4 py-3 font-bold text-black disabled:opacity-50"
                >
                  {isFunding ? "Funding..." : "Fund Wallet →"}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
