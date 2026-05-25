"use client";

import { ReactNode, useEffect, useMemo, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, connectorsForWallets, darkTheme } from "@rainbow-me/rainbowkit";
import { metaMaskWallet, okxWallet, walletConnectWallet } from "@rainbow-me/rainbowkit/wallets";
import { getAddress } from "viem";
import { WagmiProvider, createConfig, http, useAccount } from "wagmi";
import { createClient } from "@/lib/supabase/client";
import { useCountryTheme } from "@/lib/theme/useCountryTheme";
import { xLayerTestnet } from "@/lib/xlayer/chain";

const walletConnectProjectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "2f05ae7c3f314f5f896f7bf9bb6f6e41";

const connectors = connectorsForWallets(
  [
    {
      groupName: "Recommended",
      wallets: [okxWallet, metaMaskWallet, walletConnectWallet],
    },
  ],
  {
    appName: "Roarball",
    projectId: walletConnectProjectId,
    appDescription: "Where football attention becomes creator revenue.",
    appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  },
);

const wagmiConfig = createConfig({
  chains: [xLayerTestnet],
  connectors,
  transports: {
    [xLayerTestnet.id]: http(
      process.env.NEXT_PUBLIC_XLAYER_TESTNET_RPC_URL ?? "https://testrpc.xlayer.tech",
    ),
  },
});

function ThemeBridge({ children }: { children: ReactNode }) {
  useCountryTheme();
  return <>{children}</>;
}

function OnboardingGate() {
  const router = useRouter();
  const pathname = usePathname();
  const { address, isConnected } = useAccount();
  const hasCheckedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isConnected || !address) return;
    if (pathname === "/onboarding") return;

    const normalizedAddress = getAddress(address);
    if (hasCheckedRef.current === normalizedAddress) return;

    hasCheckedRef.current = normalizedAddress;

    const supabase = createClient();
    if (!supabase) return;

    supabase
      .from("profiles")
      .select("supporter_nation")
      .eq("wallet_address", normalizedAddress)
      .maybeSingle()
      .then((result: { data: { supporter_nation?: string | null } | null }) => {
        const data = result.data;
        if (!data?.supporter_nation) {
          router.push("/onboarding");
        }
      })
      .catch(() => {
        // No-op: navigation should not break on profile lookup errors.
      });
  }, [isConnected, address, pathname, router]);

  return null;
}

export function AppProviders({ children }: { children: ReactNode }) {
  const queryClient = useMemo(() => new QueryClient(), []);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()} modalSize="compact">
          <ThemeBridge>
            <OnboardingGate />
            {children}
          </ThemeBridge>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
