import { describe, expect, it } from "vitest";
import { applyDiscoveryFilters } from "@/src/lib/discovery/apply-filters";
import { parseExploreFilters, exploreHref } from "@/src/lib/discovery/filters";
import { assignDiscoveryBadges, mixDiscoverFeed, mixNicheFeed } from "@/src/lib/discovery/mix";
import type { ProfileCardModel } from "@/src/lib/discovery/types";

function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

function card(partial: Partial<ProfileCardModel> & { id: string; displayName: string }): ProfileCardModel {
  return {
    userId: null,
    email: null,
    username: partial.id,
    bio: "Building something small.",
    avatarUrl: null,
    location: null,
    country: null,
    profileType: "founder",
    primaryCategoryId: null,
    roleLabel: "Founder",
    audienceSize: 800,
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
    followersCount: 2,
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
    createdAt: daysAgo(10),
    updatedAt: daysAgo(10),
    primaryCategory: { id: "saas", name: "SaaS", slug: "saas", description: null, imageUrl: null, sortIndex: 1, isFeatured: true },
    featuredProject: null,
    socialLinks: [],
    categorySlugs: ["saas"],
    followedByMe: false,
    savedByMe: false,
    ...partial,
  };
}

describe("discovery mix", () => {
  it("never duplicates a person in the feed", () => {
    const profiles = Array.from({ length: 12 }, (_, index) =>
      card({ id: `p${index}`, displayName: `Person ${index}`, followersCount: index, editorPick: index === 0 }),
    );
    const feed = mixDiscoverFeed(profiles, ["saas"]);
    expect(new Set(feed.map((item) => item.id)).size).toBe(feed.length);
    expect(feed.length).toBe(profiles.length);
  });

  it("does not rank the whole For you feed by followers desc", () => {
    const profiles = Array.from({ length: 10 }, (_, index) =>
      card({
        id: `p${index}`,
        displayName: `Person ${index}`,
        followersCount: index * 10,
        audienceSize: index * 400,
        editorPick: index === 0,
        completeness: 80,
      }),
    );
    const byFollowers = [...profiles].sort((a, b) => b.followersCount - a.followersCount).map((item) => item.id);
    const mixed = mixDiscoverFeed(profiles, ["saas"]).map((item) => item.id);
    expect(mixed).not.toEqual(byFollowers);
  });

  it("puts followed people after people you do not follow", () => {
    const profiles = [
      card({ id: "a", displayName: "A", followedByMe: true, followersCount: 40 }),
      card({ id: "b", displayName: "B", followedByMe: false, followersCount: 1 }),
      card({ id: "c", displayName: "C", followedByMe: false, followersCount: 2 }),
    ];
    const mixed = mixDiscoverFeed(profiles, ["saas"]);
    const firstFollowed = mixed.findIndex((item) => item.followedByMe);
    const lastUnfollowed = mixed.map((item) => item.followedByMe).lastIndexOf(false);
    expect(firstFollowed).toBeGreaterThan(lastUnfollowed);
  });

  it("rotates roles inside a niche instead of stacking the same type", () => {
    const profiles = [
      ...["f1", "f2", "f3"].map((id) => card({ id, displayName: id, profileType: "founder" })),
      ...["c1", "c2"].map((id) => card({ id, displayName: id, profileType: "creator" })),
      ...["o1", "o2"].map((id) => card({ id, displayName: id, profileType: "operator" })),
    ];
    const mixed = mixNicheFeed(profiles);
    expect(new Set(mixed.slice(0, 3).map((item) => item.profileType)).size).toBeGreaterThan(1);
  });

  it("assigns Rising and New sparingly", () => {
    const profiles = Array.from({ length: 20 }, (_, index) =>
      card({
        id: `p${index}`,
        displayName: `Person ${index}`,
        completeness: 80,
        createdAt: daysAgo(index < 4 ? 3 : 40),
        followersCount: index < 6 ? 1 : 8,
        audienceSize: 400,
      }),
    );
    const badged = assignDiscoveryBadges(profiles);
    const rising = badged.filter((item) => item.discoveryBadge === "rising").length;
    const fresh = badged.filter((item) => item.discoveryBadge === "new").length;
    expect(rising + fresh).toBeLessThan(badged.length / 2);
    expect(fresh).toBeGreaterThan(0);
    expect(rising).toBeGreaterThan(0);
  });
});

describe("discovery filters", () => {
  it("parses Switzerland + under-5k + 18-20 from the URL", () => {
    const filters = parseExploreFilters({
      niche: "saas",
      location: "Switzerland",
      audience: "under-5k",
      age: "18-20",
    });
    expect(filters).toMatchObject({
      niche: "saas",
      location: "Switzerland",
      audience: "under-5k",
      age: "18-20",
    });
    expect(exploreHref(filters)).toContain("niche=saas");
    expect(exploreHref(filters)).toContain("audience=under-5k");
    expect(exploreHref(filters)).toContain("age=18-20");
  });

  it("keeps small Swiss SaaS builders and drops everyone else", () => {
    const birth = new Date();
    birth.setFullYear(birth.getFullYear() - 19);
    const profiles = [
      card({
        id: "priya",
        displayName: "Priya",
        country: "Switzerland",
        location: "Basel",
        audienceSize: 820,
        birthDate: birth.toISOString().slice(0, 10),
        categorySlugs: ["saas"],
        profileType: "builder",
      }),
      card({
        id: "maya",
        displayName: "Maya",
        country: "Singapore",
        audienceSize: 2400,
        categorySlugs: ["saas"],
      }),
      card({
        id: "elise",
        displayName: "Elise",
        country: "Switzerland",
        audienceSize: 9800,
        categorySlugs: ["creators"],
      }),
    ];
    const hits = applyDiscoveryFilters(profiles, {
      niche: "saas",
      location: "Switzerland",
      audience: "under-5k",
      age: "18-20",
    });
    expect(hits.map((item) => item.id)).toEqual(["priya"]);
  });

  it("treats Suisse as Switzerland", () => {
    const profiles = [
      card({ id: "v", displayName: "Valentin", country: "Suisse", categorySlugs: ["saas"] }),
      card({ id: "m", displayName: "Maya", country: "Singapore", categorySlugs: ["saas"] }),
    ];
    expect(applyDiscoveryFilters(profiles, { location: "Switzerland" }).map((item) => item.id)).toEqual(["v"]);
  });

  it("never creates an under-18 age filter", () => {
    const filters = parseExploreFilters({ age: "16-17" });
    expect(filters.age).toBeNull();
  });
});
