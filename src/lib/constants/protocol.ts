// src/lib/constants/protocol.ts

export const PROTOCOL = {
  CHAIN_ID:        1952,
  VAULT_ADDRESS:   process.env.NEXT_PUBLIC_VAULT_ADDRESS as `0x${string}`,
  USDC_ADDRESS:    process.env.NEXT_PUBLIC_USDC_ADDRESS  as `0x${string}`,

  // Economic constants — must match RoarballVault.sol exactly
  MICRO_USDC_PER_SECOND: BigInt(1000),  // 0.001 USDC at 6 decimals (uses BigInt constructor for ES2017)
  CREATOR_BPS:           8500,    // 85%
  FAN_BPS:               1000,    // 10%
  TREASURY_BPS:          500,     //  5%

  // Billing UX constants
  FLUSH_INTERVAL_SECONDS: 30,
  FREE_PREVIEW_SECONDS:   30,     // set to 0 to disable free preview
} as const;
