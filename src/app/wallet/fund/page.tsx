"use client";

import { useSession } from "next-auth/react";
import { useState }   from "react";
import { useAccount, useWriteContract } from "wagmi";
import { parseUnits } from "viem";
import { useRouter }   from "next/navigation";

const erc20Abi = [
  {
    name: "transfer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "recipient", type: "address" },
      { name: "amount", type: "uint256" }
    ],
    outputs: [{ name: "", type: "bool" }]
  }
] as const;

export default function FundWalletPage() {
  const router = useRouter();
  const { data: session, status, update: updateSession } = useSession();
  const { address: web3Address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const [amount,  setAmount]  = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error,   setError]   = useState("");

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#060810] flex items-center justify-center text-white/50 text-sm">
        Loading...
      </div>
    );
  }

  if (status === "unauthenticated" && !isConnected) {
    router.push("/auth/signin?callbackUrl=/wallet/fund");
    return null;
  }

  const isWeb3User   = isConnected && !!web3Address;
  const walletAddr   = web3Address ?? session?.user?.wallet_address ?? "";
  const gatewayBal   = session?.user?.gateway_balance ?? 0;

  const handleMove = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (isWeb3User) {
        // Web3 user: sign a real USDC transfer transaction
        // Transfer from their EOA to the platform gateway wallet
        const usdcAddress = process.env.NEXT_PUBLIC_USDC_ADDRESS;
        const platformGatewayAddress = process.env.NEXT_PUBLIC_PLATFORM_GATEWAY_WALLET_ADDRESS;
        if (!usdcAddress || !platformGatewayAddress) {
          throw new Error("Missing NEXT_PUBLIC_USDC_ADDRESS or NEXT_PUBLIC_PLATFORM_GATEWAY_WALLET_ADDRESS");
        }
        
        // USDC has 6 decimals on Sepolia and X Layer Testnet
        const amountInUnits = parseUnits(amount, 6);
        
        const hash = await writeContractAsync({
          address: usdcAddress as `0x${string}`,
          abi: erc20Abi,
          functionName: "transfer",
          args: [platformGatewayAddress as `0x${string}`, amountInUnits],
        });

        // Verify transaction with backend and update database
        const res = await fetch("/api/wallet/move-to-gateway-web3", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ txHash: hash, amount, walletAddress: walletAddr }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        await updateSession();
        setSuccess(`${amount} USDC moved to gateway. Ready to watch!`);
      } else {
        // Circle user: server-side transfer, no approval needed
        const res = await fetch("/api/wallet/move-to-gateway", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ amount }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        await updateSession();
        setSuccess(`${amount} USDC moved to gateway. Ready to watch!`);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Transfer failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060810] flex items-center justify-center px-4">
      <div className="backdrop-blur-xl bg-white/[0.03] border border-white/[0.08]
        rounded-3xl p-8 w-full max-w-md space-y-6">

        <h1 className="text-white font-bold text-xl text-center">💳 Stadium Wallet</h1>

        {/* Funding wallet info */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 space-y-2">
          <p className="text-white/40 text-xs uppercase tracking-wider">Funding Wallet</p>
          <p className="text-white font-mono text-sm break-all">
            {walletAddr || "—"}
          </p>
          <p className="text-white/60 text-sm">Your personal USDC savings account</p>
        </div>

        {/* Faucet links */}
        <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-4 space-y-2">
          <p className="text-white/40 text-xs">Get testnet funds:</p>
          <a href="https://faucet.circle.com" target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-between py-2 px-3 rounded-lg
              bg-white/[0.04] hover:bg-white/[0.08] transition-colors">
            <span className="text-white text-sm">Get USDC (testnet)</span>
            <span className="text-[var(--country-accent,#FFCE00)] text-xs">faucet.circle.com →</span>
          </a>
          <a href="https://www.okx.com/xlayer/faucet" target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-between py-2 px-3 rounded-lg
              bg-white/[0.04] hover:bg-white/[0.08] transition-colors">
            <span className="text-white text-sm">Get OKB (gas)</span>
            <span className="text-[var(--country-accent,#FFCE00)] text-xs">OKX Faucet →</span>
          </a>
        </div>

        {/* Move to gateway */}
        <div className="space-y-3">
          <p className="text-white/60 text-sm">
            Move USDC to your <strong className="text-white">Gateway Wallet</strong> to start watching.
            {isWeb3User
              ? " You will be asked to sign a transaction."
              : " Instant transfer — no approval needed."}
          </p>

          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Amount USDC"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08]
                text-white placeholder-white/30 text-sm focus:outline-none
                focus:ring-1 focus:ring-[var(--country-accent,#FFCE00)]"
            />
            <button
              onClick={handleMove}
              disabled={loading || !amount}
              className="px-5 py-3 rounded-xl bg-[var(--country-accent,#FFCE00)]
                text-black font-bold text-sm disabled:opacity-40 cursor-pointer">
              {loading ? "..." : "Move →"}
            </button>
          </div>

          {success && <p className="text-green-400 text-sm">{success}</p>}
          {error   && <p className="text-red-400   text-sm">{error}</p>}
        </div>

        {/* Gateway balance */}
        <div className="bg-[var(--country-accent,#FFCE00)]/10 border border-[var(--country-accent,#FFCE00)]/20
          rounded-2xl p-4 text-center">
          <p className="text-white/50 text-xs uppercase tracking-wider">Gateway Balance</p>
          <p className="text-[var(--country-accent,#FFCE00)] text-2xl font-black">
            {Number(gatewayBal).toFixed(4)} USDC
          </p>
          <p className="text-white/30 text-xs mt-1">
            ≈ {Math.floor(Number(gatewayBal) / 0.0001).toLocaleString()} seconds of watching
          </p>
        </div>
      </div>
    </div>
  );
}
