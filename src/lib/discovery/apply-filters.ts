import { AGE_RANGES, AUDIENCE_RANGES } from "@/src/lib/discovery/constants";
import { geoMatchesFilter } from "@/src/lib/discovery/geo";
import { ageFromBirthDate } from "@/src/lib/discovery/media";
import type { ExploreFilters, ProfileCardModel } from "@/src/lib/discovery/types";

function matchesLocation(card: ProfileCardModel, location: string) {
  if (geoMatchesFilter(card.country, location) || geoMatchesFilter(card.location, location)) return true;
  const combined = `${card.location ?? ""} ${card.country ?? ""}`.trim();
  if (geoMatchesFilter(combined, location)) return true;
  return combined.toLowerCase().includes(location.toLowerCase());
}

export function applyDiscoveryFilters(cards: ProfileCardModel[], filters: ExploreFilters): ProfileCardModel[] {
  return cards.filter((card) => {
    if (filters.niche) {
      const slugs = card.categorySlugs?.length
        ? card.categorySlugs
        : card.primaryCategory
          ? [card.primaryCategory.slug]
          : [];
      if (!slugs.includes(filters.niche)) return false;
    }
    if (filters.location && !matchesLocation(card, filters.location)) return false;
    if (filters.profileType && card.profileType !== filters.profileType) return false;
    if (filters.platform && !card.socialLinks.some((link) => link.platform === filters.platform)) {
      return false;
    }
    if (filters.audience) {
      const range = AUDIENCE_RANGES.find((item) => item.id === filters.audience);
      if (!range || card.audienceSize == null) return false;
      if (card.audienceSize < range.min) return false;
      if (range.max != null && card.audienceSize > range.max) return false;
    }
    if (filters.age) {
      const range = AGE_RANGES.find((item) => item.id === filters.age);
      const age = ageFromBirthDate(card.birthDate);
      if (!range || age == null) return false;
      if (age < range.min) return false;
      if (range.max != null && age > range.max) return false;
    }
    return true;
  });
}

export function droppedFilterHints(filters: ExploreFilters) {
  const hints: { key: keyof ExploreFilters; filter: "age" | "audience" | "location" | "role" | "platform" }[] = [];
  if (filters.age) hints.push({ key: "age", filter: "age" });
  if (filters.audience) hints.push({ key: "audience", filter: "audience" });
  if (filters.location) hints.push({ key: "location", filter: "location" });
  if (filters.profileType) hints.push({ key: "profileType", filter: "role" });
  if (filters.platform) hints.push({ key: "platform", filter: "platform" });
  return hints;
}
