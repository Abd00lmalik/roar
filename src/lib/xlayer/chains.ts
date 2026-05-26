/**
 * X Layer chain definitions for viem.
 *
 * Use these in wagmi config and viem public/wallet clients.
 * The old chain.ts re-exports from here for backward compatibility.
 */

import { defineChain } from "viem";

export const xLayerTestnet = defineChain({
  id: 1952,
  name: "X Layer Testnet",
  nativeCurrency: { name: "OKB", symbol: "OKB", decimals: 18 },
  rpcUrls: {
    default: {
      http: [
        process.env.NEXT_PUBLIC_XLAYER_TESTNET_RPC_URL ??
          "https://testrpc.xlayer.tech",
      ],
    },
  },
  blockExplorers: {
    default: {
      name: "OKX Explorer",
      url: "https://www.okx.com/web3/explorer/xlayer-test",
    },
  },
  testnet: true,
});

export const xLayerMainnet = defineChain({
  id: 196,
  name: "X Layer",
  nativeCurrency: { name: "OKB", symbol: "OKB", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.xlayer.tech", "https://xlayerrpc.okx.com"],
    },
  },
  blockExplorers: {
    default: {
      name: "OKX Explorer",
      url: "https://www.okx.com/web3/explorer/xlayer",
    },
  },
});
