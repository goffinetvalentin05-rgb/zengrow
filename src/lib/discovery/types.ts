import type {
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

export type ProfileCardModel = Profile & {
  primaryCategory: Category | null;
  featuredProject: Project | null;
  featuredPreview?: FeaturedContent | null;
  socialLinks: SocialLink[];
  categorySlugs?: string[];
  followedByMe?: boolean;
  savedByMe?: boolean;
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
  source?: DiscoverySource | null;
  platform?: string | null;
  contentId?: string | null;
};

export type ProfileAnalytics = {
  views_total: number;
  views_7d: number;
  views_30d: number;
  external_clicks: number;
  clicks_by_platform: Record<string, number>;
  sources: Record<string, number>;
  visitor_niches: { slug: string; share: number }[];
  new_followers_7d: number;
  new_followers_30d: number;
  followers_total: number;
  most_clicked_content: { content_id: string; clicks: number }[];
};

export type ExploreFilters = {
  niche?: string | null;
  location?: string | null;
  profileType?: ProfileType | null;
  audience?: string | null;
  platform?: SocialPlatform | null;
  activity?: "rising" | "new" | "most-followed" | "recently-active" | null;
  age?: string | null;
};
