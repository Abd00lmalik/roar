"use client";

import { useMemo, useState } from "react";
import { seededVideos } from "@/lib/mockData";
import { CrowdRoarBanner } from "@/components/feed/CrowdRoarBanner";
import { FeedFilters } from "@/components/feed/FeedFilters";
import { CategoryTabs } from "@/components/feed/CategoryTabs";
import { VideoCard } from "@/components/feed/VideoCard";
import { SidebarNav } from "@/components/layout/SidebarNav";
import { GlassPanel } from "@/components/shared/GlassPanel";

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

export default function FeedPage() {
  const [category, setCategory] = useState("All");
  const [country, setCountry] = useState("All");

  const videos = useMemo(
    () =>
      seededVideos.filter((v) => {
        const categoryPass = category === "All" || v.category === category;
        const countryPass = country === "All" || v.country_tags.includes(country as never);
        return categoryPass && countryPass;
      }),
    [category, country],
  );

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-6 lg:grid-cols-[220px_1fr_280px]">
      <div className="space-y-3">
        <SidebarNav />
        <FeedFilters category={category} setCategory={setCategory} country={country} setCountry={setCountry} />
      </div>
      <section className="space-y-4">
        <CrowdRoarBanner />
        <CategoryTabs category={category} setCategory={setCategory} />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      </section>
      <aside className="space-y-3">
        <GlassPanel className="p-3 text-sm">
          <p className="font-semibold">Trending</p>
          <p className="mt-2 text-xs text-chalk/70">@NaijaStand is live in Crowd Roar.</p>
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
