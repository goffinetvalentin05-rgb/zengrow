import type { ProfileType, ProjectStatus, SocialPlatform, FeaturedPlatform } from "@/src/lib/discovery/constants";
import type {
  Category,
  FeaturedContent,
  Profile,
  Project,
  SocialLink,
  UserSubscription,
} from "@/src/lib/discovery/types";

type Row = Record<string, unknown>;

function str(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function num(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function mapCategory(row: Row): Category {
  return {
    id: String(row.id),
    name: String(row.name ?? ""),
    slug: String(row.slug ?? ""),
    description: str(row.description),
    imageUrl: str(row.image_url),
    sortIndex: Number(row.sort_index ?? 0),
    isFeatured: Boolean(row.is_featured),
    profileCount: typeof row.profile_count === "number" ? row.profile_count : undefined,
  };
}

export function mapProfile(row: Row): Profile {
  return {
    id: String(row.id),
    userId: str(row.user_id),
    email: str(row.email),
    displayName: String(row.display_name ?? ""),
    username: str(row.username),
    bio: str(row.bio),
    avatarUrl: str(row.avatar_url),
    location: str(row.location),
    country: str(row.country),
    profileType: (str(row.profile_type) as ProfileType | null) ?? null,
    primaryCategoryId: str(row.primary_category_id),
    roleLabel: str(row.role_label),
    audienceSize: num(row.audience_size),
    audienceSizeSource: (str(row.audience_size_source) as Profile["audienceSizeSource"]) ?? null,
    isPublic: row.is_public !== false,
    isDisabled: Boolean(row.is_disabled),
    isFeatured: Boolean(row.is_featured),
    featuredRank: num(row.featured_rank),
    editorPick: Boolean(row.editor_pick),
    claimStatus: row.claim_status === "unclaimed" ? "unclaimed" : "claimed",
    isAdmin: Boolean(row.is_admin),
    isSeed: Boolean(row.is_seed),
    onboardingCompleted: Boolean(row.onboarding_completed),
    onboardingStep: str(row.onboarding_step),
    completeness: Number(row.completeness ?? 0),
    followersCount: Number(row.followers_count ?? 0),
    followingCount: Number(row.following_count ?? 0),
    birthDate: str(row.birth_date),
    themeKey: str(row.theme_key) ?? "obsidian",
    coverImageUrl: str(row.cover_image_url),
    featuredFirst: Boolean(row.featured_first),
    accentColor: str(row.accent_color),
    layoutVariant: str(row.layout_variant) ?? (row.featured_first ? "content_first" : "default"),
    createdAt: String(row.created_at ?? new Date().toISOString()),
    updatedAt: String(row.updated_at ?? new Date().toISOString()),
  };
}

export function mapProject(row: Row): Project {
  return {
    id: String(row.id),
    ownerId: String(row.owner_id),
    name: String(row.name ?? ""),
    slug: str(row.slug),
    description: str(row.description),
    url: str(row.url),
    logoUrl: str(row.logo_url),
    category: str(row.category),
    status: (str(row.status) as ProjectStatus) ?? "building",
    startedAt: str(row.started_at),
    milestone: str(row.milestone),
    featuredProject: Boolean(row.featured_project),
    sortIndex: Number(row.sort_index ?? 0),
  };
}

export function mapSocialLink(row: Row): SocialLink {
  return {
    id: String(row.id),
    profileId: String(row.profile_id),
    platform: (str(row.platform) as SocialPlatform | "other") ?? "other",
    url: String(row.url ?? ""),
    followerCount: num(row.follower_count),
    sortIndex: Number(row.sort_index ?? 0),
  };
}

export function mapFeaturedContent(row: Row): FeaturedContent {
  return {
    id: String(row.id),
    profileId: String(row.profile_id),
    platform: (str(row.platform) as FeaturedPlatform) ?? "other",
    url: String(row.url ?? ""),
    title: str(row.title),
    thumbnailUrl: str(row.thumbnail_url),
    sortIndex: Number(row.sort_index ?? 0),
  };
}

export function mapSubscription(row: Row | null | undefined): UserSubscription {
  if (!row) {
    return {
      plan: "free",
      status: "inactive",
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      currentPeriodEnd: null,
    };
  }
  return {
    plan: row.plan === "pro" ? "pro" : "free",
    status:
      row.status === "active" ||
      row.status === "canceled" ||
      row.status === "past_due" ||
      row.status === "trialing"
        ? row.status
        : "inactive",
    stripeCustomerId: str(row.stripe_customer_id),
    stripeSubscriptionId: str(row.stripe_subscription_id),
    currentPeriodEnd: str(row.current_period_end),
  };
}
