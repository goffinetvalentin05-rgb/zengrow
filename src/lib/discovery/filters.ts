import {
  ACTIVITY_FILTERS,
  AGE_RANGES,
  AUDIENCE_RANGES,
  PROFILE_TYPES,
  SOCIAL_PLATFORMS,
} from "@/src/lib/discovery/constants";
import type { ExploreFilters } from "@/src/lib/discovery/types";

export function parseExploreFilters(
  sp: Record<string, string | string[] | undefined>,
): ExploreFilters {
  const get = (key: string) => {
    const value = sp[key];
    return Array.isArray(value) ? value[0] : value;
  };
  const type = get("type");
  const platform = get("platform");
  const activity = get("activity");
  const audience = get("audience");
  const age = get("age");
  return {
    niche: get("niche") || null,
    location: get("location") || null,
    profileType: PROFILE_TYPES.includes(type as (typeof PROFILE_TYPES)[number])
      ? (type as ExploreFilters["profileType"])
      : null,
    platform: SOCIAL_PLATFORMS.includes(platform as (typeof SOCIAL_PLATFORMS)[number])
      ? (platform as ExploreFilters["platform"])
      : null,
    activity: ACTIVITY_FILTERS.includes(activity as (typeof ACTIVITY_FILTERS)[number])
      ? (activity as ExploreFilters["activity"])
      : null,
    audience: AUDIENCE_RANGES.some((item) => item.id === audience) ? audience : null,
    age: AGE_RANGES.some((item) => item.id === age) ? age : null,
  };
}

export function countActiveFilters(filters: ExploreFilters) {
  return [filters.location, filters.profileType, filters.age, filters.audience, filters.platform].filter(Boolean)
    .length;
}
