import { sortByRising } from "@/src/lib/discovery/scoring";
import type { ProfileCardModel } from "@/src/lib/discovery/types";

function daysSince(iso: string) {
  return (Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24);
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
  const pool = inWorld.length ? [...inWorld, ...outside.slice(0, Math.min(10, outside.length))] : profiles;

  const featured = pool.filter((profile) => profile.editorPick || profile.isFeatured);
  const fresh = pool.filter((profile) => daysSince(profile.createdAt) <= 21);
  const quiet = pool.filter((profile) => profile.followersCount <= 3);
  const rising = sortByRising(pool);
  const popular = [...pool].sort((a, b) => b.followersCount - a.followersCount).slice(0, 10);

  const buckets = [featured, quiet, fresh, rising, popular];
  const pointers = buckets.map(() => 0);
  const seen = new Set<string>();
  const feed: ProfileCardModel[] = [];
  const pattern = [0, 1, 2, 3, 0, 1, 4, 2];

  let guard = 0;
  while (feed.length < Math.min(80, pool.length) && guard < 400) {
    const bucket = buckets[pattern[guard % pattern.length]];
    const index = pointers[pattern[guard % pattern.length]];
    pointers[pattern[guard % pattern.length]] += 1;
    const candidate = bucket[index];
    if (candidate && !seen.has(candidate.id)) {
      seen.add(candidate.id);
      feed.push(candidate);
    }
    guard += 1;
  }

  for (const profile of pool) {
    if (!seen.has(profile.id)) feed.push(profile);
  }

  return feed;
}
