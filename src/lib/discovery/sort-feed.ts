import { assignDiscoveryBadges, mixDiscoverFeed, mixNicheFeed } from "@/src/lib/discovery/mix";
import { sortByRising } from "@/src/lib/discovery/scoring";
import type { ActivityFilter } from "@/src/lib/discovery/constants";
import type { ExploreFilters, ProfileCardModel } from "@/src/lib/discovery/types";

export function sortDiscoveryFeed(
  profiles: ProfileCardModel[],
  activity: ExploreFilters["activity"],
  favoriteSlugs: string[],
  niche?: string | null,
): ProfileCardModel[] {
  const sort = (activity === "recently-active" ? "recommended" : activity) as ActivityFilter | null;
  if (sort === "new") {
    return assignDiscoveryBadges([...profiles].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)));
  }
  if (sort === "most-followed") {
    return assignDiscoveryBadges([...profiles].sort((a, b) => b.followersCount - a.followersCount));
  }
  if (sort === "rising") return assignDiscoveryBadges(sortByRising(profiles));
  if (niche) return mixNicheFeed(profiles);
  return mixDiscoverFeed(profiles, favoriteSlugs);
}

export function relaxExploreFilters(filters: ExploreFilters): ExploreFilters[] {
  const steps: ExploreFilters[] = [];
  if (filters.age) steps.push({ ...filters, age: null });
  if (filters.audience) steps.push({ ...filters, audience: null, age: null });
  if (filters.location) steps.push({ ...filters, location: null, audience: null, age: null });
  if (filters.profileType) {
    steps.push({ ...filters, profileType: null, location: filters.location, audience: null, age: null });
  }
  if (filters.platform) steps.push({ ...filters, platform: null, age: null });
  return steps;
}
