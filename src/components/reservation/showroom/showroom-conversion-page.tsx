"use client";

import type { CredibilityContent } from "@/src/lib/public-page/premium-content";
import type { MenuOfferItem } from "@/src/lib/public-page/premium-content";
import { getShowroomTemplate } from "@/src/lib/showroom/templates";
import { ShowroomHero } from "@/src/components/reservation/showroom/showroom-hero";
import { ShowroomPrimaryCta } from "@/src/components/reservation/showroom/showroom-primary-cta";
import { ShowroomQuickInfo } from "@/src/components/reservation/showroom/showroom-quick-info";
import { ShowroomAmbiance } from "@/src/components/reservation/showroom/showroom-ambiance";
import { ShowroomGallery } from "@/src/components/reservation/showroom/showroom-gallery";
import { ShowroomMenu } from "@/src/components/reservation/showroom/showroom-menu";
import { ShowroomHighlights } from "@/src/components/reservation/showroom/showroom-trust";
import { ShowroomFooter } from "@/src/components/reservation/showroom/showroom-footer";

export type ShowroomConversionPageProps = {
  templateId: string;
  coverImageUrl?: string | null;
  logoUrl?: string | null;
  restaurantName: string;
  tagline?: string | null;
  description?: string | null;
  cuisineType?: string | null;
  city?: string | null;
  address?: string | null;
  phone?: string | null;
  hoursSummary?: string | null;
  ctaLabel: string;
  secondaryMenuLabel?: string;
  menuHref?: string | null;
  galleryImages: string[];
  highlights?: string[];
  menuOffers?: MenuOfferItem[];
  menuEnabled?: boolean;
  galleryEnabled?: boolean;
  ambianceEnabled?: boolean;
  highlightsEnabled?: boolean;
  credibility?: CredibilityContent;
  showRating?: boolean;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  tiktokUrl?: string | null;
  websiteUrl?: string | null;
  googleMapsUrl?: string | null;
  showPoweredBy?: boolean;
  showHours?: boolean;
  showAddress?: boolean;
  showPhone?: boolean;
  restaurantSlug?: string | null;
  useDedicatedReservePage?: boolean;
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
  cuisineType,
  city,
  address,
  phone,
  hoursSummary,
  ctaLabel,
  secondaryMenuLabel = "Voir le menu",
  menuHref,
  galleryImages,
  highlights = [],
  menuOffers = [],
  menuEnabled = true,
  galleryEnabled = true,
  ambianceEnabled = true,
  highlightsEnabled = true,
  credibility,
  showRating = true,
  instagramUrl,
  facebookUrl,
  tiktokUrl,
  websiteUrl,
  googleMapsUrl,
  showPoweredBy = true,
  showHours = true,
  showAddress = true,
  showPhone = true,
  restaurantSlug,
  useDedicatedReservePage = true,
  previewMode = false,
  onReserve,
}: ShowroomConversionPageProps) {
  const template = getShowroomTemplate(templateId);
  const reserveHref =
    useDedicatedReservePage && restaurantSlug && !previewMode
      ? `/r/${restaurantSlug}/reserver`
      : undefined;

  const scrollToMenu = () => {
    document.getElementById("menu")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const ambianceText =
    description?.trim() ||
    tagline?.trim() ||
    "";

  const rating = credibility?.googleRating ?? null;
  const reviewCount = credibility?.reviewCount ?? null;

  return (
    <>
      <ShowroomHero
        coverImageUrl={coverImageUrl}
        logoUrl={logoUrl}
        restaurantName={restaurantName}
        tagline={tagline}
        cuisineType={cuisineType}
        city={city}
        address={address}
        googleRating={rating}
        reviewCount={reviewCount}
        showRating={showRating}
        previewMode={previewMode}
        templateMode={template.mode}
      />

      <ShowroomPrimaryCta
        label={ctaLabel}
        onReserve={onReserve}
        reserveHref={reserveHref}
      />

      <ShowroomQuickInfo
        hoursSummary={hoursSummary}
        menuLabel={secondaryMenuLabel}
        menuHref={menuHref}
        onMenuClick={menuHref ? undefined : scrollToMenu}
        address={address}
        city={city}
        phone={phone}
        googleMapsUrl={googleMapsUrl}
        instagramUrl={instagramUrl}
        facebookUrl={facebookUrl}
        tiktokUrl={tiktokUrl}
        websiteUrl={websiteUrl}
        showHours={showHours}
        showMenu={menuEnabled}
        showAddress={showAddress}
        showPhone={showPhone}
      />

      {highlightsEnabled && highlights.length > 0 ? (
        <ShowroomHighlights highlights={highlights} />
      ) : null}

      {ambianceEnabled && ambianceText ? (
        <ShowroomAmbiance body={ambianceText} />
      ) : null}

      {galleryEnabled && galleryImages.length > 0 ? (
        <ShowroomGallery images={galleryImages} />
      ) : null}

      {menuEnabled && (menuOffers.length > 0 || menuHref) ? (
        <ShowroomMenu
          offers={menuOffers}
          menuHref={menuHref}
          menuPdfLabel={secondaryMenuLabel}
          onReserve={onReserve}
        />
      ) : null}

      <ShowroomFooter
        address={address || city}
        instagramUrl={instagramUrl}
        facebookUrl={facebookUrl}
        tiktokUrl={tiktokUrl}
        websiteUrl={websiteUrl}
        showPoweredBy={showPoweredBy}
      />
    </>
  );
}
