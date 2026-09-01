"use client";

import { DiscoveryFiltersSheet } from "@/src/components/discovery/explore-filters";
import { categoryDiscoveryHref } from "@/src/lib/discovery/filters";
import type { ExploreFilters } from "@/src/lib/discovery/types";

export function CategoryFilters({
  slug,
  filters,
  extraLocations = [],
}: {
  slug: string;
  filters: ExploreFilters;
  extraLocations?: string[];
}) {
  return (
    <DiscoveryFiltersSheet
      filters={{ ...filters, niche: slug }}
      extraLocations={extraLocations}
      hrefFor={(next) => categoryDiscoveryHref(slug, next)}
    />
  );
}
