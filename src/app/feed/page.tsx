import { createClient } from "@/lib/supabase/server";
import { FeedClient } from "./FeedClient";

export default async function FeedPage() {
  const supabase = createClient();

  if (!supabase) {
    return <FeedClient initialVideos={[]} />;
  }

  const { data: videos } = await supabase
    .from("videos")
    .select("*, profiles(*)")
    .order("created_at", { ascending: false });

  return <FeedClient initialVideos={videos ?? []} />;
}
