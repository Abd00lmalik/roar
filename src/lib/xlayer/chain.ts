import { defineChain } from "viem";

export const xLayerTestnet = defineChain({
  id: Number(process.env.NEXT_PUBLIC_XLAYER_CHAIN_ID ?? 1952),
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
      name: "OKLink",
      url:
        process.env.NEXT_PUBLIC_XLAYER_EXPLORER_URL ??
        "https://www.oklink.com/xlayer-test",
    },
  },
  testnet: true,
});
