import { CategoryView } from "@/src/components/discovery/category-view";
import { DiscoveryPageChrome } from "@/src/components/discovery/page-chrome";
import { getOptionalDiscoverySession } from "@/src/lib/discovery/auth";
import { parseExploreFilters } from "@/src/lib/discovery/filters";
import {
  getCategoryBySlug,
  getCategoryProfileCounts,
  listCategoryProfiles,
} from "@/src/lib/discovery/queries";
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
  const filters = parseExploreFilters(await searchParams);
  const supabase = await createClient();
  const session = await getOptionalDiscoverySession();
  const category = await getCategoryBySlug(supabase, slug);
  if (!category) notFound();

  const [profiles, counts] = await Promise.all([
    listCategoryProfiles(supabase, slug, filters, session?.profile.id),
    getCategoryProfileCounts(supabase),
  ]);
  const extraLocations = [
    ...new Set(profiles.map((profile) => profile.country).filter((value): value is string => Boolean(value))),
  ];

  return (
    <DiscoveryPageChrome session={session}>
      <CategoryView
        category={category}
        totalCount={counts.get(category.id) ?? profiles.length}
        filters={filters}
        profiles={profiles}
        extraLocations={extraLocations}
      />
    </DiscoveryPageChrome>
  );
}
