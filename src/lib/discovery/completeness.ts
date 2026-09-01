import type { FeaturedContent, Profile, Project, SocialLink } from "@/src/lib/discovery/types";

export type CompletenessInput = {
  profile: Pick<
    Profile,
    "avatarUrl" | "displayName" | "username" | "bio" | "location" | "profileType" | "primaryCategoryId" | "coverImageUrl"
  >;
  hasProject: boolean;
  socialCount: number;
};

export type CompletenessSuggestion = {
  key: string;
  label: string;
  href: string;
};

/**
 * Weighted profile completeness for the MVP.
 * Used for Explore ranking and the "Complete profile" CTA.
 */
export function computeCompleteness(input: CompletenessInput): number {
  let score = 0;
  if (input.profile.avatarUrl) score += 15;
  if (input.profile.displayName.trim().length >= 2) score += 10;
  if (input.profile.username) score += 10;
  if ((input.profile.bio ?? "").trim().length >= 12) score += 15;
  if (input.profile.location) score += 5;
  if (input.profile.primaryCategoryId) score += 10;
  if (input.profile.profileType) score += 10;
  if (input.hasProject) score += 15;
  if (input.socialCount > 0) score += 10;
  return Math.min(100, score);
}

export function completenessSuggestions(input: {
  profile: CompletenessInput["profile"];
  projects: Project[];
  socialLinks: SocialLink[];
  featuredContent: FeaturedContent[];
}): CompletenessSuggestion[] {
  const suggestions: CompletenessSuggestion[] = [];
  if (!input.profile.avatarUrl) {
    suggestions.push({ key: "photo", label: "Add a profile picture", href: "/me/edit#profile" });
  }
  if (!input.profile.coverImageUrl) {
    suggestions.push({ key: "cover", label: "Add a cover", href: "/me/edit#appearance" });
  }
  if (!input.projects.length) {
    suggestions.push({ key: "project", label: "Add your project", href: "/me/edit#projects" });
  }
  if (!input.socialLinks.some((link) => link.platform === "youtube")) {
    suggestions.push({ key: "youtube", label: "Add YouTube", href: "/me/edit#social" });
  }
  if (!input.featuredContent.length) {
    suggestions.push({ key: "featured", label: "Add featured content", href: "/me/edit#featured" });
  }
  if (!input.socialLinks.length) {
    suggestions.push({ key: "social", label: "Add where people can find you", href: "/me/edit#social" });
  }
  if ((input.profile.bio ?? "").trim().length < 12) {
    suggestions.push({ key: "bio", label: "Write a short bio", href: "/me/edit#profile" });
  }
  return suggestions.slice(0, 4);
}
