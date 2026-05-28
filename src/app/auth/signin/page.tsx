"use client";

import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense } from "react";
import { useConnect, useAccount } from "wagmi";

function SignInForm() {
  const router       = useRouter();
  const params       = useSearchParams();
  const callbackUrl  = params.get("callbackUrl") ?? "/stadium";
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [mode,     setMode]     = useState<"signin" | "signup">("signin");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const { connectors, connect } = useConnect();
  const { isConnected }         = useAccount();

  const handleGoogle = () => signIn("google", { callbackUrl });

  const handleEmail = async () => {
    setLoading(true);
    setError("");
    const result = await signIn("credentials", {
      email, password, redirect: false, callbackUrl,
    });
    setLoading(false);
    if (result?.error) setError("Invalid email or password");
    else router.push(callbackUrl);
  };

  const handleWeb3 = () => {
    const injected = connectors.find((c) => c.type === "injected");
    if (injected) connect({ connector: injected });
  };

  // If web3 wallet connected, redirect to stadium
  if (isConnected) router.push(callbackUrl);

  return (
    <div className="min-h-screen bg-[#060810] flex items-center justify-center px-4">
      <div className="backdrop-blur-xl bg-white/[0.03] border border-white/[0.08]
        rounded-3xl p-8 w-full max-w-sm space-y-6 shadow-[0_0_60px_rgba(0,0,0,0.6)]">

        <div className="text-center space-y-1">
          <h1 className="text-white font-bold text-xl">Welcome to RoarTube</h1>
          <p className="text-white/40 text-sm">Sign in to access your stadium</p>
        </div>

        {/* Google */}
        <button onClick={handleGoogle}
          className="w-full py-3 rounded-xl bg-white text-black font-semibold
            flex items-center justify-center gap-3 hover:bg-white/90 transition-colors cursor-pointer">
          <GoogleIcon />
          Continue with Google
        </button>

        {/* Email + Password */}
        <div className="space-y-3">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08]
              text-white placeholder-white/30 text-sm focus:outline-none
              focus:ring-1 focus:ring-[var(--country-accent,#FFCE00)]"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08]
              text-white placeholder-white/30 text-sm focus:outline-none
              focus:ring-1 focus:ring-[var(--country-accent,#FFCE00)]"
          />
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <div className="flex gap-2">
            <button onClick={() => { setMode("signin"); handleEmail(); }}
              disabled={loading}
              className="flex-1 py-3 rounded-xl bg-[var(--country-accent,#FFCE00)]
                text-black font-bold text-sm disabled:opacity-40 cursor-pointer">
              {loading ? "..." : "Sign In"}
            </button>
            <button onClick={() => { setMode("signup"); handleEmail(); }}
              disabled={loading}
              className="flex-1 py-3 rounded-xl bg-white/[0.06] border border-white/[0.08]
                text-white font-medium text-sm hover:bg-white/[0.10] cursor-pointer">
              Create Account
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-white/[0.08]" />
          <span className="text-white/20 text-xs">or</span>
          <div className="flex-1 h-px bg-white/[0.08]" />
        </div>

        {/* Web3 Wallet */}
        <button onClick={handleWeb3}
          className="w-full py-3 rounded-xl border border-[var(--country-accent,#FFCE00)]/40
            text-[var(--country-accent,#FFCE00)] font-medium text-sm
            hover:bg-[var(--country-accent,#FFCE00)]/10 transition-colors cursor-pointer">
          🔗 Connect Web3 Wallet
        </button>

        {/* Faucet links */}
        <div className="text-center space-y-1 pt-2 border-t border-white/[0.06]">
          <p className="text-white/20 text-xs">Need testnet funds?</p>
          <a href="https://faucet.circle.com" target="_blank" rel="noopener noreferrer"
            className="text-[var(--country-accent,#FFCE00)] text-xs hover:underline block">
            Get USDC → faucet.circle.com
          </a>
          <a href="https://www.okx.com/xlayer/faucet" target="_blank" rel="noopener noreferrer"
            className="text-[var(--country-accent,#FFCE00)] text-xs hover:underline block">
            Get OKB → OKX X Layer Faucet
          </a>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#060810] flex items-center justify-center text-white/40 text-sm">
        Loading...
      </div>
    }>
      <SignInForm />
    </Suspense>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
      <path fill="#FBBC05" d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.347 2.827.957 4.042l3.007-2.332z"/>
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/>
    </svg>
  );
}
