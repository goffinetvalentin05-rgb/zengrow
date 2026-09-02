import { ExploreView } from "@/src/components/discovery/explore-view";
import { DiscoveryPageChrome } from "@/src/components/discovery/page-chrome";
import { getOptionalDiscoverySession } from "@/src/lib/discovery/auth";
import { parseExploreFilters } from "@/src/lib/discovery/filters";
import { getCategories, getCategoryBySlug, getDiscoveryFeedPage, getFavoriteCategorySlugs } from "@/src/lib/discovery/queries";
import { createClient } from "@/src/lib/supabase/server";
import { notFound } from "next/navigation";

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const filters = { ...parseExploreFilters(await searchParams), niche: slug };
  const supabase = await createClient();
  const session = await getOptionalDiscoverySession();
  const category = await getCategoryBySlug(supabase, slug);
  if (!category) notFound();

  const favoriteSlugs = session?.profile.id
    ? await getFavoriteCategorySlugs(supabase, session.profile.id)
    : [];
  const [categories, page] = await Promise.all([
    getCategories(supabase),
    getDiscoveryFeedPage(supabase, {
      filters,
      favoriteSlugs,
      viewerId: session?.profile.id,
    }),
  ]);
  const extraLocations = [
    ...new Set(
      page.profiles
        .concat(page.related)
        .map((profile) => profile.country)
        .filter((value): value is string => Boolean(value)),
    ),
  ];

  return (
    <DiscoveryPageChrome session={session}>
      <ExploreView
        categories={categories}
        favoriteSlugs={favoriteSlugs}
        filters={filters}
        initialProfiles={page.profiles}
        related={page.related}
        hasMore={page.hasMore}
        nextOffset={page.nextOffset}
        extraLocations={extraLocations}
        worldPoints={page.worldPoints}
        isLoggedIn={Boolean(session)}
        source="category"
      />
    </DiscoveryPageChrome>
  );
}
