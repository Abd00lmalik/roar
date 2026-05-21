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
] as const;

export const roarVaultAbi = [
  {
    name: "deposit",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "amount", type: "uint256" }],
    outputs: [],
  },
  {
    name: "withdrawCreatorEarnings",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  {
    name: "withdrawUnusedBalance",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  {
    name: "settleSession",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "viewer", type: "address" },
      { name: "creator", type: "address" },
      { name: "videoHash", type: "bytes32" },
      { name: "billableSeconds", type: "uint256" },
    ],
    outputs: [],
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
