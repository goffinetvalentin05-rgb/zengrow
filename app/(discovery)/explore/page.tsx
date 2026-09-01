import { ExploreView } from "@/src/components/discovery/explore-view";
import { requireOnboardedSession } from "@/src/lib/discovery/auth";
import { getCategories, getExplorePayload, getFavoriteCategorySlugs } from "@/src/lib/discovery/queries";
import type { ExploreFilters } from "@/src/lib/discovery/types";
import { PROFILE_TYPES, SOCIAL_PLATFORMS, ACTIVITY_FILTERS, AUDIENCE_RANGES } from "@/src/lib/discovery/constants";
import { createClient } from "@/src/lib/supabase/server";

export const metadata = {
  title: "Explore",
};

function parseFilters(sp: Record<string, string | string[] | undefined>): ExploreFilters {
  const get = (key: string) => {
    const value = sp[key];
    return Array.isArray(value) ? value[0] : value;
  };
  const type = get("type");
  const platform = get("platform");
  const activity = get("activity");
  const audience = get("audience");
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
  };
}

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireOnboardedSession();
  const sp = await searchParams;
  const filters = parseFilters(sp);
  const supabase = await createClient();
  const [categories, favoriteSlugs] = await Promise.all([
    getCategories(supabase),
    getFavoriteCategorySlugs(supabase, session.profile.id),
  ]);
  const payload = await getExplorePayload(supabase, {
    viewer: session.profile,
    favoriteSlugs,
    filters,
    viewerLocation: session.profile.location || session.profile.country,
  });

  return (
    <ExploreView
      firstName={session.profile.displayName.split(" ")[0] ?? ""}
      categories={categories}
      favoriteSlugs={favoriteSlugs}
      filters={filters}
      rising={payload.rising}
      newProfiles={payload.newProfiles}
      worthDiscovering={payload.worthDiscovering}
      popular={payload.popular}
      under5k={payload.under5k}
      nearYou={payload.nearYou}
      recentlyJoined={payload.recentlyJoined}
      all={payload.all}
    />
  );
}
