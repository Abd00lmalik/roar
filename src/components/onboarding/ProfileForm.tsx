"use client";

import { useMemo, useState } from "react";
import { FootballButton } from "@/components/shared/FootballButton";
import type { CountryCode } from "@/types";

type Props = {
  countryCode: CountryCode | null;
  onSubmit: (payload: { displayName: string; handle: string; bio: string }) => void;
};

export function ProfileForm({ countryCode, onSubmit }: Props) {
  const [displayName, setDisplayName] = useState("");
  const [handle, setHandle] = useState("");
  const [bio, setBio] = useState("");

  const autoHandle = useMemo(
    () => displayName.replace(/\s+/g, "").slice(0, 20),
    [displayName],
  );

  const handleSave = () => {
    if (!countryCode || !displayName) return;
    onSubmit({ displayName, handle: handle || autoHandle, bio });
  };

  return (
    <div className="glass-panel space-y-3 p-4">
      <p className="text-xs text-amber-200">
        ⚠️ Your country is locked for this tournament season. Choose wisely.
      </p>
      <input
        className="w-full rounded bg-black/40 p-2"
        placeholder="Display Name"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        required
      />
      <input
        className="w-full rounded bg-black/40 p-2"
        placeholder={`@${autoHandle || "handle"}`}
        value={handle}
        onChange={(e) => setHandle(e.target.value)}
      />
      <textarea
        className="w-full rounded bg-black/40 p-2"
        placeholder="Short Bio"
        rows={3}
        value={bio}
        onChange={(e) => setBio(e.target.value)}
      />
      <FootballButton disabled={!countryCode || !displayName} onClick={handleSave}>
        Enter the Stadium
      </FootballButton>
    </div>
  );
}
