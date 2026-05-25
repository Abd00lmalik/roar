"use client";

import { useEffect, useState } from "react";

export function SoundToggle() {
  const [active, setActive] = useState(false);

  const toggle = async () => {
    const video = document.getElementById("stadium-bg-video") as HTMLVideoElement | null;
    if (!video) return;

    if (active) {
      video.muted = true;
      video.volume = 0;
      setActive(false);
      return;
    }

    video.muted = false;
    video.volume = 1;
    try {
      await video.play();
      setActive(true);
    } catch {
      video.muted = true;
      setActive(false);
    }
  };

  useEffect(() => {
    const video = document.getElementById("stadium-bg-video") as HTMLVideoElement | null;
    if (video) {
      video.muted = true;
      video.volume = 0;
    }
  }, []);

  return (
    <button
      onClick={() => {
        void toggle();
      }}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-xs font-medium text-white backdrop-blur-xl transition-colors hover:bg-white/[0.08]"
    >
      <span>{active ? "🔊" : "🔇"}</span>
      <span>{active ? "MUTE VIDEO" : "ENABLE VIDEO SOUND"}</span>
    </button>
  );
}
