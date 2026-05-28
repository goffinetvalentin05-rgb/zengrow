"use client";



import type { CredibilityContent } from "@/src/lib/public-page/premium-content";

import type { OpeningHours } from "@/src/lib/utils";

import { getShowroomTemplate } from "@/src/lib/showroom/templates";

import {

  resolveCtaReassurance,

  resolveShowroomActionLine,

  resolveShowroomAvailabilityDisplay,

  resolveShowroomPromiseLine,

} from "@/src/lib/showroom/conversion-copy";

import { ShowroomHero } from "@/src/components/reservation/showroom/showroom-hero";



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

  googleMapsUrl?: string | null;

  address?: string | null;

  previewMode?: boolean;

  onReserve: () => void;

};



function resolveDirectionsUrl(googleMapsUrl?: string | null, address?: string | null): string | null {

  const maps = googleMapsUrl?.trim();

  if (maps) return maps;

  const addr = address?.trim();

  if (!addr) return null;

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}`;

}



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

  googleMapsUrl,

  address,

  previewMode = false,

  onReserve,

}: ShowroomConversionPageProps) {

  void getShowroomTemplate(templateId);



  const rating = credibility?.googleRating ?? null;

  const reviewCount = credibility?.reviewCount ?? null;

  const promiseLine = resolveShowroomPromiseLine(cuisineType, city);

  const actionLine = resolveShowroomActionLine({

    description,

    tagline,

    heroSubtitle,

    city,

  });

  const reassurance = resolveCtaReassurance(ctaReassurance);

  const availability = resolveShowroomAvailabilityDisplay({

    openingHours,

    reservationEnabled,

  });

  const directionsUrl = resolveDirectionsUrl(googleMapsUrl, address);



  return (

    <ShowroomHero

      coverImageUrl={coverImageUrl}

      logoUrl={logoUrl}

      restaurantName={restaurantName}

      promiseLine={promiseLine}

      actionLine={actionLine}

      googleRating={rating}

      reviewCount={reviewCount}

      showRating={showRating}

      ctaLabel={ctaLabel}

      ctaReassurance={reassurance}

      menuLabel={menuLabel}

      menuHref={menuHref}

      showMenu={menuEnabled && Boolean(menuHref?.trim())}

      availability={availability}

      instagramUrl={instagramUrl}

      facebookUrl={facebookUrl}

      tiktokUrl={tiktokUrl}

      websiteUrl={websiteUrl}

      directionsUrl={directionsUrl}

      previewMode={previewMode}

      onReserve={onReserve}

    />

  );

}

