"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import PublicReservationForm from "@/src/components/reservation/public-reservation-form";
import { googleFontsHref } from "@/src/lib/public-page-fonts";
import { cn, getDefaultOpeningHours, type OpeningHours } from "@/src/lib/utils";

export type PublicPagePreviewDraft = {
  restaurantId: string;
  slug: string;
  displayName: string;
  heroTitle?: string;
  tagline: string;
  cuisineType?: string | null;
  city?: string | null;
  highlights?: string[];
  specialMessage?: string | null;
  menuUrl?: string | null;
  reservationEnabled?: boolean;
  preBookingMessage?: string | null;
  showHoursBeforeForm?: boolean;
  showPhoneCta?: boolean;
  openingHours?: OpeningHours;
  publicDescription: string;
  logoUrl: string;
  coverImageUrl: string;
  pageBackgroundColor: string;
  heroPrimaryColor: string;
  buttonBgColor: string;
  buttonTextColor: string;
  headingTextColor: string;
  bodyTextColor: string;
  accentColor: string;
  footerBgColor: string;
  footerTextColor: string;
  headingFont: string;
  bodyFont: string;
  heroTitleSizePx: number;
  heroHeight: "compact" | "normal" | "tall";
  heroOverlayEnabled: boolean;
  heroOverlayOpacity: number;
  ctaLabel: string;
  borderRadius: "sharp" | "rounded" | "pill";
  buttonStyle: "filled" | "outlined" | "ghost";
  cardStyle: "flat" | "elevated" | "bordered";
  fontSizeScale: "small" | "medium" | "large";
  phone: string;
  address: string;
  email: string;
  websiteUrl: string;
  instagramUrl: string;
  facebookUrl: string;
  googleMapsUrl: string;
  showPublicAddress: boolean;
  showPublicPhone: boolean;
  showPublicEmail: boolean;
  showPublicWebsite: boolean;
  showPublicOpeningHours: boolean;
  showPublicInstagram: boolean;
  showPublicFacebook: boolean;
  showPublicGoogleMaps: boolean;
  documents: { id: string; label: string; fileUrl: string; position: number }[];
  galleryImageUrls: string[];
  terraceEnabled?: boolean;
  /** Nombre max de convives (paramètre restaurant). */
  maxPartySize?: number;
  secondaryCtaLabel?: string;
  heroBadgeText?: string;
  heroLayout?: "left" | "center" | "overlay" | "split";
  heroAlign?: "left" | "center" | "right";
  themeMode?: "light" | "dark" | "auto";
  sectionOrder?: string[];
  blocksEnabled?: Record<string, { enabled: boolean }>;
  aboutTitle?: string;
  finalCtaTitle?: string;
  finalCtaSubtitle?: string;
  finalCtaButton?: string;
};

type PublicPageLivePreviewProps = {
  draft: PublicPagePreviewDraft;
  publicPath: string;
};

export default function PublicPageLivePreview({ draft, publicPath }: PublicPageLivePreviewProps) {
  const [viewport, setViewport] = useState<"desktop" | "mobile">("desktop");
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const fontsHref = useMemo(
    () => googleFontsHref([draft.headingFont, draft.bodyFont]),
    [draft.headingFont, draft.bodyFont],
  );

  useEffect(() => {
    if (!fontsHref || typeof document === "undefined") return;
    const id = "public-preview-google-fonts";
    let link = document.getElementById(id) as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
    link.href = fontsHref;
  }, [fontsHref]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [viewport, draft.heroLayout, draft.heroHeight, draft.coverImageUrl]);

  return (
    <div className="rounded-2xl border border-zg-border bg-zg-surface p-4 transition-all duration-200 ease-out">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[var(--foreground)]">Aperçu en direct</p>
          <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
            Rendu identique à la page publique (sans enregistrement).{" "}
            <span className="font-mono text-[11px]">{publicPath}</span>
          </p>
        </div>
        <div className="flex rounded-xl border border-zg-border p-0.5 text-xs font-semibold">
          <button
            type="button"
            className={cn(
              "rounded-lg px-3 py-1.5 transition-colors",
              viewport === "mobile" ? "bg-zg-accent text-white shadow-sm" : "text-zg-text-muted hover:bg-zg-card-hover",
            )}
            onClick={() => setViewport("mobile")}
          >
            Mobile
          </button>
          <button
            type="button"
            className={cn(
              "rounded-lg px-3 py-1.5 transition-colors",
              viewport === "desktop" ? "bg-zg-accent text-white shadow-sm" : "text-zg-text-muted hover:bg-zg-card-hover",
            )}
            onClick={() => setViewport("desktop")}
          >
            Desktop
          </button>
        </div>
      </div>

      <div
        className={cn(
          "mt-4 overflow-hidden rounded-xl border border-zg-border bg-zg-surface-elevated",
          viewport === "mobile" ? "mx-auto max-w-[390px]" : "w-full",
        )}
      >
        <div className="relative isolate h-[min(78vh,720px)] overflow-hidden">
          <div
            ref={scrollRef}
            className="h-full overflow-x-hidden overflow-y-auto overscroll-contain"
          >
          <PublicReservationForm
            previewMode
            restaurantId={draft.restaurantId}
            restaurantSlug={draft.slug}
            restaurantName={draft.displayName.trim() || "Restaurant"}
            heroTitle={draft.heroTitle?.trim() || null}
            restaurantTagline={draft.tagline.trim() || null}
            cuisineType={draft.cuisineType ?? null}
            city={draft.city ?? null}
            highlights={draft.highlights ?? []}
            specialMessage={draft.specialMessage ?? null}
            menuUrl={draft.menuUrl ?? null}
            reservationEnabled={draft.reservationEnabled !== false}
            preBookingMessage={draft.preBookingMessage ?? null}
            showHoursBeforeForm={draft.showHoursBeforeForm !== false}
            showPhoneCta={draft.showPhoneCta !== false}
            publicPageDescription={draft.publicDescription.trim() || null}
            galleryImageUrls={draft.galleryImageUrls}
            documents={draft.documents}
            restaurantPhone={draft.phone.trim() || null}
            restaurantAddress={draft.address.trim() || null}
            restaurantEmail={draft.email.trim() || null}
            allowPhone
            allowEmail
            maxPartySize={Math.max(1, draft.maxPartySize ?? 8)}
            openingHours={draft.openingHours ?? getDefaultOpeningHours()}
            daysInAdvance={60}
            logoUrl={draft.logoUrl.trim() || null}
            coverImageUrl={draft.coverImageUrl.trim() || null}
            pageBackgroundColor={draft.pageBackgroundColor}
            heroPrimaryColor={draft.heroPrimaryColor}
            buttonBgColor={draft.buttonBgColor}
            buttonTextColor={draft.buttonTextColor}
            headingTextColor={draft.headingTextColor}
            bodyTextColor={draft.bodyTextColor}
            accentColor={draft.accentColor}
            footerBgColor={draft.footerBgColor}
            footerTextColor={draft.footerTextColor}
            headingFont={draft.headingFont}
            bodyFont={draft.bodyFont}
            heroTitleSizePx={draft.heroTitleSizePx}
            heroHeight={draft.heroHeight}
            heroOverlayEnabled={draft.heroOverlayEnabled}
            heroOverlayOpacity={draft.heroOverlayOpacity}
            ctaLabel={draft.ctaLabel.trim() || "Réserver une table"}
            secondaryCtaLabel={draft.secondaryCtaLabel}
            heroBadgeText={draft.heroBadgeText}
            heroLayout={draft.heroLayout}
            heroAlign={draft.heroAlign}
            fontSizeScale={draft.fontSizeScale}
            borderRadius={draft.borderRadius}
            buttonStyle={draft.buttonStyle}
            cardStyle={draft.cardStyle}
            showPublicAddress={draft.showPublicAddress}
            showPublicPhone={draft.showPublicPhone}
            showPublicEmail={draft.showPublicEmail}
            showPublicWebsite={draft.showPublicWebsite}
            showPublicOpeningHours={draft.showPublicOpeningHours}
            showPublicInstagram={draft.showPublicInstagram}
            showPublicFacebook={draft.showPublicFacebook}
            showPublicGoogleMaps={draft.showPublicGoogleMaps}
            instagramUrl={draft.instagramUrl.trim() || null}
            facebookUrl={draft.facebookUrl.trim() || null}
            websiteUrl={draft.websiteUrl.trim() || null}
            googleMapsUrl={draft.googleMapsUrl.trim() || null}
            closureStartDate={null}
            closureEndDate={null}
            closureMessage={null}
            terraceEnabled={draft.terraceEnabled ?? false}
          />
          </div>
        </div>
      </div>
    </div>
  );
}
