import { createPublicClient, http } from "viem";
import { xLayerTestnet } from "@/lib/xlayer/chain";
import { VAR_SYSTEM_ABI } from "@/lib/contracts/abis";

const publicClient = createPublicClient({
  chain: xLayerTestnet,
  transport: http(),
});

export async function isVideoBurned(videoId: string): Promise<boolean> {
  try {
    return (await publicClient.readContract({
      address: process.env.NEXT_PUBLIC_VAR_SYSTEM_ADDRESS as `0x${string}`,
      abi: VAR_SYSTEM_ABI,
      functionName: "isVideoBurned",
      args: [videoId],
    })) as boolean;
  } catch {
    return false;
  }
}
