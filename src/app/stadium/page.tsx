import { createClient } from "@/lib/supabase/server";
import { FeedClient } from "./FeedClient";
import { seededVideos } from "@/lib/mockData";

export default async function FeedPage() {
  const supabase = createClient();

  if (!supabase) {
    return <FeedClient initialVideos={seededVideos} />;
  }

  const { data: videos } = await supabase
    .from("videos")
    .select("*, profiles(*)")
    .order("created_at", { ascending: false });

  const displayVideos = videos && videos.length > 0 ? videos : seededVideos;

  return <FeedClient initialVideos={displayVideos} />;
}
