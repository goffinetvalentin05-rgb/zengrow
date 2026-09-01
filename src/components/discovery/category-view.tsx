import { ExploreView } from "@/src/components/discovery/explore-view";
import type { Category, ExploreFilters, ProfileCardModel } from "@/src/lib/discovery/types";

/** Kept so existing imports still type-check. Category pages now render ExploreView. */
export function CategoryView({
  category,
  filters,
  profiles,
  extraLocations,
}: {
  category: Category;
  totalCount: number;
  filters: ExploreFilters;
  profiles: ProfileCardModel[];
  extraLocations: string[];
}) {
  return (
    <ExploreView
      categories={[category]}
      favoriteSlugs={[]}
      filters={{ ...filters, niche: category.slug }}
      initialProfiles={profiles}
      related={[]}
      hasMore={false}
      nextOffset={profiles.length}
      extraLocations={extraLocations}
      source="category"
    />
  );
}
