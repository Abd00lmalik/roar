import { isVideoBurned } from "@/lib/var/burnCheck";
import { createClient } from "@/lib/supabase/server";
import { WatchClient } from "./WatchClient";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ videoId: string }>;
}

function BurnedVideoState({ videoId }: { videoId: string }) {
  return (
    <div className="mx-auto w-full max-w-xl px-4 py-16 text-center">
      <div className="glass-panel space-y-3 p-6">
        <p className="text-2xl font-bold text-red-300">Video Removed by VAR</p>
        <p className="text-sm text-chalk/70">This match clip was burned by governance review.</p>
        <p className="text-xs text-chalk/40">Video ID: {videoId}</p>
      </div>
    </div>
  );
}

export default async function WatchPage({ params }: PageProps) {
  const { videoId } = await params;
  const supabase = createClient();

  if (!supabase) {
    notFound();
  }

  const { data: video, error } = await supabase
    .from("videos")
    .select("*, profiles(*)")
    .eq("id", videoId)
    .single();

  if (error || !video) {
    notFound();
  }

  const burned = await isVideoBurned(videoId);
  if (burned) {
    return <BurnedVideoState videoId={videoId} />;
  }

  return <WatchClient video={video} />;
}
