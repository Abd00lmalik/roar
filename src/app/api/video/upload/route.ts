import { NextResponse } from "next/server";
import { createCloudflareDirectUpload } from "@/lib/video/cloudflare";

export async function POST() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_STREAM_TOKEN ?? process.env.CLOUDFLARE_STREAM_API_TOKEN;

  if (!accountId || !token) {
    return NextResponse.json(
      { error: "Video upload not configured" },
      { status: 503 }
    );
  }

  try {
    const directUpload = await createCloudflareDirectUpload();
    if (directUpload) {
      return NextResponse.json({
        mode: "cloudflare",
        uid: directUpload.uid,
        uploadURL: directUpload.uploadURL,
      });
    }
    return NextResponse.json(
      { error: "Video upload not configured" },
      { status: 503 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Video upload initiation failed" },
      { status: 500 }
    );
  }
}
