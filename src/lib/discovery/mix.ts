import { sortByRising } from "@/src/lib/discovery/scoring";
import type { ProfileCardModel } from "@/src/lib/discovery/types";

function daysSince(iso: string) {
  return (Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24);
}

function audienceBand(profile: ProfileCardModel) {
  const size = profile.audienceSize;
  if (size == null || size < 1000) return "small";
  if (size < 5000) return "mid";
  return "large";
}

export function assignDiscoveryBadges(profiles: ProfileCardModel[]): ProfileCardModel[] {
  const badges = new Map<string, "rising" | "new">();
  const newCap = Math.max(0, Math.min(3, Math.floor(profiles.length * 0.08)));
  const risingCap = Math.max(0, Math.min(4, Math.floor(profiles.length * 0.12)));

  const fresh = profiles
    .filter((profile) => daysSince(profile.createdAt) <= 14 && profile.completeness >= 45)
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  for (const profile of fresh.slice(0, newCap)) badges.set(profile.id, "new");

  const rising = sortByRising(profiles).filter(
    (profile) =>
      !badges.has(profile.id) &&
      profile.followersCount < 20 &&
      profile.completeness >= 55 &&
      daysSince(profile.createdAt) < 75 &&
      (profile.audienceSize == null || profile.audienceSize < 8000),
  );
  for (const profile of rising.slice(0, risingCap)) badges.set(profile.id, "rising");

  return profiles.map((profile) => ({
    ...profile,
    discoveryBadge: badges.get(profile.id) ?? null,
  }));
}

function roundRobin(buckets: ProfileCardModel[][]): ProfileCardModel[] {
  const pointers = buckets.map(() => 0);
  const seen = new Set<string>();
  const feed: ProfileCardModel[] = [];
  let guard = 0;
  const total = buckets.reduce((sum, bucket) => sum + bucket.length, 0);
  while (feed.length < total && guard < total * 4) {
    const index = guard % buckets.length;
    const bucket = buckets[index];
    const pointer = pointers[index];
    pointers[index] += 1;
    const candidate = bucket[pointer];
    if (candidate && !seen.has(candidate.id)) {
      seen.add(candidate.id);
      feed.push(candidate);
    }
    guard += 1;
  }
  return feed;
}

/**
 * Explore mix: people from the user's worlds, interleaved so popular
 * accounts never crowd out new / quiet / editorial profiles.
 * Never ranks the whole feed by follower count.
 */
export function mixDiscoverFeed(
  profiles: ProfileCardModel[],
  favoriteSlugs: string[],
): ProfileCardModel[] {
  if (!profiles.length) return [];

  const inWorld = favoriteSlugs.length
    ? profiles.filter((profile) => {
        const slugs = profile.categorySlugs?.length
          ? profile.categorySlugs
          : profile.primaryCategory
            ? [profile.primaryCategory.slug]
            : [];
        return slugs.some((slug) => favoriteSlugs.includes(slug));
      })
    : [];
  const outside = profiles.filter((profile) => !inWorld.some((item) => item.id === profile.id));
  const pool = inWorld.length ? [...inWorld, ...outside.slice(0, Math.min(12, outside.length))] : profiles;

  const featured = pool.filter((profile) => profile.editorPick || profile.isFeatured);
  const fresh = pool.filter((profile) => daysSince(profile.createdAt) <= 21);
  const quiet = pool.filter((profile) => profile.followersCount <= 3 && (profile.audienceSize == null || profile.audienceSize < 5000));
  const rising = sortByRising(pool);
  const small = pool.filter((profile) => audienceBand(profile) === "small");
  const popular = [...pool].sort((a, b) => b.followersCount - a.followersCount).slice(0, 8);

  const buckets = [featured, quiet, fresh, rising, small, popular];
  const mixed = roundRobin(buckets);
  const seen = new Set(mixed.map((profile) => profile.id));
  for (const profile of profiles) {
    if (!seen.has(profile.id)) mixed.push(profile);
  }

  const unfollowed = mixed.filter((profile) => !profile.followedByMe);
  const followed = mixed.filter((profile) => profile.followedByMe);
  return assignDiscoveryBadges([...unfollowed, ...followed]);
}

/** Variety inside a single niche: rotate roles and audience sizes. */
export function mixNicheFeed(profiles: ProfileCardModel[]): ProfileCardModel[] {
  if (!profiles.length) return [];
  const byRole = new Map<string, ProfileCardModel[]>();
  for (const profile of profiles) {
    const key = profile.profileType || "other";
    const list = byRole.get(key) ?? [];
    list.push(profile);
    byRole.set(key, list);
  }
  const roleBuckets = [...byRole.values()].map((list) =>
    [...list].sort((a, b) => {
      const aSmall = audienceBand(a) === "small" ? 0 : 1;
      const bSmall = audienceBand(b) === "small" ? 0 : 1;
      if (aSmall !== bSmall) return aSmall - bSmall;
      return b.completeness - a.completeness;
    }),
  );
  const mixed = roundRobin(roleBuckets);
  const seen = new Set(mixed.map((profile) => profile.id));
  for (const profile of profiles) {
    if (!seen.has(profile.id)) mixed.push(profile);
  }
  return assignDiscoveryBadges(mixed);
}
