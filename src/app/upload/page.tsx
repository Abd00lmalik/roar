"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { FootballButton } from "@/components/shared/FootballButton";

export default function UploadPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await fetch("/api/video/upload", {
      method: "POST",
      body: new FormData(event.target as HTMLFormElement),
    });
    router.push("/watch/aaaaaaaa-0000-0000-0000-000000000001");
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6">
      <h1 className="mb-4 font-display text-4xl font-bold">📹 Enter the Pitch</h1>
      <form className="glass-panel space-y-3 p-4" onSubmit={onSubmit}>
        <input name="file" type="file" accept="video/*" className="w-full text-sm" />
        <input
          name="title"
          className="w-full rounded bg-black/40 p-2"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea name="description" className="w-full rounded bg-black/40 p-2" placeholder="Description" />
        <select name="category" className="w-full rounded bg-black/40 p-2">
          <option>Match Previews</option>
          <option>Fan Reactions</option>
          <option>Tactical Breakdowns</option>
        </select>
        <p className="text-sm text-chalk/70">
          Universal price: 0.001 USDC/sec · Your earnings: 85% of every paid second watched
        </p>
        <p className="text-xs text-amber-200">
          ⚠️ Only upload content you own or have permission to share.
        </p>
        <FootballButton type="submit">Enter the Pitch ⚽</FootballButton>
      </form>
    </div>
  );
}
