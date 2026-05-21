import Link from "next/link";
import Image from "next/image";
import type { Video } from "@/types";
import { formatSeconds } from "@/lib/utils";

export function VideoCard({ video }: { video: Video }) {
  return (
    <article className="glass-panel overflow-hidden">
      <div className="relative aspect-video">
        <Image
          src={video.thumbnail_url || "https://picsum.photos/640/360"}
          alt={video.title}
          fill
          className="object-cover"
        />
        <Link
          href={`/watch/${video.id}`}
          className="absolute bottom-3 left-3 rounded bg-black/70 px-3 py-1 text-xs"
        >
          ▶ Start Match
        </Link>
      </div>
      <div className="space-y-2 p-3 text-sm">
        <div className="text-xs text-chalk/70">
          {video.owner_country_code} {video.category}
        </div>
        <h3 className="font-semibold">{video.title}</h3>
        <p className="text-xs text-chalk/70">
          @{video.owner_handle} · {formatSeconds(video.duration_seconds)}
        </p>
        <div className="text-xs text-chalk/80">🏆 Lift the Cup 12.4K</div>
        <div className="text-xs text-chalk/80">💰 0.001 USDC/sec</div>
        <div className="text-xs text-chalk/80">
          ⏱ {video.total_billable_seconds.toLocaleString()} paid seconds
        </div>
      </div>
    </article>
  );
}
