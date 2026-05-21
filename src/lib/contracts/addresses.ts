export const CONTRACT_ADDRESSES = {
  usdc: process.env.NEXT_PUBLIC_USDC_ADDRESS as `0x${string}` | undefined,
  roarVault: process.env.NEXT_PUBLIC_PAYMENT_CONTRACT_ADDRESS as
    | `0x${string}`
    | undefined,
  roarBadges: process.env.NEXT_PUBLIC_BADGE_CONTRACT_ADDRESS as
    | `0x${string}`
    | undefined,
} as const;

export const isMockMode = !CONTRACT_ADDRESSES.roarVault;
