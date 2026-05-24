"use client";

import { FootballButton } from "@/components/shared/FootballButton";

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
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-md space-y-4 p-6 border-amber-500/20">
        <h3 className="text-lg font-display font-semibold text-amber-300">🏟️ Stadium Admission Ticket</h3>
        <p className="text-sm text-chalk/90 leading-relaxed">
          Your free preview window has expired. The ticket rate for this match is:
          <span className="block my-2 text-xl font-mono font-bold text-chalk">0.001 USDC / second</span>
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
      </div>
    </div>
  );
}
