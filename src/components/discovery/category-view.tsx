import { CategoryFilters } from "@/src/components/discovery/category-filters";
import { PeopleFeed } from "@/src/components/discovery/profile-discovery-card";
import { DiscoveryEmpty } from "@/src/components/discovery/empty-state";
import { DISCOVERY_ROUTES } from "@/src/lib/discovery/routes";
import type { Category, ExploreFilters, ProfileCardModel } from "@/src/lib/discovery/types";

export function CategoryView({
  category,
  totalCount,
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
  const filtered = Boolean(
    filters.location || filters.profileType || filters.age || filters.audience || filters.platform || filters.activity,
  );
  const count = filtered ? profiles.length : totalCount;
  const peopleLabel = count === 1 ? "person" : "people";

  return (
    <div className="pb-8">
      <header className="mx-auto flex w-full max-w-[560px] items-end justify-between gap-4 px-5 md:px-0">
        <div>
          <h1 className="font-[family-name:var(--font-zg-display)] text-[2.6rem] leading-none tracking-tight text-white">
            {category.name}
          </h1>
          <p className="mt-3 text-sm text-white/40">
            {count} {peopleLabel} building in {category.name}
          </p>
        </div>
        <CategoryFilters slug={category.slug} filters={filters} extraLocations={extraLocations} />
      </header>

      <div className="mt-8">
        {profiles.length ? (
          <PeopleFeed profiles={profiles} source="category" />
        ) : (
          <div className="px-5">
            <DiscoveryEmpty
              title="Nobody here yet."
              description={filtered ? "Try clearing a filter." : "Be the first in this world."}
              href={DISCOVERY_ROUTES.explore}
              cta="Back to Discover"
            />
          </div>
        )}
      </div>
    </div>
  );
}
