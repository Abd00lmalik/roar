"use client";

import { ReactNode, useMemo } from "react";
import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, darkTheme, connectorsForWallets } from "@rainbow-me/rainbowkit";
import { okxWallet, metaMaskWallet, walletConnectWallet } from "@rainbow-me/rainbowkit/wallets";
import { WagmiProvider, createConfig, http } from "wagmi";
import { xLayerTestnet } from "@/lib/xlayer/chain";
import { useCountryTheme } from "@/lib/theme/useCountryTheme";

const walletConnectProjectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ??
  "2f05ae7c3f314f5f896f7bf9bb6f6e41";

const connectors = connectorsForWallets(
  [
    {
      groupName: "Recommended",
      wallets: [
        okxWallet,
        metaMaskWallet,
        walletConnectWallet,
      ],
    },
  ],
  {
    appName: "RoarTube",
    projectId: walletConnectProjectId,
    appDescription: "Where football attention becomes creator revenue.",
    appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "https://roartube.vercel.app",
  },
);

const wagmiConfig = createConfig({
  chains: [xLayerTestnet],
  connectors,
  transports: {
    [xLayerTestnet.id]: http(
      process.env.NEXT_PUBLIC_XLAYER_TESTNET_RPC_URL ??
        "https://testrpc.xlayer.tech",
    ),
  },
});

function ThemeBridge({ children }: { children: ReactNode }) {
  useCountryTheme();
  return <>{children}</>;
}

export function AppProviders({ children }: { children: ReactNode }) {
  const queryClient = useMemo(() => new QueryClient(), []);

  return (
    <SessionProvider>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider theme={darkTheme()} modalSize="compact">
            <ThemeBridge>{children}</ThemeBridge>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </SessionProvider>
  );
}
