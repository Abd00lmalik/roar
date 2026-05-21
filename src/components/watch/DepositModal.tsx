"use client";

import { FootballButton } from "@/components/shared/FootballButton";

export function DepositModal({
  open,
  onClose,
  onDeposit,
}: {
  open: boolean;
  onClose: () => void;
  onDeposit: (amount: number) => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="glass-panel w-full max-w-md space-y-4 p-5">
        <h3 className="font-semibold">⏰ Your free match time is over.</h3>
        <p className="text-sm text-chalk/80">
          Deposit USDC to keep watching and support this creator by the second.
        </p>
        <div className="flex gap-2">
          <FootballButton onClick={() => onDeposit(5)}>Deposit 5 USDC</FootballButton>
          <FootballButton variant="secondary" onClick={() => onDeposit(10)}>
            Deposit 10 USDC
          </FootballButton>
        </div>
        <div className="flex justify-end">
          <button className="text-sm text-chalk/70" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
