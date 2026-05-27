"use client";

import type { CredibilityContent } from "@/src/lib/public-page/premium-content";
import type { OpeningHours } from "@/src/lib/utils";
import { getShowroomTemplate } from "@/src/lib/showroom/templates";
import {
  resolveCtaReassurance,
  resolveShowroomHook,
  resolveShowroomMetaLine,
  resolveShowroomTrustLine,
} from "@/src/lib/showroom/conversion-copy";
import { ShowroomHero } from "@/src/components/reservation/showroom/showroom-hero";
import { ShowroomCompactEssentials } from "@/src/components/reservation/showroom/showroom-compact-essentials";

export type ShowroomConversionPageProps = {
  templateId: string;
  coverImageUrl?: string | null;
  logoUrl?: string | null;
  restaurantName: string;
  tagline?: string | null;
  description?: string | null;
  heroSubtitle?: string | null;
  cuisineType?: string | null;
  city?: string | null;
  openingHours?: OpeningHours | null;
  ctaLabel: string;
  ctaReassurance?: string | null;
  menuLabel?: string;
  menuHref?: string | null;
  menuEnabled?: boolean;
  reservationEnabled?: boolean;
  credibility?: CredibilityContent;
  showRating?: boolean;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  tiktokUrl?: string | null;
  websiteUrl?: string | null;
  previewMode?: boolean;
  onReserve: () => void;
};

export function ShowroomConversionPage({
  templateId,
  coverImageUrl,
  logoUrl,
  restaurantName,
  tagline,
  description,
  heroSubtitle,
  cuisineType,
  city,
  openingHours,
  ctaLabel,
  ctaReassurance,
  menuLabel = "Voir le menu",
  menuHref,
  menuEnabled = true,
  reservationEnabled = true,
  credibility,
  showRating = true,
  instagramUrl,
  facebookUrl,
  tiktokUrl,
  websiteUrl,
  previewMode = false,
  onReserve,
}: ShowroomConversionPageProps) {
  void getShowroomTemplate(templateId);

  const rating = credibility?.googleRating ?? null;
  const reviewCount = credibility?.reviewCount ?? null;
  const metaLine = resolveShowroomMetaLine(cuisineType, city);
  const marketingHook = resolveShowroomHook({
    description,
    tagline,
    heroSubtitle,
    cuisineType,
    city,
  });
  const reassurance = resolveCtaReassurance(ctaReassurance);
  const { tonightLabel, locationLabel } = resolveShowroomTrustLine({
    openingHours,
    city,
    reservationEnabled,
  });

  const socialFooter =
    instagramUrl?.trim() || facebookUrl?.trim() || tiktokUrl?.trim() || websiteUrl?.trim() ? (
      <ShowroomCompactEssentials
        instagramUrl={instagramUrl}
        facebookUrl={facebookUrl}
        tiktokUrl={tiktokUrl}
        websiteUrl={websiteUrl}
      />
    ) : null;

  return (
    <ShowroomHero
      coverImageUrl={coverImageUrl}
      logoUrl={logoUrl}
      restaurantName={restaurantName}
      metaLine={metaLine}
      marketingHook={marketingHook}
      googleRating={rating}
      reviewCount={reviewCount}
      showRating={showRating}
      ctaLabel={ctaLabel}
      ctaReassurance={reassurance}
      menuLabel={menuLabel}
      menuHref={menuHref}
      showMenu={menuEnabled && Boolean(menuHref?.trim())}
      tonightLabel={tonightLabel}
      locationLabel={locationLabel}
      onReserve={onReserve}
      previewMode={previewMode}
      trustFooter={socialFooter}
    />
  );
}
