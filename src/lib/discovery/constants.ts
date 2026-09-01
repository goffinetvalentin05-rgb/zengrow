export const PROFILE_TYPES = [
  "builder",
  "founder",
  "creator",
  "operator",
  "freelancer",
  "marketer",
  "developer",
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
  marketer: "Marketer",
  developer: "Developer",
  coach: "Coach",
  investor: "Investor",
  other: "Other",
};

export const ONBOARDING_ROLES = [
  "founder",
  "creator",
  "operator",
  "freelancer",
  "marketer",
  "investor",
  "developer",
  "other",
] as const;

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

export const PROJECT_STATUSES = ["building", "launched", "growing", "exploring", "paused", "exited"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  building: "Building",
  launched: "Launched",
  growing: "Growing",
  exploring: "Exploring",
  paused: "Paused",
  exited: "Exited",
};

export const ONBOARDING_PROJECT_STATUSES = ["building", "launched", "growing", "exploring"] as const;

export const AUDIENCE_RANGES = [
  { id: "under-1k", label: "Under 1k", min: 0, max: 999 },
  { id: "1k-5k", label: "1k–5k", min: 1000, max: 4999 },
  { id: "under-5k", label: "Under 5k", min: 0, max: 4999 },
  { id: "5k-25k", label: "5k–25k", min: 5000, max: 24999 },
  { id: "25k-plus", label: "25k+", min: 25000, max: null },
] as const;

export type AudienceRangeId = (typeof AUDIENCE_RANGES)[number]["id"];

export const AGE_RANGES = [
  { id: "18-20", label: "18–20", min: 18, max: 20 },
  { id: "21-24", label: "21–24", min: 21, max: 24 },
  { id: "25-34", label: "25–34", min: 25, max: 34 },
  { id: "35-plus", label: "35+", min: 35, max: null },
] as const;

export type AgeRangeId = (typeof AGE_RANGES)[number]["id"];

export const ACTIVITY_FILTERS = ["recommended", "rising", "new", "most-followed"] as const;
export type ActivityFilter = (typeof ACTIVITY_FILTERS)[number];

export const ACTIVITY_LABELS: Record<ActivityFilter, string> = {
  recommended: "Recommended",
  rising: "Rising",
  new: "New",
  "most-followed": "Most followed",
};

export const DISCOVERY_PAGE_SIZE = 16;

export const DISCOVERY_EVENT_TYPES = [
  "profile_view",
  "external_link_click",
  "featured_content_click",
  "project_click",
  "follow",
  "search_result_click",
  "profile_save",
  "profile_impression",
  "profile_open_from_discovery",
  "profile_external_click",
  "connection_contact_click",
  "profile_cta_click",
  "premium_block_click",
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

export const ANALYTICS_RANGES = [7, 30, 90] as const;
export type AnalyticsRange = (typeof ANALYTICS_RANGES)[number];

export const CONNECTION_STATUSES = ["pending", "accepted", "declined"] as const;
export type ConnectionRecordStatus = (typeof CONNECTION_STATUSES)[number];

export const CLICK_PLATFORMS = [
  "instagram",
  "youtube",
  "tiktok",
  "x",
  "linkedin",
  "website",
  "project",
  "featured_content",
  "other",
] as const;

export type ClickPlatform = (typeof CLICK_PLATFORMS)[number];

export const MAX_NICHES = 5;
export const MAX_FEATURED_CONTENT = 6;

/** 3–30 chars, starts and ends with a letter or digit, hyphens and underscores in the middle. */
export const USERNAME_PATTERN = /^[a-z0-9](?:[a-z0-9_-]{1,28}[a-z0-9])$/;

export const RESERVED_PROFILE_SLUGS = [
  "about",
  "account",
  "admin",
  "analytics",
  "api",
  "app",
  "auth",
  "billing",
  "blog",
  "categories",
  "category",
  "claim",
  "conditions",
  "confidentialite",
  "dashboard",
  "discover",
  "docs",
  "explore",
  "featured",
  "feedback",
  "following",
  "forgot-password",
  "help",
  "home",
  "index",
  "legal",
  "login",
  "me",
  "onboarding",
  "p",
  "pricing",
  "privacy",
  "pro",
  "r",
  "reset-password",
  "review",
  "robots",
  "saved",
  "search",
  "settings",
  "sharpz",
  "signup",
  "sitemap",
  "static",
  "status",
  "support",
  "terms",
  "u",
  "update-password",
  "v",
  "www",
] as const;

export const RESERVED_PROFILE_SLUG_SET = new Set<string>(RESERVED_PROFILE_SLUGS);
