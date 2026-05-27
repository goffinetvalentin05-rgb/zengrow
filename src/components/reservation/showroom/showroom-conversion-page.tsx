"use client";

import type { CredibilityContent } from "@/src/lib/public-page/premium-content";
import { getShowroomTemplate } from "@/src/lib/showroom/templates";
import { ShowroomHero } from "@/src/components/reservation/showroom/showroom-hero";
import { ShowroomCompactEssentials } from "@/src/components/reservation/showroom/showroom-compact-essentials";

export type ShowroomConversionPageProps = {
  templateId: string;
  coverImageUrl?: string | null;
  logoUrl?: string | null;
  restaurantName: string;
  tagline?: string | null;
  cuisineType?: string | null;
  city?: string | null;
  hoursSummary?: string | null;
  address?: string | null;
  ctaLabel: string;
  menuLabel?: string;
  menuHref?: string | null;
  menuEnabled?: boolean;
  credibility?: CredibilityContent;
  showRating?: boolean;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  tiktokUrl?: string | null;
  websiteUrl?: string | null;
  googleMapsUrl?: string | null;
  previewMode?: boolean;
  onReserve: () => void;
};

/** Page Showroom — une seule vue plein écran, sans sections ni footer */
export function ShowroomConversionPage({
  templateId,
  coverImageUrl,
  logoUrl,
  restaurantName,
  tagline,
  cuisineType,
  city,
  hoursSummary,
  address,
  ctaLabel,
  menuLabel = "Voir le menu",
  menuHref,
  menuEnabled = true,
  credibility,
  showRating = true,
  instagramUrl,
  facebookUrl,
  tiktokUrl,
  websiteUrl,
  googleMapsUrl,
  previewMode = false,
  onReserve,
}: ShowroomConversionPageProps) {
  const template = getShowroomTemplate(templateId);
  const rating = credibility?.googleRating ?? null;
  const reviewCount = credibility?.reviewCount ?? null;

  return (
    <ShowroomHero
      coverImageUrl={coverImageUrl}
      logoUrl={logoUrl}
      restaurantName={restaurantName}
      tagline={tagline}
      cuisineType={cuisineType}
      city={city}
      googleRating={rating}
      reviewCount={reviewCount}
      showRating={showRating}
      ctaLabel={ctaLabel}
      menuLabel={menuLabel}
      menuHref={menuHref}
      showMenu={menuEnabled && Boolean(menuHref?.trim())}
      onReserve={onReserve}
      previewMode={previewMode}
      templateMode={template.mode}
      essentialsSlot={
        <ShowroomCompactEssentials
          hoursSummary={hoursSummary}
          city={city}
          address={address}
          googleMapsUrl={googleMapsUrl}
          instagramUrl={instagramUrl}
          facebookUrl={facebookUrl}
          tiktokUrl={tiktokUrl}
          websiteUrl={websiteUrl}
        />
      }
    />
  );
}
