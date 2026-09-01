import {
  ACTIVITY_FILTERS,
  AGE_RANGES,
  AUDIENCE_RANGES,
  PROFILE_TYPES,
  SOCIAL_PLATFORMS,
  type ActivityFilter,
} from "@/src/lib/discovery/constants";
import { DISCOVERY_ROUTES, categoryHref } from "@/src/lib/discovery/routes";
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
  const rawActivity = get("sort") || get("activity");
  const activity =
    rawActivity === "recently-active"
      ? "recommended"
      : ACTIVITY_FILTERS.includes(rawActivity as ActivityFilter)
        ? (rawActivity as ActivityFilter)
        : null;
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
    activity,
    audience: AUDIENCE_RANGES.some((item) => item.id === audience) ? audience : null,
    age: AGE_RANGES.some((item) => item.id === age) ? age : null,
  };
}

export function countActiveFilters(filters: ExploreFilters) {
  return [filters.location, filters.profileType, filters.age, filters.audience, filters.platform, filters.activity]
    .filter(Boolean)
    .length;
}

export function discoverySearchParams(filters: ExploreFilters) {
  const params = new URLSearchParams();
  if (filters.niche) params.set("niche", filters.niche);
  if (filters.location) params.set("location", filters.location);
  if (filters.profileType) params.set("type", filters.profileType);
  if (filters.age) params.set("age", filters.age);
  if (filters.audience) params.set("audience", filters.audience);
  if (filters.platform) params.set("platform", filters.platform);
  if (filters.activity) params.set("sort", filters.activity);
  return params;
}

export function exploreHref(filters: ExploreFilters) {
  const qs = discoverySearchParams(filters).toString();
  return qs ? `${DISCOVERY_ROUTES.explore}?${qs}` : DISCOVERY_ROUTES.explore;
}

export function categoryDiscoveryHref(slug: string, filters: ExploreFilters) {
  const params = discoverySearchParams({ ...filters, niche: null });
  const qs = params.toString();
  return qs ? `${categoryHref(slug)}?${qs}` : categoryHref(slug);
}

export function feedQueryString(filters: ExploreFilters, offset: number, limit: number) {
  const params = discoverySearchParams(filters);
  params.set("offset", String(offset));
  params.set("limit", String(limit));
  return params.toString();
}
