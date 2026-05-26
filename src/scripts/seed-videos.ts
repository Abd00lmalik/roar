import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

// Load environment variables from .env.local
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config({ path: path.resolve(__dirname, "../../.env.local") });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const TEST_VIDEOS = [
  {
    id: "demo-video-001",
    owner_profile_id: "11111111-0000-0000-0000-000000000003",
    title: "[DEMO] UEFA Qualifier Highlights — Group A",
    description: "Best goals and moments from the 2026 World Cup UEFA qualifiers.",
    video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    thumbnail_url: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=640&q=80",
    category: "highlights",
    country_tags: ["DE", "UEFA", "QUALIFIERS", "GOALS"],
    content_type: "long",
    status: "active",
    duration_seconds: 180,
    is_demo: true,
    is_paid: true,
  },
  {
    id: "demo-video-002",
    owner_profile_id: "11111111-0000-0000-0000-000000000003",
    title: "[DEMO] CONMEBOL Road to 2026 — Brazil",
    description: "Brazil's qualification journey through South America.",
    video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    thumbnail_url: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=640&q=80",
    category: "documentary",
    country_tags: ["BR", "CONMEBOL", "BRAZIL", "QUALIFICATION"],
    content_type: "long",
    status: "active",
    duration_seconds: 240,
    is_demo: true,
    is_paid: true,
  },
  {
    id: "demo-video-003",
    owner_profile_id: "11111111-0000-0000-0000-000000000003",
    title: "[DEMO] Fan Culture — Supporter Stories",
    description: "What the World Cup means to fans around the globe.",
    video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    thumbnail_url: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=640&q=80",
    category: "culture",
    country_tags: ["ES", "FANS", "CULTURE", "WORLDCUP"],
    content_type: "long",
    status: "active",
    duration_seconds: 300,
    is_demo: true,
    is_paid: false, // Make this one free for test previewing
  },
  {
    id: "demo-video-004",
    owner_profile_id: "11111111-0000-0000-0000-000000000003",
    title: "[DEMO] AFC Qualifiers — Japan vs South Korea",
    description: "The classic Asian rivalry in World Cup qualification.",
    video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    thumbnail_url: "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=640&q=80",
    category: "highlights",
    country_tags: ["JP", "AFC", "JAPAN", "KOREA"],
    content_type: "long",
    status: "active",
    duration_seconds: 210,
    is_demo: true,
    is_paid: true,
  },
  {
    id: "demo-video-005",
    owner_profile_id: "11111111-0000-0000-0000-000000000003",
    title: "[DEMO] CAF Playoffs — Africa's Final Spots",
    description: "Drama from the African confederation playoff round.",
    video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
    thumbnail_url: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=640&q=80",
    category: "highlights",
    country_tags: ["MA", "CAF", "AFRICA", "PLAYOFFS"],
    content_type: "long",
    status: "active",
    duration_seconds: 195,
    is_demo: true,
    is_paid: true,
  },
];

async function seed() {
  console.log("Seeding 5 demo videos into Supabase...");
  
  // First ensure column exists if migration hasn't run in local environment
  try {
    console.log("Ensuring is_demo column exists...");
    // Attempt dynamic sql run if RPC function is enabled in user's Supabase
    await supabase.rpc("run_sql", { 
      sql: "ALTER TABLE videos ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT FALSE;" 
    });
  } catch (sqlErr) {
    console.log("Dynamic is_demo column creation via RPC skipped/unavailable, proceeding with upsert.");
  }

  for (const video of TEST_VIDEOS) {
    try {
      const { error } = await supabase.from("videos").upsert(video, { onConflict: "id" });
      if (error) {
        console.error(`❌ Failed to seed "${video.title}":`, error.message);
      } else {
        console.log(`✓ ${video.title}`);
      }
    } catch (err: any) {
      console.error(`❌ Failed to seed "${video.title}":`, err.message || err);
    }
  }
  
  console.log("✓ Seed process completed.");
}

seed().catch(console.error);
