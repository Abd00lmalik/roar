"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FootballButton } from "@/components/shared/FootballButton";

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Match Previews");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !file) return;
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("category", category);

    try {
      await fetch("/api/video/upload", {
        method: "POST",
        body: formData,
      });
      router.push("/watch/aaaaaaaa-0000-0000-0000-000000000001");
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6">
      <h1 className="mb-4 font-display text-4xl font-bold">📹 Enter the Pitch</h1>
      <div className="glass-panel space-y-3 p-4">
        <input
          name="file"
          type="file"
          accept="video/*"
          className="w-full text-sm"
          onChange={(e) => {
            const files = e.target.files;
            if (files && files.length > 0) {
              setFile(files[0]);
            }
          }}
        />
        <input
          name="title"
          className="w-full rounded bg-black/40 p-2"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          name="description"
          className="w-full rounded bg-black/40 p-2"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <select
          name="category"
          className="w-full rounded bg-black/40 p-2 text-white bg-slate-900"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
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
        <FootballButton disabled={loading || !file || !title.trim()} onClick={handleSubmit}>
          {loading ? "Entering..." : "Enter the Pitch ⚽"}
        </FootballButton>
      </div>
    </div>
  );
}
