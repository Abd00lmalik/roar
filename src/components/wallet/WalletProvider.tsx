"use client";

import { createContext, useContext, useMemo, useState } from "react";

type WalletContextValue = {
  walletId: string | null;
  walletAddress: string | null;
  setWallet: (walletId: string, walletAddress: string) => void;
};

const WalletContext = createContext<WalletContextValue | null>(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [walletId, setWalletId] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const value = useMemo<WalletContextValue>(
    () => ({
      walletId,
      walletAddress,
      setWallet: (nextWalletId, nextWalletAddress) => {
        setWalletId(nextWalletId);
        setWalletAddress(nextWalletAddress);
      },
    }),
    [walletId, walletAddress],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within WalletProvider");
  }
  return context;
}
