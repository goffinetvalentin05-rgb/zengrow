import type {
  ActivityFilter,
  DiscoveryEventType,
  DiscoverySource,
  FeaturedPlatform,
  ProfileType,
  ProjectStatus,
  SocialPlatform,
} from "@/src/lib/discovery/constants";

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  sortIndex: number;
  isFeatured: boolean;
  profileCount?: number;
};

export type Profile = {
  id: string;
  userId: string | null;
  email: string | null;
  displayName: string;
  username: string | null;
  bio: string | null;
  avatarUrl: string | null;
  location: string | null;
  country: string | null;
  profileType: ProfileType | null;
  primaryCategoryId: string | null;
  roleLabel: string | null;
  audienceSize: number | null;
  audienceSizeSource: "self_reported" | "synced" | null;
  isPublic: boolean;
  isDisabled: boolean;
  isFeatured: boolean;
  featuredRank: number | null;
  editorPick: boolean;
  claimStatus: "claimed" | "unclaimed";
  isAdmin: boolean;
  isSeed: boolean;
  onboardingCompleted: boolean;
  onboardingStep: string | null;
  completeness: number;
  followersCount: number;
  followingCount: number;
  birthDate: string | null;
  themeKey: string;
  coverImageUrl: string | null;
  featuredFirst: boolean;
  accentColor: string | null;
  layoutVariant: string;
  createdAt: string;
  updatedAt: string;
};

export type Project = {
  id: string;
  ownerId: string;
  name: string;
  slug: string | null;
  description: string | null;
  url: string | null;
  logoUrl: string | null;
  category: string | null;
  status: ProjectStatus;
  startedAt: string | null;
  milestone: string | null;
  featuredProject: boolean;
  sortIndex: number;
};

export type SocialLink = {
  id: string;
  profileId: string;
  platform: SocialPlatform | "other";
  url: string;
  followerCount: number | null;
  sortIndex: number;
};

export type FeaturedContent = {
  id: string;
  profileId: string;
  platform: FeaturedPlatform;
  url: string;
  title: string | null;
  thumbnailUrl: string | null;
  sortIndex: number;
};

export type ConnectionUiStatus = "none" | "pending_out" | "pending_in" | "accepted";

export type ProfileCardModel = Profile & {
  primaryCategory: Category | null;
  featuredProject: Project | null;
  featuredPreview?: FeaturedContent | null;
  socialLinks: SocialLink[];
  categorySlugs?: string[];
  followedByMe?: boolean;
  savedByMe?: boolean;
  connectionStatus?: ConnectionUiStatus;
  discoveryBadge?: "rising" | "new" | null;
};

export type PublicProfileModel = ProfileCardModel & {
  categories: Category[];
  projects: Project[];
  featuredContent: FeaturedContent[];
};

export type UserSubscription = {
  plan: "free" | "pro";
  status: "inactive" | "active" | "canceled" | "past_due" | "trialing";
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  currentPeriodEnd: string | null;
};

export type DiscoveryEventInput = {
  profileId: string;
  eventType: DiscoveryEventType;
  source?: DiscoverySource | string | null;
  platform?: string | null;
  contentId?: string | null;
  destination?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
};

export type AnalyticsPoint = {
  date: string;
  views?: number;
  count?: number;
};

export type AnalyticsTopLink = {
  label: string;
  platform: string;
  kind: "link" | "featured" | "project" | string;
  clicks: number;
};

export type AnalyticsTrafficSource = {
  key: string;
  count: number;
  share?: number;
};

export type ProfileAnalytics = {
  range_days: number;
  views_total: number;
  views: number;
  views_prev: number;
  views_today: number;
  views_7d: number;
  views_30d: number;
  unique_visitors: number;
  unique_visitors_prev: number;
  external_clicks: number;
  external_clicks_prev: number;
  external_clicks_total: number;
  impressions: number;
  profile_opens: number;
  follows: number;
  clicks_by_platform: Record<string, number>;
  sources: Record<string, number>;
  traffic_sources: AnalyticsTrafficSource[];
  traffic_split: {
    discovery: number;
    external: number;
    discoveryShare: number;
    externalShare: number;
  };
  visitor_niches: { slug: string; name?: string; share: number; count?: number }[];
  new_followers_7d: number;
  new_followers_30d: number;
  new_followers: number;
  followers_total: number;
  views_over_time: AnalyticsPoint[];
  followers_over_time: AnalyticsPoint[];
  top_links: AnalyticsTopLink[];
  most_clicked_content: { content_id: string; clicks: number }[];
};

export type ExploreFilters = {
  niche?: string | null;
  location?: string | null;
  profileType?: ProfileType | null;
  audience?: string | null;
  platform?: SocialPlatform | null;
  activity?: ActivityFilter | "recently-active" | null;
  age?: string | null;
};
