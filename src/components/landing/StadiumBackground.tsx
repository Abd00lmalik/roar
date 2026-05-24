"use client";

// TODO: Replace public/videos/stadium-bg.mp4 with real football footage

export function StadiumBackground() {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      {/* Attempt video — if file is wrong/missing, CSS fallback shows underneath */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src="/videos/stadium-bg.mp4"
        autoPlay
        muted
        loop
        playsInline
        poster="/images/stadium-poster.jpg"
        onError={(e) => {
          // Hide broken video, let CSS gradient show
          (e.target as HTMLVideoElement).style.display = "none";
        }}
      />

      {/* CSS Dark Stadium fallback — always visible behind video */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 20% 50%, rgba(255,200,0,0.08) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 50%, rgba(255,200,0,0.06) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 0%,  rgba(255,255,255,0.05) 0%, transparent 40%),
            linear-gradient(180deg, #0a0a0f 0%, #0d1117 50%, #0a0a0f 100%)
          `
        }}
      />

      {/* Floodlight sweep lines — stadium atmosphere */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              -45deg,
              transparent,
              transparent 80px,
              rgba(255,255,255,0.01) 80px,
              rgba(255,255,255,0.01) 81px
            )
          `
        }}
      />

      {/* Dark overlay for text legibility */}
      <div className="absolute inset-0 bg-black/50" />
    </div>
  );
}
