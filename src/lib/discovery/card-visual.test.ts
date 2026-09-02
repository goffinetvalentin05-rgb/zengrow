import { describe, expect, it } from "vitest";
import { resolveCardMedia } from "@/src/lib/discovery/card-visual";
import type { ProfileCardModel } from "@/src/lib/discovery/types";

function card(partial: Partial<ProfileCardModel>): ProfileCardModel {
  return {
    id: "p1",
    userId: null,
    email: null,
    displayName: "Jonas",
    username: "jonashale",
    bio: "Bio",
    avatarUrl: "https://example.com/avatar.png",
    location: "Berlin",
    country: "Germany",
    profileType: "founder",
    primaryCategoryId: null,
    roleLabel: "SaaS Founder",
    audienceSize: 1800,
    audienceSizeSource: "self_reported",
    isPublic: true,
    isDisabled: false,
    isFeatured: false,
    featuredRank: null,
    editorPick: false,
    claimStatus: "unclaimed",
    isAdmin: false,
    isSeed: true,
    onboardingCompleted: true,
    onboardingStep: null,
    completeness: 70,
    followersCount: 0,
    followingCount: 0,
    birthDate: null,
    themeKey: "obsidian",
    coverImageUrl: null,
    pageBackgroundKey: "void",
    pageBackgroundImageUrl: null,
    featuredFirst: false,
    accentColor: null,
    layoutVariant: "default",
    ctaLabel: null,
    ctaUrl: null,
    ctaType: "custom",
    preferredLanguage: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    primaryCategory: null,
    featuredProject: {
      id: "proj",
      ownerId: "p1",
      name: "Northloop",
      slug: "northloop",
      description: null,
      url: null,
      logoUrl: "https://example.com/logo.png",
      category: "SaaS",
      status: "building",
      startedAt: null,
      milestone: null,
      featuredProject: true,
      sortIndex: 0,
    },
    socialLinks: [],
    ...partial,
  };
}

describe("resolveCardMedia", () => {
  it("never uses the avatar as the hero image", () => {
    const media = resolveCardMedia(card({ avatarUrl: "https://example.com/avatar.png" }));
    expect(media.heroUrl).toBeNull();
    expect(media.heroKind).toBe("none");
  });

  it("prefers a YouTube thumbnail over cover and logo", () => {
    const media = resolveCardMedia(
      card({
        coverImageUrl: "https://example.com/cover.jpg",
        featuredPreview: {
          id: "f1",
          profileId: "p1",
          platform: "youtube",
          url: "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
          title: "Talk",
          thumbnailUrl: null,
          sortIndex: 0,
        },
      }),
    );
    expect(media.heroKind).toBe("youtube");
    expect(media.heroUrl).toContain("i.ytimg.com");
    expect(media.youtubeUrl).toContain("aqz-KE-bpKQ");
    expect(media.projectLogo).toBe("https://example.com/logo.png");
  });

  it("falls back to cover when there is no video", () => {
    const media = resolveCardMedia(card({ coverImageUrl: "https://example.com/cover.jpg" }));
    expect(media.heroKind).toBe("cover");
    expect(media.heroUrl).toBe("https://example.com/cover.jpg");
  });
});
