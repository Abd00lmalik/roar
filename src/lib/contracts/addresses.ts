export const CONTRACT_ADDRESSES = {
  usdc: process.env.NEXT_PUBLIC_USDC_ADDRESS as `0x${string}` | undefined,
  roarBadges: process.env.NEXT_PUBLIC_BADGE_CONTRACT_ADDRESS as `0x${string}` | undefined,
  fanPassport: process.env.NEXT_PUBLIC_FAN_PASSPORT_ADDRESS as `0x${string}` | undefined,
  varSystem: process.env.NEXT_PUBLIC_VAR_SYSTEM_ADDRESS as `0x${string}` | undefined,
  adBoard: process.env.NEXT_PUBLIC_AD_BOARD_ADDRESS as `0x${string}` | undefined,
} as const;

export const isMockMode = !CONTRACT_ADDRESSES.usdc;
