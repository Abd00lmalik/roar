"use client";

import { ReactNode, useMemo } from "react";
import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, darkTheme, connectorsForWallets } from "@rainbow-me/rainbowkit";
import { okxWallet, metaMaskWallet, walletConnectWallet } from "@rainbow-me/rainbowkit/wallets";
import { WagmiProvider, createConfig, http } from "wagmi";
import { xLayerTestnet } from "@/lib/xlayer/chain";
import { useCountryTheme } from "@/lib/theme/useCountryTheme";
import { UserProvisioner } from "@/components/providers/UserProvisioner";

const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

const connectors = connectorsForWallets(
  [
    {
      groupName: "Recommended",
      wallets: walletConnectProjectId
        ? [okxWallet, metaMaskWallet, walletConnectWallet]
        : [okxWallet, metaMaskWallet],
    },
  ],
  {
    appName: "RoarTube",
    projectId: walletConnectProjectId ?? "disabled-walletconnect",
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
            <ThemeBridge>
              <UserProvisioner />
              {children}
            </ThemeBridge>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </SessionProvider>
  );
}
