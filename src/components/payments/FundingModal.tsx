"use client";

import { useState } from "react";
import { useWalletBalance } from "@/hooks/useWalletBalance";

interface FundingModalProps {
  /** Called when funding is confirmed and balance is verified — parent resumes playback */
  onFundingSuccess: () => void;
  /** Circle walletId of the current user */
  walletId: string | null;
  /** Wallet address (for display) */
  walletAddress: string | null;
}

/**
 * Full-bleed blocking overlay shown when the 120-second free pass expires.
 * Non-dismissable — the user must fund their wallet to continue watching.
 *
 * Uses the current country theme (--country-from, --country-to) for the
 * glassmorphic card gradient.
 */
export function FundingModal({ onFundingSuccess, walletId, walletAddress }: FundingModalProps) {
  const { balance, loading: balanceLoading, refetch } = useWalletBalance(walletId);
  const [amount, setAmount] = useState("5");
  const [funding, setFunding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"input" | "pending" | "success">("input");

  const handleFund = async () => {
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError("Please enter a valid USDC amount.");
      return;
    }

    setFunding(true);
    setError(null);
    setStep("pending");

    try {
      const res = await fetch("/api/wallet/fund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountUSDC: amountNum }),
      });

      if (!res.ok) {
        const { error: errMsg } = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(errMsg ?? "Funding request failed");
      }

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error ?? "Funding failed");
      }

      setStep("success");
      // Refetch balance to confirm
      await refetch();
      // Give balance time to settle then call success
      setTimeout(() => onFundingSuccess(), 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(msg);
      setStep("input");
    } finally {
      setFunding(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backdropFilter: "blur(16px)", background: "rgba(0,0,0,0.75)" }}
    >
      <div
        className="relative w-full max-w-md rounded-2xl overflow-hidden"
        style={{
          background: `linear-gradient(135deg, var(--country-from, #1a1a2e) 0%, var(--country-to, #0f3460) 100%)`,
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)",
        }}
      >
        {/* Top accent bar */}
        <div
          className="h-1 w-full"
          style={{ background: "var(--country-accent, #e94560)" }}
        />

        <div className="p-8 space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <div className="text-3xl">🏟️</div>
            <h2 className="font-display text-2xl font-bold text-white leading-tight">
              Your Free Pass Has Expired.
            </h2>
            <p className="text-white/70 text-sm leading-relaxed">
              Fund your app wallet to continue watching. The streaming rate is{" "}
              <span className="text-white font-mono font-semibold">0.0001 USDC / second</span>.
            </p>
          </div>

          {/* Balance display */}
          <div
            className="rounded-xl p-4 space-y-1"
            style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <p className="text-xs text-white/50 font-medium uppercase tracking-wider">
              Current USDC Balance
            </p>
            <p className="text-2xl font-mono font-bold text-white">
              {balanceLoading
                ? "Loading..."
                : balance !== null
                  ? `${balance.toFixed(4)} USDC`
                  : "—"}
            </p>
            {walletAddress && (
              <p className="text-xs text-white/30 font-mono truncate">
                {walletAddress.slice(0, 6)}…{walletAddress.slice(-4)}
              </p>
            )}
          </div>

          {/* Funding input */}
          {step === "input" && (
            <div className="space-y-3">
              <label className="block text-xs text-white/60 font-medium uppercase tracking-wider">
                Amount to deposit (USDC)
              </label>
              <div className="flex gap-2">
                {["5", "10", "25"].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setAmount(preset)}
                    className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
                    style={{
                      background: amount === preset
                        ? "var(--country-accent, #e94560)"
                        : "rgba(255,255,255,0.08)",
                      color: "white",
                      border: amount === preset
                        ? "none"
                        : "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    ${preset}
                  </button>
                ))}
              </div>
              <input
                id="funding-amount"
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Custom amount"
                className="w-full px-4 py-3 rounded-xl text-white text-sm font-mono outline-none"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              />

              {error && (
                <p className="text-red-400 text-xs font-medium">{error}</p>
              )}

              <button
                id="fund-wallet-btn"
                onClick={handleFund}
                disabled={funding}
                className="w-full py-4 rounded-xl text-white font-bold text-base transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
                style={{
                  background: "var(--country-accent, #e94560)",
                  boxShadow: "0 0 24px rgba(234,69,96,0.4)",
                }}
              >
                Fund Wallet
              </button>
            </div>
          )}

          {/* Pending state */}
          {step === "pending" && (
            <div className="text-center space-y-3 py-4">
              <div
                className="w-10 h-10 rounded-full border-2 border-t-transparent mx-auto animate-spin"
                style={{ borderColor: "var(--country-accent, #e94560)", borderTopColor: "transparent" }}
              />
              <p className="text-white/70 text-sm">Processing your deposit…</p>
            </div>
          )}

          {/* Success state */}
          {step === "success" && (
            <div className="text-center space-y-3 py-4">
              <div className="text-4xl">✅</div>
              <p className="text-white font-semibold">Wallet funded! Resuming stream…</p>
            </div>
          )}

          {/* Info footer */}
          <div
            className="rounded-xl p-3 text-xs space-y-2"
            style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.05)" }}
          >
            <p className="text-white/40 font-semibold mb-2">Revenue split on every second:</p>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-white font-mono font-bold">85%</p>
                <p className="text-white/40">Creator</p>
              </div>
              <div>
                <p className="text-white font-mono font-bold">10%</p>
                <p className="text-white/40">Fan Pool</p>
              </div>
              <div>
                <p className="text-white font-mono font-bold">5%</p>
                <p className="text-white/40">Treasury</p>
              </div>
            </div>
            <div className="pt-2 border-t border-white/5 text-center">
              <a
                href="https://faucet.circle.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-white underline font-semibold transition-all"
              >
                Go to Circle Faucet page ↗
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
