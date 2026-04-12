"use client";

import { useEffect, useMemo, useState } from "react";
import PublicReservationForm from "@/src/components/reservation/public-reservation-form";
import { googleFontsHref } from "@/src/lib/public-page-fonts";
import { cn, getDefaultOpeningHours } from "@/src/lib/utils";

export type PublicPagePreviewDraft = {
  restaurantId: string;
  slug: string;
  displayName: string;
  tagline: string;
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
};

type PublicPageLivePreviewProps = {
  draft: PublicPagePreviewDraft;
  publicPath: string;
};

export default function PublicPageLivePreview({ draft, publicPath }: PublicPageLivePreviewProps) {
  const [viewport, setViewport] = useState<"desktop" | "mobile">("desktop");
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

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[var(--foreground)]">Aperçu en direct</p>
          <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
            Rendu identique à la page publique (sans enregistrement).{" "}
            <span className="font-mono text-[11px]">{publicPath}</span>
          </p>
        </div>
        <div className="flex rounded-lg border border-gray-200 p-0.5 text-xs font-medium">
          <button
            type="button"
            className={cn(
              "rounded-md px-3 py-1.5 transition-colors",
              viewport === "mobile" ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-50",
            )}
            onClick={() => setViewport("mobile")}
          >
            Mobile
          </button>
          <button
            type="button"
            className={cn(
              "rounded-md px-3 py-1.5 transition-colors",
              viewport === "desktop" ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-50",
            )}
            onClick={() => setViewport("desktop")}
          >
            Desktop
          </button>
        </div>
      </div>

      <div
        className={cn(
          "mt-4 overflow-hidden rounded-lg border border-gray-200 bg-gray-100",
          viewport === "mobile" ? "mx-auto max-w-[390px]" : "w-full",
        )}
      >
        <div className="max-h-[min(85vh,820px)] overflow-y-auto overflow-x-hidden">
          <PublicReservationForm
            previewMode
            restaurantId={draft.restaurantId}
            restaurantName={draft.displayName.trim() || "Restaurant"}
            restaurantTagline={draft.tagline.trim() || null}
            publicPageDescription={draft.publicDescription.trim() || null}
            galleryImageUrls={draft.galleryImageUrls}
            documents={draft.documents}
            restaurantPhone={draft.phone.trim() || null}
            restaurantAddress={draft.address.trim() || null}
            restaurantEmail={draft.email.trim() || null}
            allowPhone
            allowEmail
            maxPartySize={8}
            openingHours={getDefaultOpeningHours()}
            daysInAdvance={60}
            useTables={false}
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
            preBookingMessage={null}
            closureStartDate={null}
            closureEndDate={null}
            closureMessage={null}
            terraceEnabled={draft.terraceEnabled ?? false}
          />
        </div>
      </div>
    </div>
  );
}
