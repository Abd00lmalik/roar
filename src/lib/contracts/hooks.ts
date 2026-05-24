"use client";

import { useWriteContract } from "wagmi";
import { CONTRACT_ADDRESSES } from "@/lib/contracts/addresses";
import { roarBadgesAbi } from "@/lib/contracts/abis";

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
