"use client";

import { useReadContract, useAccount } from "wagmi";
import { PROTOCOL } from "@/lib/constants/protocol";

const VAULT_ABI = [
  {
    inputs: [{ name: "creator", type: "address" }],
    name:   "creatorEarnings",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name:   "claimCreatorEarnings",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export function useCreatorEarnings() {
  const { address } = useAccount();

  const { data: rawEarnings, refetch } = useReadContract({
    address:      PROTOCOL.VAULT_ADDRESS,
    abi:          VAULT_ABI,
    functionName: "creatorEarnings",
    args:         address ? [address] : undefined,
    query:        { enabled: !!address, refetchInterval: 30_000 },
  });

  // Convert micro-USDC to display USDC (6 decimals)
  const claimableUsdc = rawEarnings
    ? Number(rawEarnings) / 1_000_000
    : 0;

  return { claimableUsdc, rawEarnings, refetch };
}
