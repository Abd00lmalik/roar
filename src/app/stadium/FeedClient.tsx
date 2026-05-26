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

interface FeedClientProps {
  initialVideos: any[];
}

export function FeedClient({ initialVideos }: FeedClientProps) {
  const router = useRouter();
  const [category, setCategory] = useState("All");
  const [country, setCountry] = useState("All");

  const filteredVideos = useMemo(() => {
    return initialVideos.filter((v) => {
      const categoryPass = category === "All" || v.category === category;
      const countryPass = country === "All" || (v.country_tags && v.country_tags.includes(country));
      return categoryPass && countryPass;
    });
  }, [initialVideos, category, country]);

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-6 lg:grid-cols-[220px_1fr_280px]">
      <div className="space-y-3">
        <SidebarNav />
        <FeedFilters category={category} setCategory={setCategory} country={country} setCountry={setCountry} />
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
            {filteredVideos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        )}
      </section>
      <aside className="space-y-3">
        <GlassPanel className="p-3 text-sm">
          <p className="font-semibold">Trending</p>
          <p className="mt-2 text-xs text-chalk/70">@GhanaStand is live in RoarTube.</p>
        </GlassPanel>
        <AIPlaceholder
          icon="🤖"
          title="AI Matchday Assistant"
          description="Get instant tactical breakdowns, player stats, and match previews. Powered by AI."
          badge="Coming Soon"
        />
        <AIPlaceholder
          icon="⏱"
          title="AI Timestamp Generator"
          description="Automatically tag your video with key moments. Coming to all uploads."
          badge="Coming Soon"
        />
        <AIPlaceholder
          icon="📝"
          title="AI Caption Generator"
          description="Auto-generate captions and descriptions for your football content."
          badge="Coming Soon"
        />
        <AIPlaceholder
          icon="🌍"
          title="AI Country Feed"
          description="Personalized feed powered by your fan profile and watch history."
          badge="Coming Soon"
        />
      </aside>
    </div>
  );
}
