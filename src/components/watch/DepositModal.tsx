"use client";

import { FootballButton } from "@/components/shared/FootballButton";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";

interface DepositModalProps {
  open: boolean;
  isApproving: boolean;
  onClose: () => void;
  onApprove: () => void;
}

export function DepositModal({
  open,
  isApproving,
  onClose,
  onApprove,
}: DepositModalProps) {
  const { isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();

  if (!open) return null;

  const connectWallet = () => {
    openConnectModal?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-md space-y-4 border-amber-500/20 bg-stadium/95 p-6">
        {!isConnected ? (
          <div className="space-y-3 text-center">
            <p className="text-white font-semibold">Your free preview has ended</p>
            <p className="text-white/60 text-sm">
              Connect your wallet and deposit USDC to keep watching.
            </p>
            <p className="text-white/60 text-sm text-center">
              Rate: <span className="text-[var(--country-accent)] font-semibold">0.0001 USDC / second</span>
              <br />
              <span className="text-white/30 text-xs">
                Fan Passport holders: 0.00005 USDC / second
              </span>
            </p>

            <div className="text-xs text-white/40 space-y-1 rounded border border-white/5 bg-black/20 p-3 text-left">
              <p className="mb-1 font-semibold text-chalk/70">Need testnet funds?</p>
              <a
                href="https://www.okx.com/xlayer/faucet"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-[var(--country-accent,#FFCE00)] hover:underline"
              >
                Get OKB (gas) - OKX X Layer Faucet
              </a>
              <a
                href="https://faucet.circle.com"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-[var(--country-accent,#FFCE00)] hover:underline"
              >
                Get USDC (testnet) - Circle Faucet
              </a>
            </div>

            <button
              onClick={connectWallet}
              className="w-full rounded-xl bg-[var(--country-accent,#FFCE00)] py-3 text-sm font-bold text-black transition-all hover:brightness-110"
            >
              Connect Wallet to Continue
            </button>
            <button
              className="mx-auto block py-1 text-xs text-chalk/60 underline hover:text-chalk/80"
              onClick={onClose}
            >
              Dismiss (Pause Match)
            </button>
          </div>
        ) : (
          <>
            <h3 className="text-lg font-display font-semibold text-amber-300">Stadium Admission Ticket</h3>
            <p className="text-sm leading-relaxed text-chalk/90">
              Your free preview window has expired. The ticket rate for this match is:
              <span className="my-2 block text-xl font-mono font-bold text-chalk">0.0001 USDC / second</span>
              <span className="block text-xs text-chalk/70">Fan Passport holders: 0.00005 USDC / second</span>
              Continue watching to start Circle billing.
            </p>
            <div className="flex flex-col gap-2 pt-2">
              <FootballButton disabled={isApproving} onClick={onApprove}>
                {isApproving ? "Resuming..." : "Continue Watching"}
              </FootballButton>
              <button
                disabled={isApproving}
                className="py-1 text-xs text-chalk/60 underline hover:text-chalk/80"
                onClick={onClose}
              >
                Dismiss (Pause Match)
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
