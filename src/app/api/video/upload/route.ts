import { NextResponse } from "next/server";
import { createCloudflareDirectUpload } from "@/lib/video/cloudflare";
import { mockCloudflareUpload, MOCK_VIDEO_URL } from "@/lib/video/mock";

export async function POST() {
  try {
    const directUpload = await createCloudflareDirectUpload();
    if (directUpload) {
      return NextResponse.json({
        mode: "cloudflare",
        uid: directUpload.uid,
        uploadURL: directUpload.uploadURL,
      });
    }
  } catch {
    // Fallback handled below.
  }

  const mock = mockCloudflareUpload();
  console.warn("MOCK MODE: Cloudflare not configured");
  return NextResponse.json({
    mode: "mock",
    uid: mock.uid,
    uploadURL: mock.uploadURL,
    video_url: MOCK_VIDEO_URL,
  });
}
