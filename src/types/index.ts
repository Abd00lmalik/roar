export type CountryCode = string;

export type ReactionType =
  | "hot_take"
  | "great_analysis"
  | "banter"
  | "tactical"
  | "disagree"
  | "lift_the_cup";

export type Profile = {
  id: string;
  wallet_address: string;
  display_name: string;
  handle: string;
  bio?: string | null;
  country_code: CountryCode;
  country_name: string;
  cumulative_free_seconds_used: number;
  created_at?: string;
};

export type Video = {
  id: string;
  owner_profile_id: string;
  owner_handle: string;
  owner_country_code: CountryCode;
  title: string;
  description?: string | null;
  video_url: string;
  thumbnail_url?: string | null;
  duration_seconds: number;
  category: string;
  country_tags: CountryCode[];
  content_type: "short" | "long";
  total_watch_seconds: number;
  total_billable_seconds: number;
};

export type WatchSessionSummary = {
  reason: "pause" | "end" | "navigate" | "tab_hidden";
  totalSeconds: number;
  freeSecondsUsed: number;
  billableSeconds: number;
  amountUsdc: number;
  creatorShareUsdc: number;
  platformShareUsdc: number;
  rewardPoolShareUsdc: number;
  endedAt: string;
};
