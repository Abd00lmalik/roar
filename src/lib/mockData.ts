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
    display_name: "Naija Stand",
    handle: "NaijaStand",
    bio: "Nigeria to the world. Super Eagles forever.",
    country_code: "NG",
    country_name: "Nigeria",
    cumulative_free_seconds_used: 0,
  },
];

export const seededVideos: Video[] = [
  {
    id: "aaaaaaaa-0000-0000-0000-000000000001",
    owner_profile_id: "11111111-0000-0000-0000-000000000003",
    owner_handle: "NaijaStand",
    owner_country_code: "NG",
    title: "Nigeria vs Brazil: The Midfield Battle",
    description: "A deep dive into the midfield chess match.",
    video_url:
      "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4",
    thumbnail_url: "https://picsum.photos/seed/ngbr/640/360",
    duration_seconds: 847,
    category: "Tactical Breakdowns",
    country_tags: ["NG", "BR"],
    content_type: "long",
    total_watch_seconds: 12400,
    total_billable_seconds: 8200,
  },
  {
    id: "aaaaaaaa-0000-0000-0000-000000000005",
    owner_profile_id: "11111111-0000-0000-0000-000000000003",
    owner_handle: "NaijaStand",
    owner_country_code: "EN",
    title: "England Fans After the Final Whistle",
    description: "Pure emotion from the stands after a dramatic equalizer.",
    video_url:
      "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4",
    thumbnail_url: "https://picsum.photos/seed/enfans/640/360",
    duration_seconds: 92,
    category: "Fan Reactions",
    country_tags: ["EN"],
    content_type: "short",
    total_watch_seconds: 15600,
    total_billable_seconds: 11200,
  },
];

export const badgesSeed = [
  {
    id: 1,
    slug: "first_roar",
    name: "First Roar",
    description: "You watched your first video on Roar",
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
    description: "Watched 10 total minutes on Roar",
    icon: "⏱️",
  },
  {
    id: 5,
    slug: "30_min_fan",
    name: "30-Minute Fan",
    description: "Watched 30 total minutes on Roar",
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
