import { DEFAULT_PRIMARY, normalizeHexColor } from "@/src/lib/public-page/colors";
import { formatOpeningHoursLines, getDefaultOpeningHours, type OpeningHours } from "@/src/lib/utils";

export type StorefrontIdentity = {
  restaurantId: string;
  name: string;
  slug: string;
  displayName: string;
  tagline: string;
  description: string;
  category: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  websiteUrl: string;
  logoUrl: string;
  coverUrl: string;
  primaryColor: string;
  instagramUrl: string;
  facebookUrl: string;
  googleMapsUrl: string;
  openingHours: OpeningHours;
  hoursLines: string[];
  galleryUrls: string[];
};

export function mapsSearchUrl(address: string): string | null {
  const trimmed = address.trim();
  if (!trimmed) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trimmed)}`;
}

export function identityFromRows(input: {
  restaurantId: string;
  name: string;
  slug: string;
  displayName?: string | null;
  tagline?: string | null;
  description?: string | null;
  category?: string | null;
  address?: string | null;
  city?: string | null;
  phone?: string | null;
  email?: string | null;
  websiteUrl?: string | null;
  logoUrl?: string | null;
  coverUrl?: string | null;
  bannerUrl?: string | null;
  primaryColor?: string | null;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  googleMapsUrl?: string | null;
  openingHours?: OpeningHours | null;
  galleryUrls?: string[] | null;
}): StorefrontIdentity {
  const address = [input.address?.trim(), input.city?.trim()].filter(Boolean).join(", ");
  const hours = input.openingHours ?? getDefaultOpeningHours();
  return {
    restaurantId: input.restaurantId,
    name: input.name,
    slug: input.slug,
    displayName: input.displayName?.trim() || input.name,
    tagline: input.tagline?.trim() || "",
    description: input.description?.trim() || "",
    category: input.category?.trim() || "",
    address: input.address?.trim() || "",
    city: input.city?.trim() || "",
    phone: input.phone?.trim() || "",
    email: input.email?.trim() || "",
    websiteUrl: input.websiteUrl?.trim() || "",
    logoUrl: input.logoUrl?.trim() || "",
    coverUrl: input.coverUrl?.trim() || input.bannerUrl?.trim() || "",
    primaryColor: normalizeHexColor(input.primaryColor ?? "", DEFAULT_PRIMARY),
    instagramUrl: input.instagramUrl?.trim() || "",
    facebookUrl: input.facebookUrl?.trim() || "",
    googleMapsUrl: input.googleMapsUrl?.trim() || mapsSearchUrl(address) || "",
    openingHours: hours,
    hoursLines: formatOpeningHoursLines(hours),
    galleryUrls: (input.galleryUrls ?? []).map((url) => url.trim()).filter(Boolean).slice(0, 8),
  };
}
