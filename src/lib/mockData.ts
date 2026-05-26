import type { Profile, Video } from "@/types";

export const platformStatsSeed = {
  total_watch_seconds: 102100,
  total_billable_seconds: 71900,
  total_volume_usdc: 71.9,
  fan_rewards_pool_usdc: 7.19,
  platform_revenue_usdc: 3.595,
};

export const seededProfiles: Profile[] = [
  {
    id: "11111111-0000-0000-0000-000000000001",
    wallet_address: "0x0000000000000000000000000000000000000001",
    display_name: "Tactical Ghost",
    handle: "TacticalGhost",
    bio: "Breaking down football systems one frame at a time.",
    country_code: "FR",
    country_name: "France",
    cumulative_free_seconds_used: 0,
  },
  {
    id: "11111111-0000-0000-0000-000000000003",
    wallet_address: "0x0000000000000000000000000000000000000003",
    display_name: "Ghana Stand",
    handle: "GhanaStand",
    bio: "Ghana to the world. Black Stars forever.",
    country_code: "GH",
    country_name: "Ghana",
    cumulative_free_seconds_used: 0,
  },
];

export const seededVideos: any[] = [
  {
    id: "demo-video-001",
    owner_profile_id: "11111111-0000-0000-0000-000000000003",
    owner_handle: "GhanaStand",
    owner_country_code: "GH",
    title: "[DEMO] UEFA Qualifier Highlights — Group A",
    description: "Best goals and moments from the 2026 World Cup UEFA qualifiers.",
    video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    thumbnail_url: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=640&q=80",
    category: "highlights",
    country_tags: ["DE", "UEFA", "QUALIFIERS", "GOALS"],
    content_type: "long",
    duration_seconds: 60, // 1 minute
    is_demo: true,
    is_paid: true,
    total_watch_seconds: 12400,
    total_billable_seconds: 8200,
    profiles: {
      id: "11111111-0000-0000-0000-000000000003",
      circle_wallet_id: "dummy-creator-circle-id-1",
      wallet_address: "0x0000000000000000000000000000000000000003",
    }
  },
  {
    id: "demo-video-002",
    owner_profile_id: "11111111-0000-0000-0000-000000000003",
    owner_handle: "GhanaStand",
    owner_country_code: "GH",
    title: "[DEMO] CONMEBOL Road to 2026 — Brazil",
    description: "Brazil's qualification journey through South America.",
    video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    thumbnail_url: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=640&q=80",
    category: "documentary",
    country_tags: ["BR", "CONMEBOL", "BRAZIL", "QUALIFICATION"],
    content_type: "long",
    duration_seconds: 120, // 2 minutes
    is_demo: true,
    is_paid: true,
    total_watch_seconds: 9800,
    total_billable_seconds: 6400,
    profiles: {
      id: "11111111-0000-0000-0000-000000000003",
      circle_wallet_id: "dummy-creator-circle-id-1",
      wallet_address: "0x0000000000000000000000000000000000000003",
    }
  },
  {
    id: "demo-video-003",
    owner_profile_id: "11111111-0000-0000-0000-000000000003",
    owner_handle: "GhanaStand",
    owner_country_code: "GH",
    title: "[DEMO] Fan Culture — Supporter Stories",
    description: "What the World Cup means to fans around the globe.",
    video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    thumbnail_url: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=640&q=80",
    category: "culture",
    country_tags: ["ES", "FANS", "CULTURE", "WORLDCUP"],
    content_type: "long",
    duration_seconds: 180, // 3 minutes
    is_demo: true,
    is_paid: true,
    total_watch_seconds: 15600,
    total_billable_seconds: 11200,
    profiles: {
      id: "11111111-0000-0000-0000-000000000003",
      circle_wallet_id: "dummy-creator-circle-id-1",
      wallet_address: "0x0000000000000000000000000000000000000003",
    }
  },
  {
    id: "demo-video-004",
    owner_profile_id: "11111111-0000-0000-0000-000000000003",
    owner_handle: "GhanaStand",
    owner_country_code: "GH",
    title: "[DEMO] AFC Qualifiers — Japan vs South Korea",
    description: "The classic Asian rivalry in World Cup qualification.",
    video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    thumbnail_url: "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=640&q=80",
    category: "highlights",
    country_tags: ["JP", "AFC", "JAPAN", "KOREA"],
    content_type: "long",
    duration_seconds: 300, // 5 minutes
    is_demo: true,
    is_paid: true,
    total_watch_seconds: 8700,
    total_billable_seconds: 5200,
    profiles: {
      id: "11111111-0000-0000-0000-000000000003",
      circle_wallet_id: "dummy-creator-circle-id-1",
      wallet_address: "0x0000000000000000000000000000000000000003",
    }
  },
  {
    id: "demo-video-005",
    owner_profile_id: "11111111-0000-0000-0000-000000000003",
    owner_handle: "GhanaStand",
    owner_country_code: "GH",
    title: "[DEMO] CAF Playoffs — Africa's Final Spots",
    description: "Drama from the African confederation playoff round.",
    video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
    thumbnail_url: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=640&q=80",
    category: "highlights",
    country_tags: ["MA", "CAF", "AFRICA", "PLAYOFFS"],
    content_type: "long",
    duration_seconds: 600, // 10 minutes
    is_demo: true,
    is_paid: true,
    total_watch_seconds: 14200,
    total_billable_seconds: 9600,
    profiles: {
      id: "11111111-0000-0000-0000-000000000003",
      circle_wallet_id: "dummy-creator-circle-id-1",
      wallet_address: "0x0000000000000000000000000000000000000003",
    }
  }
];

export const badgesSeed = [
  {
    id: 1,
    slug: "first_roar",
    name: "First RoarTube",
    description: "You watched your first video on RoarTube",
    icon: "🏆",
  },
  {
    id: 2,
    slug: "first_upload",
    name: "First Upload",
    description: "You entered the pitch and uploaded your first video",
    icon: "⚽",
  },
  {
    id: 3,
    slug: "matchday_viewer",
    name: "Matchday Viewer",
    description: "Watched a matchday-tagged video",
    icon: "📅",
  },
  {
    id: 4,
    slug: "10_min_fan",
    name: "10-Minute Fan",
    description: "Watched 10 total minutes on RoarTube",
    icon: "⏱️",
  },
  {
    id: 5,
    slug: "30_min_fan",
    name: "30-Minute Fan",
    description: "Watched 30 total minutes on RoarTube",
    icon: "🎽",
  },
  {
    id: 6,
    slug: "90_min_fan",
    name: "90-Minute Fan",
    description: "Watched a full 90 minutes - true fan",
    icon: "🥇",
  },
  {
    id: 7,
    slug: "country_loyalist",
    name: "Country Loyalist",
    description: "Followed your chosen country feed",
    icon: "🌍",
  },
  {
    id: 8,
    slug: "creator_supporter",
    name: "Creator Supporter",
    description: "Watched 5 minutes from a single creator",
    icon: "🤝",
  },
  {
    id: 9,
    slug: "tactical_mind",
    name: "Tactical Mind",
    description: "Watched 3 tactical breakdown videos",
    icon: "🧠",
  },
  {
    id: 10,
    slug: "banter_king",
    name: "Banter King",
    description: "Reacted with Banter 10 times",
    icon: "😂",
  },
  {
    id: 11,
    slug: "hot_take_merchant",
    name: "Hot Take Merchant",
    description: "Used Hot Take reaction 10 times",
    icon: "🌶️",
  },
  {
    id: 12,
    slug: "early_member",
    name: "Early Stadium Member",
    description: "Joined during the Global Cup Festival launch period",
    icon: "⭐",
  },
];
