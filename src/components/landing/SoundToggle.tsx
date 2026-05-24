"use client";

import { useEffect, useRef, useState } from "react";

export function SoundToggle() {
  const [active, setActive] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggle = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio("/audio/stadium-atmosphere.mp3");
      audioRef.current.loop   = true;
      audioRef.current.volume = 0.25;
    }

    if (active) {
      // Fade out smoothly
      const fade = setInterval(() => {
        if (!audioRef.current) return clearInterval(fade);
        if (audioRef.current.volume > 0.02) {
          audioRef.current.volume -= 0.02;
        } else {
          audioRef.current.pause();
          audioRef.current.volume = 0.25;
          clearInterval(fade);
        }
      }, 50);
    } else {
      audioRef.current.volume = 0;
      audioRef.current.play().catch(() => {});
      // Fade in
      const fade = setInterval(() => {
        if (!audioRef.current) return clearInterval(fade);
        if (audioRef.current.volume < 0.25) {
          audioRef.current.volume = Math.min(audioRef.current.volume + 0.02, 0.25);
        } else {
          clearInterval(fade);
        }
      }, 50);
    }
    setActive(!active);
  };

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  return (
    <button
      onClick={toggle}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] text-white text-xs font-medium hover:bg-white/[0.08] transition-colors"
    >
      <span>{active ? "🔊" : "🔇"}</span>
      <span>{active ? "MUTE STADIUM" : "ENABLE STADIUM SOUND"}</span>
    </button>
  );
}
