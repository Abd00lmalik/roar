"use client";

import { useEffect, useRef, useState } from "react";
import { FootballButton } from "@/components/shared/FootballButton";

export function SoundToggle() {
  const [enabled, setEnabled] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio("/landing-sound.mp3");
    audioRef.current.loop = true;
    const pref = localStorage.getItem("roar-sound-enabled");
    if (pref === "true") {
      void audioRef.current.play().then(() => setEnabled(true)).catch(() => undefined);
    }
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  const onToggle = async () => {
    if (!audioRef.current) return;
    if (enabled) {
      audioRef.current.pause();
      setEnabled(false);
      localStorage.setItem("roar-sound-enabled", "false");
      return;
    }
    await audioRef.current.play();
    setEnabled(true);
    localStorage.setItem("roar-sound-enabled", "true");
  };

  return (
    <div className="fixed bottom-6 right-6 z-30">
      <FootballButton variant="secondary" onClick={onToggle}>
        {enabled ? "🔊 Stadium Sound On" : "🔇 Enable Stadium Sound"}
      </FootballButton>
    </div>
  );
}
