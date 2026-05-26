import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { WatchClient } from "./WatchClient";
import { seededVideos } from "@/lib/mockData";

interface PageProps {
  params: Promise<{ videoId: string }>;
}

export default async function WatchPage({ params }: PageProps) {
  const { videoId } = await params;

  // Resolve mock video if ID matches
  const mockVideo = seededVideos.find((v) => v.id === videoId);
  if (mockVideo) {
    return <WatchClient video={mockVideo} />;
  }

  const supabase = createClient();

  if (!supabase) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] text-white px-4">
        <div className="text-center p-8 glass-panel max-w-md mx-auto space-y-4">
          <div className="text-5xl">🔍</div>
          <h1 className="text-3xl font-bold font-display">Video Not Found</h1>
          <p className="text-white/60 text-sm leading-relaxed">
            This match replay or highlight video could not be located on the X Layer stadium node.
          </p>
          <a
            href="/stadium"
            className="inline-block mt-4 px-6 py-3 bg-[var(--country-accent,#FFCC00)] text-black rounded-xl font-bold text-sm hover:scale-105 transition-all shadow-md active:scale-95 cursor-pointer"
          >
            Back to Stadium Feed
          </a>
        </div>
      </div>
    );
  }

  const { data: video, error } = await supabase
    .from("videos")
    .select("*, profiles(*)")
    .eq("id", videoId)
    .single();

  if (error || !video) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] text-white px-4">
        <div className="text-center p-8 glass-panel max-w-md mx-auto space-y-4">
          <div className="text-5xl">🔍</div>
          <h1 className="text-3xl font-bold font-display">Video Not Found</h1>
          <p className="text-white/60 text-sm leading-relaxed">
            This match replay or highlight video could not be located on the X Layer stadium node.
          </p>
          <a
            href="/stadium"
            className="inline-block mt-4 px-6 py-3 bg-[var(--country-accent,#FFCC00)] text-black rounded-xl font-bold text-sm hover:scale-105 transition-all shadow-md active:scale-95 cursor-pointer"
          >
            Back to Stadium Feed
          </a>
        </div>
      </div>
    );
  }

  return <WatchClient video={video} />;
}
