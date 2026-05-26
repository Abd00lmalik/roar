import Link from "next/link";
import type { Video } from "@/types";
import { formatSeconds } from "@/lib/utils";

export function VideoCard({ video }: { video: Video }) {
  const isPaid = video.is_paid !== false;

  return (
    <Link href={`/watch/${video.id}`} className="block">
      <div className="glass-card overflow-hidden group cursor-pointer hover:border-white/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden">
          <img
            src={video.thumbnail_url || "https://picsum.photos/seed/default/640/360"}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Duration badge */}
          <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-mono px-2 py-0.5 rounded-md">
            {formatSeconds(video.duration_seconds)}
          </span>

          {/* Paid badge */}
          {isPaid && (
            <span className="absolute top-2 left-2 bg-yellow-500/90 text-black text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md uppercase tracking-wider">
              PAID
            </span>
          )}

          {/* Play overlay on hover */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 hover:scale-110 transition-transform">
              <span className="text-2xl text-white ml-1">▶</span>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="p-4 space-y-2">
          <h3 className="font-semibold text-white line-clamp-2 mb-1 group-hover:text-[var(--country-accent,#FFCC00)] transition-colors leading-tight text-sm">
            {video.title}
          </h3>
          <p className="text-white/50 text-xs line-clamp-2 leading-relaxed">
            {video.description || "No description provided."}
          </p>
          <div className="flex items-center gap-1.5 mt-3 flex-wrap">
            {video.country_tags &&
              video.country_tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-semibold bg-white/5 border border-white/15 text-white/60 px-2 py-0.5 rounded-full uppercase tracking-wider"
                >
                  #{tag}
                </span>
              ))}
            <span className="text-[10px] font-semibold bg-white/5 border border-white/10 text-white/40 px-2 py-0.5 rounded-full ml-auto uppercase">
              {video.category}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
