"use client";

export function useCreatorEarnings() {
  return {
    claimableUsdc: 0,
    rawEarnings: BigInt(0),
    refetch: async () => ({ data: BigInt(0) }),
  };
}
