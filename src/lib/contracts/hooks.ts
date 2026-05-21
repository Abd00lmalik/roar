"use client";

import { useWriteContract } from "wagmi";
import { CONTRACT_ADDRESSES } from "@/lib/contracts/addresses";
import { erc20Abi, roarBadgesAbi, roarVaultAbi } from "@/lib/contracts/abis";

export function useDepositUsdc() {
  const { writeContractAsync, isPending } = useWriteContract();
  const approveAndDeposit = async (amountMicro: bigint) => {
    if (!CONTRACT_ADDRESSES.usdc || !CONTRACT_ADDRESSES.roarVault) return;
    await writeContractAsync({
      abi: erc20Abi,
      address: CONTRACT_ADDRESSES.usdc,
      functionName: "approve",
      args: [CONTRACT_ADDRESSES.roarVault, amountMicro],
    });
    await writeContractAsync({
      abi: roarVaultAbi,
      address: CONTRACT_ADDRESSES.roarVault,
      functionName: "deposit",
      args: [amountMicro],
    });
  };
  return { approveAndDeposit, isPending };
}

export function useWithdrawCreatorEarnings() {
  const { writeContractAsync, isPending } = useWriteContract();
  const withdraw = async () => {
    if (!CONTRACT_ADDRESSES.roarVault) return;
    await writeContractAsync({
      abi: roarVaultAbi,
      address: CONTRACT_ADDRESSES.roarVault,
      functionName: "withdrawCreatorEarnings",
      args: [],
    });
  };
  return { withdraw, isPending };
}

export function useMintBadge() {
  const { writeContractAsync, isPending } = useWriteContract();
  const mintBadge = async (recipient: `0x${string}`, badgeId: number, badgeName: string) => {
    if (!CONTRACT_ADDRESSES.roarBadges) return;
    await writeContractAsync({
      abi: roarBadgesAbi,
      address: CONTRACT_ADDRESSES.roarBadges,
      functionName: "mintBadge",
      args: [recipient, BigInt(badgeId), badgeName],
    });
  };
  return { mintBadge, isPending };
}
