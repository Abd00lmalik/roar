export const erc20Abi = [
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "allowance",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

export const roarBadgesAbi = [
  {
    name: "mintBadge",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "recipient", type: "address" },
      { name: "badgeId", type: "uint256" },
      { name: "badgeName", type: "string" },
    ],
    outputs: [],
  },
] as const;

export const FAN_PASSPORT_ABI = [
  {
    name: "mintPassport",
    type: "function",
    stateMutability: "payable",
    inputs: [{ name: "countryCode", type: "string" }],
    outputs: [],
  },
  {
    name: "getStakedCountry",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "holder", type: "address" }],
    outputs: [{ name: "", type: "string" }],
  },
  {
    name: "holderToTokenId",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "holder", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

export const VAR_SYSTEM_ABI = [
  {
    name: "isVideoBurned",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "videoId", type: "string" }],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;
