"use client";

import { useMemo, useState } from "react";
import { CrowdRoarBanner } from "@/components/feed/CrowdRoarBanner";
import { FeedFilters } from "@/components/feed/FeedFilters";
import { CategoryTabs } from "@/components/feed/CategoryTabs";
import { VideoCard } from "@/components/feed/VideoCard";
import { SidebarNav } from "@/components/layout/SidebarNav";
import { GlassPanel } from "@/components/shared/GlassPanel";
import { EmptyState } from "@/components/ui/EmptyState";
import { useRouter } from "next/navigation";

function AIPlaceholder({
  icon,
  title,
  description,
  badge,
}: {
  icon: string;
  title: string;
  description: string;
  badge: string;
}) {
  return (
    <div className="glass-panel space-y-1 p-3 text-sm">
      <p>{icon} {title}</p>
      <p className="text-xs text-chalk/70">{description}</p>
      <span className="inline-block rounded bg-amber-500/20 px-2 py-0.5 text-xs text-amber-300">{badge}</span>
    </div>
  );
}

const CATEGORY_MAP: Record<string, string> = {
  "All": "All",
  "Highlights": "highlights",
  "Match Previews": "preview",
  "Fan Reactions": "reaction",
  "Tactical Breakdowns": "tactical",
  "Fan Culture": "culture",
  "Documentaries": "documentary"
};

interface FeedClientProps {
  initialVideos: any[];
}

export function FeedClient({ initialVideos }: FeedClientProps) {
  const router = useRouter();
  const [category, setCategory] = useState("All");
  const [country, setCountry] = useState("All");

  const filteredVideos = useMemo(() => {
    return initialVideos.filter((v) => {
      const dbCat = CATEGORY_MAP[category] || category;
      const categoryPass = category === "All" || v.category === dbCat;
      const countryPass =
        country === "All" ||
        (v.country_tags && v.country_tags.includes(country)) ||
        v.associated_country === country ||
        v.owner_country_code === country;
      return categoryPass && countryPass;
    });
  }, [initialVideos, category, country]);

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[240px_1fr]">
      <div className="space-y-4">
        <FeedFilters country={country} setCountry={setCountry} />
        
        {/* Compact Trending & AI Labs Panel */}
        <div className="glass-panel p-4 space-y-4 hidden lg:block bg-stadium/10">
          <div>
            <h4 className="font-semibold text-xs text-white uppercase tracking-wider mb-2 flex items-center gap-1.5 select-none">
              <span>🔥</span> Trending
            </h4>
            <p className="text-xs text-chalk/70 leading-relaxed">
              <span className="text-[var(--country-accent,#FFCC00)] font-medium">@GhanaStand</span> is live inside the stadium.
            </p>
          </div>
          
          <div className="border-t border-white/5 pt-4 space-y-3">
            <h4 className="font-semibold text-xs text-white uppercase tracking-wider flex items-center gap-1.5 select-none">
              <span>🧪</span> Stadium AI Labs
            </h4>
            <div className="space-y-2 text-xs">
              <div className="p-2 rounded bg-black/25 border border-white/5">
                <p className="font-medium text-white/90">🤖 Matchday Assistant</p>
                <p className="text-white/40 text-[10px] mt-0.5">Tactics & player stats.</p>
              </div>
              <div className="p-2 rounded bg-black/25 border border-white/5">
                <p className="font-medium text-white/90">⏱️ Auto Highlights</p>
                <p className="text-white/40 text-[10px] mt-0.5">Auto-generated timestamps.</p>
              </div>
            </div>
            <span className="inline-block rounded bg-amber-500/10 border border-amber-500/25 px-2.5 py-1 text-[10px] text-amber-300 font-semibold uppercase tracking-wider">
              Labs Coming Soon
            </span>
          </div>
        </div>
      </div>

      <section className="space-y-4">
        <CrowdRoarBanner />
        <CategoryTabs category={category} setCategory={setCategory} />

        {filteredVideos.length === 0 ? (
          <EmptyState
            icon="🏟️"
            heading="The pitch is empty"
            body="No matches are live yet. Be the first to enter the pitch."
            action={{
              label: "Enter the Pitch ⚽",
              onClick: () => router.push("/upload"),
            }}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredVideos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
