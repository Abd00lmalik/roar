"use client";

import { useState } from "react";
import { FootballButton } from "@/components/shared/FootballButton";
import { isMockMode } from "@/lib/contracts/addresses";
import { useWithdrawCreatorEarnings } from "@/lib/contracts/hooks";

export function WithdrawButton() {
  const [done, setDone] = useState(false);
  const { withdraw, isPending } = useWithdrawCreatorEarnings();

  return (
    <div className="space-y-2">
      <FootballButton
        onClick={async () => {
          if (isMockMode) {
            setDone(true);
            return;
          }
          await withdraw();
          setDone(true);
        }}
      >
        {isPending ? "Withdrawing..." : "Withdraw to Wallet"}
      </FootballButton>
      {done && <p className="text-xs text-green-400">Withdrawal successful.</p>}
    </div>
  );
}
