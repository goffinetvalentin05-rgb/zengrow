import { ExploreView } from "@/src/components/discovery/explore-view";
import { requireOnboardedSession } from "@/src/lib/discovery/auth";
import { parseExploreFilters } from "@/src/lib/discovery/filters";
import { getCategories, getDiscoveryFeedPage, getFavoriteCategorySlugs } from "@/src/lib/discovery/queries";
import { createClient } from "@/src/lib/supabase/server";

export const metadata = {
  title: "Explore",
};

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireOnboardedSession();
  const filters = parseExploreFilters(await searchParams);
  const supabase = await createClient();
  const [categories, favoriteSlugs] = await Promise.all([
    getCategories(supabase),
    getFavoriteCategorySlugs(supabase, session.profile.id),
  ]);
  const page = await getDiscoveryFeedPage(supabase, {
    filters,
    favoriteSlugs,
    viewerId: session.profile.id,
  });
  const extraLocations = [
    ...new Set(
      page.profiles
        .concat(page.related)
        .map((profile) => profile.country)
        .filter((value): value is string => Boolean(value)),
    ),
  ];

  return (
    <ExploreView
      categories={categories}
      favoriteSlugs={favoriteSlugs}
      filters={filters}
      initialProfiles={page.profiles}
      related={page.related}
      hasMore={page.hasMore}
      nextOffset={page.nextOffset}
      extraLocations={extraLocations}
      isLoggedIn
      source="explore"
    />
  );
}
