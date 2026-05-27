import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

// Load environment variables from local .env files if present (fallback)
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

const sanitize = (str: string | undefined) => {
  if (!str) return "";
  return str.replace(/^['"]|['"]$/g, "").trim();
};

const cleanUrl = sanitize(SUPABASE_URL);
const cleanKey = sanitize(SUPABASE_KEY);

if (!cleanUrl || !cleanKey || cleanUrl.includes("yoursupabaseproject")) {
  console.error("❌ Error: Real Supabase credentials not found.");
  console.error("   Please run the script passing your production credentials as environment variables:");
  console.error("   SUPABASE_URL=https://YOUR_PROJECT.supabase.co SUPABASE_KEY=eyJ... npx tsx scripts/insert-test-videos.ts");
  process.exit(1);
}

const supabase = createClient(cleanUrl, cleanKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const TEST_VIDEOS = [
  {
    id: "prod-test-video-001",
    owner_profile_id: "11111111-0000-0000-0000-000000000001", // Tactical Ghost
    title: "UEFA Qualifier Highlights — Germany vs Spain",
    description: "Best goals and moments from the 2026 World Cup European qualifiers. Short clip — ideal for testing the 2-minute free preview and billing gate.",
    video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    thumbnail_url: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=640&q=80",
    category: "highlights",
    country_tags: ["DE", "UEFA", "GERMANY", "SPAIN"],
    duration_seconds: 160,
    content_type: "long",
    status: "active",
    is_demo: true,
    is_paid: true,
  },
  {
    id: "prod-test-video-002",
    owner_profile_id: "11111111-0000-0000-0000-000000000002", // Pitch Lens
    title: "Brazil Road to 2026 — CONMEBOL Campaign",
    description: "Brazil's full qualification journey through South America. Medium length — tests a full billing session and first voucher flush.",
    video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    thumbnail_url: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=640&q=80",
    category: "documentary",
    country_tags: ["BR", "CONMEBOL", "BRAZIL", "QUALIFICATION"],
    duration_seconds: 300,
    content_type: "long",
    status: "active",
    is_demo: true,
    is_paid: true,
  },
  {
    id: "prod-test-video-003",
    owner_profile_id: "11111111-0000-0000-0000-000000000003", // Ghana Stand
    title: "Morocco at the World Cup — Africa's Finest Hour",
    description: "The full story of Morocco's historic run. Longer clip — tests multiple billing flush cycles and the leaderboard watch-time accumulation.",
    video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    thumbnail_url: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=640&q=80",
    category: "documentary",
    country_tags: ["MA", "CAF", "MOROCCO", "WORLDCUP"],
    duration_seconds: 540,
    content_type: "long",
    status: "active",
    is_demo: true,
    is_paid: true,
  },
];

async function insertVideos() {
  console.log(`Connecting to: ${cleanUrl}`);
  console.log("Inserting/Upserting 3 production test videos...\n");

  for (const video of TEST_VIDEOS) {
    try {
      const { data, error } = await supabase
        .from("videos")
        .upsert(video, { onConflict: "id" })
        .select("id, title")
        .single();

      if (error) {
        console.error(`❌ Failed to insert "${video.title}":`, error.message);
      } else {
        console.log(`✅ Upserted: "${data.title}" → ID: ${data.id}`);
      }
    } catch (err: any) {
      console.error(`❌ Exception inserting "${video.title}":`, err.message || err);
    }
  }

  console.log("\nDone. Check your Stadium Feed — videos should appear immediately.");
}

insertVideos();
