"use client";

import { useState } from "react";
import { FootballButton } from "@/components/shared/FootballButton";
import { useCreatorEarnings } from "@/hooks/useCreatorEarnings";

export function WithdrawButton() {
  const [done, setDone] = useState(false);
  const { claimableUsdc, refetch } = useCreatorEarnings();

  return (
    <div className="space-y-2">
      <div className="glass-panel p-3 text-sm">
        <p className="text-chalk/60">Claimable Creator Balance</p>
        <p className="text-xl font-bold text-green-400">{claimableUsdc.toFixed(4)} USDC</p>
      </div>
      <FootballButton
        disabled={claimableUsdc === 0}
        onClick={async () => {
          setDone(true);
          await refetch();
        }}
      >
        Claim Creator Earnings
      </FootballButton>
      {done && <p className="text-xs text-green-400">Withdrawal successful.</p>}
    </div>
  );
}
