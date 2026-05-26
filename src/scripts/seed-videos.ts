import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

// Load environment variables from .env.local
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  console.warn("Warning: .env.local not found in process.cwd(). Trying relative path...");
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
    id: "test-video-001",
    owner_profile_id: "11111111-0000-0000-0000-000000000003", // Ghana Stand seeded profile
    title: "World Cup 2022 — Argentina vs France Final Highlights",
    description: "The greatest World Cup final ever played. Mbappe hat-trick, Messi masterclass.",
    video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    thumbnail_url: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800",
    duration_seconds: 180,
    category: "highlights",
    country_tags: ["AR", "FR"],
    content_type: "long",
    status: "active",
    total_watch_seconds: 0,
    total_billable_seconds: 0,
    is_paid: true,
  },
  {
    id: "test-video-002",
    owner_profile_id: "11111111-0000-0000-0000-000000000003",
    title: "Morocco's Historic World Cup 2022 Run",
    description: "Africa's first ever World Cup semi-finalists. Every step of the journey.",
    video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    thumbnail_url: "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=800",
    duration_seconds: 240,
    category: "documentary",
    country_tags: ["MA"],
    content_type: "long",
    status: "active",
    total_watch_seconds: 0,
    total_billable_seconds: 0,
    is_paid: true,
  },
  {
    id: "test-video-003",
    owner_profile_id: "11111111-0000-0000-0000-000000000003",
    title: "Top 10 World Cup Goals of All Time",
    description: "Puskas. Bergkamp. Goycochea. The moments that defined the tournament.",
    video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    thumbnail_url: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800",
    duration_seconds: 300,
    category: "highlights",
    country_tags: ["PLAYOFF"],
    content_type: "long",
    status: "active",
    total_watch_seconds: 0,
    total_billable_seconds: 0,
    is_paid: true,
  },
  {
    id: "test-video-004",
    owner_profile_id: "11111111-0000-0000-0000-000000000003",
    title: "2026 World Cup Preview — USA, Canada & Mexico Host",
    description: "Everything you need to know about the biggest World Cup in history.",
    video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    thumbnail_url: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800",
    duration_seconds: 210,
    category: "preview",
    country_tags: ["US", "CA", "MX"],
    content_type: "long",
    status: "active",
    total_watch_seconds: 0,
    total_billable_seconds: 0,
    is_paid: true,
  },
  {
    id: "test-video-005",
    owner_profile_id: "11111111-0000-0000-0000-000000000003",
    title: "Fan Culture Around the World Cup",
    description: "From São Paulo to Seoul — what the World Cup means to fans everywhere.",
    video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
    thumbnail_url: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800",
    duration_seconds: 195,
    category: "culture",
    country_tags: ["BR", "KR"],
    content_type: "long",
    status: "active",
    total_watch_seconds: 0,
    total_billable_seconds: 0,
    is_paid: false, // free video for previewing without USDC
  },
];

async function seed() {
  console.log("Seeding 5 test videos into Supabase...");
  
  for (const video of TEST_VIDEOS) {
    // Try to insert/upsert video
    const { error } = await supabase.from("videos").upsert(video, { onConflict: "id" });
    
    if (error) {
      console.error(`❌ Failed to seed "${video.title}":`, error.message);
      
      // If error is about missing is_paid column, try to alter table and retry
      if (error.message.includes("is_paid")) {
        console.log("Attempting to dynamically add 'is_paid' column to videos table...");
        try {
          // If the user's Supabase instance has sql function enabled
          await supabase.rpc("run_sql", { 
            sql: "ALTER TABLE videos ADD COLUMN IF NOT EXISTS is_paid BOOLEAN DEFAULT TRUE;" 
          });
          // Retry
          const retry = await supabase.from("videos").upsert(video, { onConflict: "id" });
          if (retry.error) {
            console.error(`❌ Retry failed:`, retry.error.message);
          } else {
            console.log(`✓ ${video.title} (successfully seeded on retry)`);
          }
        } catch (sqlErr) {
          console.error("❌ Dynamic column creation failed:", sqlErr);
        }
      }
    } else {
      console.log(`✓ ${video.title}`);
    }
  }
  
  console.log("Seed process finished.");
}

seed().catch(console.error);
