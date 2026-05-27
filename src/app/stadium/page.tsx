import { createClient } from "@/lib/supabase/server";
import { FeedClient } from "./FeedClient";

export default async function FeedPage() {
  const supabase = createClient();

  let videos: any[] = [];

  if (supabase) {
    const { data } = await supabase
      .from("videos")
      .select("*, profiles(*)")
      .eq("is_demo", false)          // ← never show demo / seed rows
      .order("created_at", { ascending: false });

    videos = data ?? [];
  }

  return <FeedClient initialVideos={videos} />;
}
