import { createPublicClient, http } from "viem";
import { xLayerTestnet } from "@/lib/xlayer/chain";

export const xLayerPublicClient = createPublicClient({
  chain: xLayerTestnet,
  transport: http(),
});
