import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { MOCK_VIDEO_URL } from "@/lib/video/mock";

export async function POST(req: NextRequest) {
  try {
    // 1. Auth check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse form data
    const formData = await req.formData();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const tagsInput = formData.get("tags") as string;
    const associatedCountry = formData.get("associatedCountry") as string;

    const id = crypto.randomUUID();
    const tags = tagsInput
      ? tagsInput.split(",").map((t) => t.trim().toUpperCase()).filter(Boolean)
      : [];

    if (associatedCountry && !tags.includes(associatedCountry.toUpperCase())) {
      tags.push(associatedCountry.toUpperCase());
    }

    // 3. Save to database
    const supabase = createSupabaseServerClient();
    if (supabase) {
      const { error } = await supabase.from("videos").insert({
        id,
        owner_profile_id: session.user.id,
        title: title || "Untitled Match Video",
        description: description || "",
        video_url: MOCK_VIDEO_URL,
        thumbnail_url: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800",
        duration_seconds: 180,
        category: category || "highlights",
        country_tags: tags,
        content_type: "long",
        status: "active",
        is_paid: true,
      });

      if (error) {
        console.error("[upload api] database insert failed:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    } else {
      console.warn("[upload api] database not configured, returning mock success");
    }

    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    console.error("[upload api] error:", err);
    return NextResponse.json({ error: err.message || "Upload failed" }, { status: 500 });
  }
}
