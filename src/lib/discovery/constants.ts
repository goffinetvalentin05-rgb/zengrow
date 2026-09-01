export const PROFILE_TYPES = [
  "builder",
  "founder",
  "creator",
  "operator",
  "freelancer",
  "coach",
  "investor",
  "other",
] as const;

export type ProfileType = (typeof PROFILE_TYPES)[number];

export const PROFILE_TYPE_LABELS: Record<ProfileType, string> = {
  builder: "Builder",
  founder: "Founder",
  creator: "Creator",
  operator: "Operator",
  freelancer: "Freelancer",
  coach: "Coach",
  investor: "Investor",
  other: "Other",
};

export const SOCIAL_PLATFORMS = [
  "instagram",
  "youtube",
  "tiktok",
  "x",
  "linkedin",
  "website",
] as const;

export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];

export const SOCIAL_PLATFORM_LABELS: Record<SocialPlatform, string> = {
  instagram: "Instagram",
  youtube: "YouTube",
  tiktok: "TikTok",
  x: "X",
  linkedin: "LinkedIn",
  website: "Website",
};

export const FEATURED_PLATFORMS = [
  "youtube",
  "instagram",
  "tiktok",
  "x",
  "linkedin",
  "article",
  "other",
] as const;

export type FeaturedPlatform = (typeof FEATURED_PLATFORMS)[number];

export const FEATURED_PLATFORM_LABELS: Record<FeaturedPlatform, string> = {
  youtube: "YouTube",
  instagram: "Instagram",
  tiktok: "TikTok",
  x: "X",
  linkedin: "LinkedIn",
  article: "Article",
  other: "Other",
};

export const FEATURED_CTA: Record<FeaturedPlatform, string> = {
  youtube: "Watch on YouTube",
  instagram: "View on Instagram",
  tiktok: "View on TikTok",
  x: "View on X",
  linkedin: "View on LinkedIn",
  article: "Read article",
  other: "Open link",
};

export const PROJECT_STATUSES = ["building", "launched", "paused", "exited"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  building: "Building",
  launched: "Launched",
  paused: "Paused",
  exited: "Exited",
};

export const AUDIENCE_RANGES = [
  { id: "under-1k", label: "Under 1k", min: 0, max: 999 },
  { id: "1k-5k", label: "1k–5k", min: 1000, max: 4999 },
  { id: "5k-20k", label: "5k–20k", min: 5000, max: 19999 },
  { id: "20k-plus", label: "20k+", min: 20000, max: null },
] as const;

export type AudienceRangeId = (typeof AUDIENCE_RANGES)[number]["id"];

export const AGE_RANGES = [
  { id: "18-20", label: "18–20", min: 18, max: 20 },
  { id: "21-25", label: "21–25", min: 21, max: 25 },
  { id: "26-30", label: "26–30", min: 26, max: 30 },
  { id: "31-plus", label: "31+", min: 31, max: null },
] as const;

export type AgeRangeId = (typeof AGE_RANGES)[number]["id"];

export const ACTIVITY_FILTERS = ["rising", "new", "most-followed", "recently-active"] as const;
export type ActivityFilter = (typeof ACTIVITY_FILTERS)[number];

export const ACTIVITY_LABELS: Record<ActivityFilter, string> = {
  rising: "Rising",
  new: "New",
  "most-followed": "Most followed",
  "recently-active": "Recently active",
};

export const DISCOVERY_EVENT_TYPES = [
  "profile_view",
  "external_link_click",
  "featured_content_click",
  "project_click",
  "follow",
  "search_result_click",
] as const;

export type DiscoveryEventType = (typeof DISCOVERY_EVENT_TYPES)[number];

export const DISCOVERY_SOURCES = [
  "explore",
  "search",
  "category",
  "direct",
  "following",
  "saved",
] as const;

export type DiscoverySource = (typeof DISCOVERY_SOURCES)[number];

export const MAX_NICHES = 5;
export const MAX_FEATURED_CONTENT = 6;

export const USERNAME_PATTERN = /^[a-z0-9_]{3,30}$/;
