/**
 * ABIs for ROAR X Layer contracts.
 *
 * Only the function/event signatures needed by the frontend and backend are
 * included here. Full ABIs are available in contracts/artifacts/.
 */

// ── FanPassport ───────────────────────────────────────────────────────────────
export const FAN_PASSPORT_ABI = [
  {
    name: "mint",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "user",         type: "address" },
      { name: "countryCode",  type: "string" },
      { name: "confederation", type: "string" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "updateWatchTime",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "tokenId",          type: "uint256" },
      { name: "additionalSeconds", type: "uint256" },
    ],
    outputs: [],
  },
  {
    name: "getPassport",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [
      {
        name: "passport",
        type: "tuple",
        components: [
          { name: "countryCode",     type: "string" },
          { name: "confederation",   type: "string" },
          { name: "watchTimeSeconds", type: "uint256" },
          { name: "mintedAt",        type: "uint256" },
        ],
      },
      { name: "tokenId", type: "uint256" },
    ],
  },
  {
    name: "hasPassport",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "addressToTokenId",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "PassportMinted",
    type: "event",
    inputs: [
      { name: "user",        type: "address", indexed: true },
      { name: "tokenId",     type: "uint256", indexed: false },
      { name: "countryCode", type: "string",  indexed: false },
    ],
  },
  {
    name: "WatchTimeUpdated",
    type: "event",
    inputs: [
      { name: "tokenId",  type: "uint256", indexed: true },
      { name: "newTotal", type: "uint256", indexed: false },
    ],
  },
] as const;

// ── WatchLeaderboard ──────────────────────────────────────────────────────────
export const WATCH_LEADERBOARD_ABI = [
  {
    name: "submitWeeklyBoard",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "weekId",       type: "uint256" },
      { name: "countryCode",  type: "string" },
      { name: "wallets",      type: "address[]" },
      { name: "watchSeconds", type: "uint256[]" },
    ],
    outputs: [],
  },
  {
    name: "advanceWeek",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  {
    name: "getBoard",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "weekId",      type: "uint256" },
      { name: "countryCode", type: "string" },
    ],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        components: [
          { name: "wallet",       type: "address" },
          { name: "watchSeconds", type: "uint256" },
          { name: "countryCode",  type: "string" },
        ],
      },
    ],
  },
  {
    name: "getCurrentBoard",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "countryCode", type: "string" }],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        components: [
          { name: "wallet",       type: "address" },
          { name: "watchSeconds", type: "uint256" },
          { name: "countryCode",  type: "string" },
        ],
      },
    ],
  },
  {
    name: "currentWeekId",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "settled",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "", type: "uint256" },
      { name: "", type: "string" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "LeaderboardSubmitted",
    type: "event",
    inputs: [
      { name: "weekId",      type: "uint256", indexed: true },
      { name: "countryCode", type: "string",  indexed: false },
      { name: "fanCount",    type: "uint256", indexed: false },
    ],
  },
] as const;

// ── FanRewardsPool ────────────────────────────────────────────────────────────
export const FAN_REWARDS_POOL_ABI = [
  {
    name: "deposit",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "amount", type: "uint256" }],
    outputs: [],
  },
  {
    name: "distribute",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "weekId",          type: "uint256" },
      { name: "countryCode",     type: "string" },
      { name: "allocationUSDC",  type: "uint256" },
    ],
    outputs: [],
  },
  {
    name: "poolBalance",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "Distributed",
    type: "event",
    inputs: [
      { name: "weekId",      type: "uint256", indexed: true },
      { name: "countryCode", type: "string",  indexed: false },
      { name: "totalPaid",   type: "uint256", indexed: false },
    ],
  },
] as const;

// ── BillingController ─────────────────────────────────────────────────────────
export const BILLING_CONTROLLER_ABI = [
  {
    name: "lockBilling",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "matchId", type: "bytes32" },
      { name: "reason",  type: "string" },
    ],
    outputs: [],
  },
  {
    name: "unlockBilling",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "matchId", type: "bytes32" }],
    outputs: [],
  },
  {
    name: "isLocked",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "matchId", type: "bytes32" }],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "encodeMatchId",
    type: "function",
    stateMutability: "pure",
    inputs: [{ name: "matchSlug", type: "string" }],
    outputs: [{ name: "", type: "bytes32" }],
  },
  {
    name: "BillingLocked",
    type: "event",
    inputs: [
      { name: "matchId", type: "bytes32", indexed: true },
      { name: "reason",  type: "string",  indexed: false },
    ],
  },
  {
    name: "BillingUnlocked",
    type: "event",
    inputs: [
      { name: "matchId", type: "bytes32", indexed: true },
    ],
  },
] as const;
