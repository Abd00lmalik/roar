"use client";

import { signIn, useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useConnect, useAccount } from "wagmi";

function SignInForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/stadium";
  const { status } = useSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const { connectors, connect } = useConnect();
  const { isConnected } = useAccount();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(callbackUrl);
    }
  }, [status, callbackUrl, router]);

  useEffect(() => {
    if (isConnected && status !== "authenticated") {
      router.replace("/wallet/fund");
    }
  }, [isConnected, status, router]);

  const handleGoogle = () => {
    void signIn("google", { callbackUrl });
  };

  const handleEmail = async () => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      if (mode === "signup") {
        const savedTeam = typeof window !== "undefined" ? localStorage.getItem("roar_selected_team") : null;
        const parsedTeam = savedTeam ? (JSON.parse(savedTeam) as { code?: string } | null) : null;

        const registerResponse = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password,
            displayName,
            supporterNation: parsedTeam?.code ?? "US",
          }),
        });

        const registerPayload = (await registerResponse.json().catch(() => null)) as { error?: string } | null;
        if (!registerResponse.ok) {
          throw new Error(registerPayload?.error ?? "Could not create account");
        }

        setMessage("Account created. Signing you in...");
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!result?.ok) {
        throw new Error("Invalid email or password");
      }

      router.replace(callbackUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleWeb3 = () => {
    const injected = connectors.find((c) => c.type === "injected");
    if (injected) {
      connect({ connector: injected });
    } else {
      setError("No injected wallet found. Install MetaMask or OKX Wallet.");
    }
  };

  const faucetUsdc = process.env.NEXT_PUBLIC_USDC_FAUCET_URL ?? "https://faucet.circle.com";
  const faucetOkb = process.env.NEXT_PUBLIC_OKB_FAUCET_URL ?? "https://www.okx.com/xlayer/faucet";

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#060810] px-4">
      <div className="w-full max-w-sm space-y-6 rounded-3xl border border-white/[0.08] bg-white/[0.03] p-8 backdrop-blur-xl shadow-[0_0_60px_rgba(0,0,0,0.6)]">
        <div className="space-y-1 text-center">
          <h1 className="text-xl font-bold text-white">Welcome to RoarTube</h1>
          <p className="text-sm text-white/40">Sign in to access your stadium</p>
        </div>

        <button
          onClick={handleGoogle}
          className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl bg-white py-3 font-semibold text-black transition-colors hover:bg-white/90"
        >
          <GoogleIcon />
          Continue with Google
        </button>

        <div className="space-y-3">
          <div className="flex gap-2">
            <button
              onClick={() => setMode("signin")}
              className={`flex-1 rounded-lg py-2 text-xs font-semibold ${
                mode === "signin" ? "bg-[var(--country-accent,#FFCE00)] text-black" : "bg-white/[0.06] text-white/70"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode("signup")}
              className={`flex-1 rounded-lg py-2 text-xs font-semibold ${
                mode === "signup" ? "bg-[var(--country-accent,#FFCE00)] text-black" : "bg-white/[0.06] text-white/70"
              }`}
            >
              Create Account
            </button>
          </div>

          {mode === "signup" ? (
            <input
              type="text"
              placeholder="Display name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-[var(--country-accent,#FFCE00)]"
            />
          ) : null}

          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-[var(--country-accent,#FFCE00)]"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-[var(--country-accent,#FFCE00)]"
          />

          {error ? <p className="text-xs text-red-400">{error}</p> : null}
          {message ? <p className="text-xs text-emerald-400">{message}</p> : null}

          <button
            onClick={() => {
              void handleEmail();
            }}
            disabled={loading || !email || !password || (mode === "signup" && !displayName)}
            className="w-full cursor-pointer rounded-xl bg-[var(--country-accent,#FFCE00)] py-3 text-sm font-bold text-black disabled:opacity-40"
          >
            {loading ? "Processing..." : mode === "signup" ? "Create Account" : "Sign In"}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-white/[0.08]" />
          <span className="text-xs text-white/20">or</span>
          <div className="h-px flex-1 bg-white/[0.08]" />
        </div>

        <button
          onClick={handleWeb3}
          className="w-full cursor-pointer rounded-xl border border-[var(--country-accent,#FFCE00)]/40 py-3 text-sm font-medium text-[var(--country-accent,#FFCE00)] transition-colors hover:bg-[var(--country-accent,#FFCE00)]/10"
        >
          Connect Web3 Wallet
        </button>

        <div className="space-y-1 border-t border-white/[0.06] pt-2 text-center">
          <p className="text-xs text-white/20">Need testnet funds?</p>
          <a href={faucetUsdc} target="_blank" rel="noopener noreferrer" className="block text-xs text-[var(--country-accent,#FFCE00)] hover:underline">
            Get USDC
          </a>
          <a href={faucetOkb} target="_blank" rel="noopener noreferrer" className="block text-xs text-[var(--country-accent,#FFCE00)] hover:underline">
            Get OKB (gas)
          </a>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#060810] text-sm text-white/40">Loading...</div>
      }
    >
      <SignInForm />
    </Suspense>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" />
      <path fill="#FBBC05" d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.347 2.827.957 4.042l3.007-2.332z" />
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" />
    </svg>
  );
}
