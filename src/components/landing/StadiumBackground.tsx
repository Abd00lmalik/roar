"use client";

// TODO: Drop a royalty-free football stadium MP4 into public/videos/stadium-bg.mp4
// Sources: pexels.com/search/videos/football+stadium - download manually in browser
// Compress: ffmpeg -i input.mp4 -vcodec libx264 -crf 28 -vf "scale=1280:720" -an public/videos/stadium-bg.mp4

export function StadiumBackground() {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      {/* Real video - hidden until correct file is dropped in */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src="/videos/stadium-bg.mp4"
        autoPlay
        muted
        loop
        playsInline
        poster="/images/stadium-poster.jpg"
        onError={(e) => {
          (e.target as HTMLVideoElement).style.display = "none";
        }}
      />

      {/* Premium CSS stadium atmosphere - always visible as base layer */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 40% at 50% 0%,
              rgba(255, 220, 0, 0.12) 0%,
              transparent 60%
            ),
            radial-gradient(ellipse 60% 50% at 20% 60%,
              rgba(255, 200, 0, 0.06) 0%,
              transparent 50%
            ),
            radial-gradient(ellipse 60% 50% at 80% 60%,
              rgba(255, 200, 0, 0.06) 0%,
              transparent 50%
            ),
            linear-gradient(180deg,
              #060810 0%,
              #0a0d1a 40%,
              #06080f 100%
            )
          `,
        }}
      />

      {/* Pitch grid lines - subtle green undertone suggesting the field */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(100,200,80,0.8) 1px, transparent 1px),
            linear-gradient(90deg, rgba(100,200,80,0.8) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      />

      {/* Floodlight cone - top center */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            conic-gradient(
              from 260deg at 50% -10%,
              transparent 0deg,
              rgba(255,240,180,0.04) 20deg,
              rgba(255,240,180,0.08) 40deg,
              rgba(255,240,180,0.04) 60deg,
              transparent 80deg
            )
          `,
        }}
      />

      {/* Dark vignette overlay - keeps text readable */}
      <div className="absolute inset-0 bg-black/55" />
    </div>
  );
}
