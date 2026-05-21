import { platformStatsSeed, seededVideos } from "@/lib/mockData";

export default function AdminPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 px-4 py-6">
      <h1 className="font-display text-4xl font-bold">Roar Admin Panel</h1>
      <section className="glass-panel grid gap-2 p-4 text-sm md:grid-cols-2">
        <p>Total Watch Seconds: {platformStatsSeed.total_watch_seconds.toLocaleString()}</p>
        <p>Billable Seconds: {platformStatsSeed.total_billable_seconds.toLocaleString()}</p>
        <p>Volume USDC: {platformStatsSeed.total_volume_usdc.toFixed(2)}</p>
        <p>Fan Rewards Pool: {platformStatsSeed.fan_rewards_pool_usdc.toFixed(2)} USDC</p>
        <p>Platform Revenue: {platformStatsSeed.platform_revenue_usdc.toFixed(2)} USDC</p>
      </section>
      <section className="glass-panel space-y-2 p-4 text-sm">
        <h2 className="font-semibold">Flagged Content (3)</h2>
        {seededVideos.slice(0, 3).map((video) => (
          <div key={video.id} className="flex flex-wrap items-center justify-between gap-2 rounded bg-white/5 p-2">
            <span>{video.title}</span>
            <div className="flex gap-2 text-xs">
              <button className="rounded bg-white/10 px-2 py-1">Review</button>
              <button className="rounded bg-white/10 px-2 py-1">Hide</button>
              <button className="rounded bg-white/10 px-2 py-1">Remove</button>
              <button className="rounded bg-white/10 px-2 py-1">Dismiss</button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
