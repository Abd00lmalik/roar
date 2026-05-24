import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { WatchClient } from "./WatchClient";

interface PageProps {
  params: Promise<{ videoId: string }>;
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

  return <WatchClient video={video} />;
}
