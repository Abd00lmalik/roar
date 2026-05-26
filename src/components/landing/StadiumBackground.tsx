"use client";

import { useRef, useState } from "react";

// Video URL: set NEXT_PUBLIC_STADIUM_VIDEO_URL in Vercel env vars to override the
// local /videos/stadium-bg.mp4 file (useful for CDN-hosted videos).
const VIDEO_SRC =
  process.env.NEXT_PUBLIC_STADIUM_VIDEO_URL ?? "/videos/stadium-bg.mp4";

export function StadiumBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setMuted(videoRef.current.muted);
  };

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      {/* === CSS fallback — always rendered behind video === */}
      {/* Visible even when video hasn't loaded yet or fails to play */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 50% -10%, rgba(245,200,66,0.25) 0%, transparent 55%),
            radial-gradient(ellipse at 20% 60%, rgba(234,69,96,0.12)  0%, transparent 45%),
            radial-gradient(ellipse at 80% 60%, rgba(234,69,96,0.10)  0%, transparent 45%),
            linear-gradient(180deg, #0a0e1a 0%, #0d1420 50%, #050810 100%)
          `,
        }}
      />

      {/* Floodlight sweep lines */}
      <div
        className="absolute inset-0"
        style={{
          opacity: 0.18,
          backgroundImage: `
            repeating-linear-gradient(
              -48deg,
              transparent,
              transparent 80px,
              rgba(245,200,66,0.04) 80px,
              rgba(245,200,66,0.04) 81px
            )
          `,
        }}
      />

      {/* Pitch green tint at the bottom */}
      <div
        className="absolute inset-x-0 bottom-0 h-1/3"
        style={{
          background: `linear-gradient(to top, rgba(10,40,15,0.45) 0%, transparent 100%)`,
        }}
      />

      {/* === Video layer — rendered above the CSS fallback === */}
      {/* If the video plays, it covers the CSS background. */}
      {/* poster keeps something visible during video load. */}
      <video
        ref={videoRef}
        key={VIDEO_SRC}
        className="absolute inset-0 w-full h-full object-cover"
        src={VIDEO_SRC}
        autoPlay
        muted
        loop
        playsInline
        poster="/images/stadium-poster.jpg"
      />

      {/* Dark overlay for text legibility */}
      <div className="absolute inset-0 bg-black/45" />

      {/* Mute/unmute toggle — bottom right corner */}
      <button
        onClick={toggleMute}
        className="absolute bottom-6 right-6 z-50 bg-black/50 backdrop-blur-sm border border-white/20 rounded-full p-3 text-white hover:bg-black/70 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center w-12 h-12 text-lg shadow-lg"
        aria-label={muted ? "Unmute Stadium Video" : "Mute Stadium Video"}
      >
        {muted ? "🔇" : "🔊"}
      </button>
    </div>
  );
}

