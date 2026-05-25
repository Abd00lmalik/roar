import { StadiumPlayer } from "@/components/player/StadiumPlayer";

export default function StadiumPage() {
  const videoUrl = process.env.NEXT_PUBLIC_STADIUM_VIDEO_URL ?? "/videos/stadium-bg.mp4";
  const creatorWalletAddress = process.env.CREATOR_WALLET_ADDRESS ?? "0x0000000000000000000000000000000000000001";

  return <StadiumPlayer videoUrl={videoUrl} creatorWalletAddress={creatorWalletAddress} />;
}
