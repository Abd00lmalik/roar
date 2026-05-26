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
      <div className="glass-panel w-full max-w-md space-y-4 p-6 border-amber-500/20 bg-stadium/95">
        {!isConnected ? (
          <div className="space-y-3 text-center">
            <p className="text-white font-semibold">Your free preview has ended</p>
            <p className="text-white/60 text-sm">
              Connect your wallet and deposit USDC to keep watching.
              <br />
              Rate: 0.0001 USDC / second
            </p>

            {/* Testnet faucet links */}
            <div className="text-xs text-white/40 space-y-1 text-left bg-black/20 p-3 rounded border border-white/5">
              <p className="font-semibold text-chalk/70 mb-1">Need testnet funds?</p>
              <a
                href="https://www.okx.com/xlayer/faucet"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--country-accent,#FFCE00)] hover:underline block"
              >
                Get OKB (gas) → OKX X Layer Faucet
              </a>
              <a
                href="https://faucet.circle.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--country-accent,#FFCE00)] hover:underline block"
              >
                Get USDC (testnet) → Circle Faucet
              </a>
              <a
                href="https://www.okx.com/xlayer/bridge"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--country-accent,#FFCE00)] hover:underline block"
              >
                Bridge USDC to X Layer → OKX Bridge
              </a>
            </div>

            <button
              onClick={connectWallet}
              className="w-full py-3 rounded-xl bg-[var(--country-accent,#FFCE00)] text-black font-bold text-sm hover:brightness-110 transition-all"
            >
              Connect Wallet to Continue
            </button>
            <button 
              className="text-xs text-chalk/60 hover:text-chalk/80 underline py-1 block mx-auto" 
              onClick={onClose}
            >
              Dismiss (Pause Match)
            </button>
          </div>
        ) : (
          <>
            <h3 className="text-lg font-display font-semibold text-amber-300">🏟️ Stadium Admission Ticket</h3>
            <p className="text-sm text-chalk/90 leading-relaxed">
              Your free preview window has expired. The ticket rate for this match is:
              <span className="block my-2 text-xl font-mono font-bold text-chalk">0.0001 USDC / second</span>
              Please approve a USDC allowance to keep watching and support creators on-chain.
            </p>
            <div className="flex flex-col gap-2 pt-2">
              <FootballButton disabled={isApproving} onClick={onApprove}>
                {isApproving ? "Approving Allowance..." : "Approve USDC Allowance 💳"}
              </FootballButton>
              <button 
                disabled={isApproving}
                className="text-xs text-chalk/60 hover:text-chalk/80 underline py-1" 
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
