"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { parseUnits } from "viem";
import { useRouter } from "next/navigation";

const erc20Abi = [
  {
    name: "transfer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "recipient", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

export default function FundWalletPage() {
  const router = useRouter();
  const { data: session, status, update: updateSession } = useSession();
  const { address: web3Address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [envMissing, setEnvMissing] = useState<string[]>([]);

  useEffect(() => {
    void fetch("/api/env/check")
      .then((res) => res.json())
      .then((payload: { missing?: string[] }) => {
        setEnvMissing(Array.isArray(payload.missing) ? payload.missing : []);
      })
      .catch(() => {
        setEnvMissing([]);
      });
  }, []);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#060810] text-sm text-white/50">
        Loading...
      </div>
    );
  }

  if (status === "unauthenticated" && !isConnected) {
    router.push("/auth/signin?callbackUrl=/wallet/fund");
    return null;
  }

  const isWeb3User = isConnected && !!web3Address;
  const walletAddr = web3Address ?? session?.user?.wallet_address ?? "";
  const gatewayBal = session?.user?.gateway_balance ?? 0;
  const faucetUsdc = process.env.NEXT_PUBLIC_USDC_FAUCET_URL ?? "https://faucet.circle.com";
  const faucetOkb = process.env.NEXT_PUBLIC_OKB_FAUCET_URL ?? "https://www.okx.com/xlayer/faucet";

  const handleMove = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (isWeb3User) {
        const usdcAddress = process.env.NEXT_PUBLIC_USDC_ADDRESS;
        const platformGatewayAddress = process.env.NEXT_PUBLIC_PLATFORM_GATEWAY_WALLET_ADDRESS;
        if (!usdcAddress || !platformGatewayAddress) {
          throw new Error("Missing NEXT_PUBLIC_USDC_ADDRESS or NEXT_PUBLIC_PLATFORM_GATEWAY_WALLET_ADDRESS");
        }

        const amountInUnits = parseUnits(amount, 6);
        const hash = await writeContractAsync({
          address: usdcAddress as `0x${string}`,
          abi: erc20Abi,
          functionName: "transfer",
          args: [platformGatewayAddress as `0x${string}`, amountInUnits],
        });

        const res = await fetch("/api/wallet/move-to-gateway-web3", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ txHash: hash, amount, walletAddress: walletAddr }),
        });
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        if (!res.ok) throw new Error(data?.error ?? "Web3 transfer verification failed");

        await updateSession();
        setSuccess(`${amount} USDC moved to gateway. Ready to watch.`);
      } else {
        const res = await fetch("/api/wallet/move-to-gateway", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount }),
        });
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        if (!res.ok) throw new Error(data?.error ?? "Circle transfer failed");

        await updateSession();
        setSuccess(`${amount} USDC moved to gateway. Ready to watch.`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transfer failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#060810] px-4">
      <div className="w-full max-w-md space-y-6 rounded-3xl border border-white/[0.08] bg-white/[0.03] p-8 backdrop-blur-xl">
        <h1 className="text-center text-xl font-bold text-white">Stadium Wallet</h1>

        {envMissing.length > 0 ? (
          <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-xs text-amber-300">
            Missing environment config: {envMissing.join(", ")}
          </div>
        ) : null}

        <div className="space-y-2 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
          <p className="text-xs uppercase tracking-wider text-white/40">Funding Wallet</p>
          <p className="break-all font-mono text-sm text-white">{walletAddr || "-"}</p>
          <p className="text-sm text-white/60">Your personal USDC funding wallet</p>
        </div>

        <div className="space-y-2 rounded-xl border border-white/[0.04] bg-white/[0.02] p-4">
          <p className="text-xs text-white/40">Get testnet funds:</p>
          <a
            href={faucetUsdc}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-lg bg-white/[0.04] px-3 py-2 transition-colors hover:bg-white/[0.08]"
          >
            <span className="text-sm text-white">Get USDC</span>
            <span className="text-xs text-[var(--country-accent,#FFCE00)]">Open</span>
          </a>
          <a
            href={faucetOkb}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-lg bg-white/[0.04] px-3 py-2 transition-colors hover:bg-white/[0.08]"
          >
            <span className="text-sm text-white">Get OKB (gas)</span>
            <span className="text-xs text-[var(--country-accent,#FFCE00)]">Open</span>
          </a>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-white/60">
            Move USDC to your <strong className="text-white">Gateway Wallet</strong> to start watching.
            {isWeb3User ? " A wallet signature is required." : " No signature required for Circle-managed wallets."}
          </p>

          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Amount USDC"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-[var(--country-accent,#FFCE00)]"
            />
            <button
              onClick={handleMove}
              disabled={loading || !amount}
              className="cursor-pointer rounded-xl bg-[var(--country-accent,#FFCE00)] px-5 py-3 text-sm font-bold text-black disabled:opacity-40"
            >
              {loading ? "..." : "Move"}
            </button>
          </div>

          {success ? <p className="text-sm text-green-400">{success}</p> : null}
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
        </div>

        <div className="rounded-2xl border border-[var(--country-accent,#FFCE00)]/20 bg-[var(--country-accent,#FFCE00)]/10 p-4 text-center">
          <p className="text-xs uppercase tracking-wider text-white/50">Gateway Balance</p>
          <p className="text-2xl font-black text-[var(--country-accent,#FFCE00)]">{Number(gatewayBal).toFixed(4)} USDC</p>
          <p className="mt-1 text-xs text-white/30">~ {Math.floor(Number(gatewayBal) / 0.0001).toLocaleString()} seconds of watching</p>
        </div>
      </div>
    </div>
  );
}
