"use client";

import { signIn } from "next-auth/react";
import { useConnect, useAccount } from "wagmi";
import { useEffect } from "react";

interface AuthGateProps {
  onAuthenticated: () => void;
}

export function AuthGate({ onAuthenticated }: AuthGateProps) {
  const { connectors, connect } = useConnect();
  const { isConnected } = useAccount();

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: window.location.href });
  };

  const handleWalletConnect = () => {
    const injected = connectors.find((c) => c.id === "injected");
    if (injected) {
      connect({ connector: injected });
    } else {
      // Fallback if no injected connector is found
      const firstConnector = connectors[0];
      if (firstConnector) connect({ connector: firstConnector });
    }
  };

  // If wallet just connected, signal authenticated
  useEffect(() => {
    if (isConnected) {
      onAuthenticated();
    }
  }, [isConnected, onAuthenticated]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
      <div className="backdrop-blur-xl bg-white/[0.03] border border-white/[0.08]
        rounded-3xl p-8 max-w-sm w-full mx-4 space-y-6 text-center
        shadow-[0_0_60px_rgba(0,0,0,0.6)]">

        <div className="space-y-2">
          <span className="text-5xl">⏱️</span>
          <h2 className="text-xl font-bold text-white">Your free preview ended</h2>
          <p className="text-white/50 text-sm">
            Create an account to keep watching.
            <br/>
            <span className="text-[var(--country-accent)]">0.0001 USDC/second</span>
            {" "}— less than a cup of tea per hour.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleGoogleSignIn}
            className="w-full py-3 px-4 rounded-xl bg-white text-black font-semibold
              flex items-center justify-center gap-3 hover:bg-white/90 transition-colors cursor-pointer"
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
              <path fill="#FBBC05" d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.347 2.827.957 4.042l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/>
            </svg>
            Continue with Google
          </button>

          <button
            onClick={() => {
              // Sign in with email - custom dummy or signin routing
              alert("Email onboarding is coming soon! Please use Google or Connect Web3 Wallet.");
            }}
            className="w-full py-3 rounded-xl bg-white/[0.06] border border-white/[0.08]
              text-white font-medium hover:bg-white/[0.10] transition-colors cursor-pointer"
          >
            ✉️ Continue with Email
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/[0.08]" />
            </div>
            <div className="relative flex justify-center text-xs text-white/30">
              <span className="bg-[#0a0d1a] px-2">or</span>
            </div>
          </div>

          <button
            onClick={handleWalletConnect}
            className="w-full py-3 rounded-xl border border-[var(--country-accent)]/40
              text-[var(--country-accent)] font-medium cursor-pointer
              hover:bg-[var(--country-accent)]/10 transition-colors"
          >
            🔗 Connect Web3 Wallet
          </button>
        </div>

        {/* Testnet faucet links */}
        <div className="text-xs text-white/30 space-y-1 pt-2 border-t border-white/[0.06]">
          <p>Need testnet funds?</p>
          <a href="https://www.okx.com/xlayer/faucet"
            target="_blank" rel="noopener noreferrer"
            className="text-[var(--country-accent)] hover:underline block">
            Get OKB (gas) → OKX X Layer Faucet
          </a>
          <a href="https://faucet.circle.com"
            target="_blank" rel="noopener noreferrer"
            className="text-[var(--country-accent)] hover:underline block">
            Get USDC (testnet) → Circle Faucet
          </a>
        </div>

      </div>
    </div>
  );
}
