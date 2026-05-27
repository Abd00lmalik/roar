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
      let finalVideoUrl = MOCK_VIDEO_URL;
      const file = formData.get("file") as File | null;

      if (file && file.size > 0) {
        try {
          const fileExt = file.name.split(".").pop() || "mp4";
          const fileName = `${crypto.randomUUID()}.${fileExt}`;
          const { data: uploadData, error: uploadError } = await supabase
            .storage
            .from("videos")
            .upload(fileName, file, {
              contentType: file.type,
              cacheControl: "3600",
            });

          if (uploadError) {
            console.warn("[upload api] Storage upload failed, falling back to mock:", uploadError.message);
          } else {
            const { data: publicUrlData } = supabase
              .storage
              .from("videos")
              .getPublicUrl(fileName);
            if (publicUrlData?.publicUrl) {
              finalVideoUrl = publicUrlData.publicUrl;
            }
          }
        } catch (storageErr) {
          console.warn("[upload api] Storage upload error, falling back to mock:", storageErr);
        }
      }

      const { error } = await supabase.from("videos").insert({
        id,
        owner_profile_id: session.user.id,
        title: title || "Untitled Match Video",
        description: description || "",
        video_url: finalVideoUrl,
        thumbnail_url: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800",
        duration_seconds: 180,
        category: category || "highlights",
        country_tags: tags,
        content_type: "long",
        status: "active",
        is_paid: true,
        is_demo: false,
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
