"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ExternalLink, Maximize2, Monitor, Smartphone } from "lucide-react";
import PublicReservationForm from "@/src/components/reservation/public-reservation-form";
import type { PublicPagePreviewDraft } from "@/src/components/dashboard/public-page-live-preview";
import { googleFontsHref } from "@/src/lib/public-page-fonts";
import type { PublicPageEditorConfig } from "@/src/lib/public-page/editor-config";
import Button from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";

export type ExtendedPreviewDraft = PublicPagePreviewDraft & {
  editorConfig?: PublicPageEditorConfig;
  heroBadgeText?: string;
  heroLayout?: "left" | "center" | "overlay" | "split";
  heroAlign?: "left" | "center" | "right";
  secondaryCtaLabel?: string;
  themeMode?: "light" | "dark" | "auto";
};

type PublicPagePreviewStudioProps = {
  draft: ExtendedPreviewDraft;
  publicPath: string;
  onPublish?: () => void;
  isPublishing?: boolean;
  conversionScore?: number;
  pageStatusLabel?: string;
};

export default function PublicPagePreviewStudio({
  draft,
  publicPath,
  onPublish,
  isPublishing,
  conversionScore,
  pageStatusLabel,
}: PublicPagePreviewStudioProps) {
  const [viewport, setViewport] = useState<"desktop" | "mobile">("desktop");
  const [fullscreen, setFullscreen] = useState(false);
  const inlineScrollRef = useRef<HTMLDivElement | null>(null);
  const fullscreenScrollRef = useRef<HTMLDivElement | null>(null);

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

  // Reset scroll position des aperçus quand on ouvre le plein écran, change de viewport
  // ou modifie la maquette — évite un viewer "déjà scrollé" qui cachait le haut du hero.
  useEffect(() => {
    if (fullscreenScrollRef.current) fullscreenScrollRef.current.scrollTop = 0;
    if (inlineScrollRef.current) inlineScrollRef.current.scrollTop = 0;
  }, [fullscreen, viewport, draft.heroLayout, draft.heroHeight, draft.coverImageUrl]);

  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreen(false);
    };
    window.addEventListener("keydown", onKey);
    // Verrouille le scroll du body en plein écran pour éviter les sauts visuels
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [fullscreen]);

  const previewForm = (
    <PublicReservationForm
      previewMode
      restaurantId={draft.restaurantId}
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
      openingHours={draft.openingHours ?? null}
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
      editorConfig={draft.editorConfig}
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
  );

  const previewViewportHeight =
    viewport === "desktop" ? "h-[min(78vh,760px)]" : "h-[min(78vh,720px)]";

  const previewChrome = (
    <div className={cn("relative isolate overflow-hidden", previewViewportHeight)}>
      <div
        ref={inlineScrollRef}
        className="h-full overflow-x-hidden overflow-y-auto overscroll-contain"
      >
        {previewForm}
      </div>
    </div>
  );

  return (
    <>
      <section className="mt-8 space-y-5 rounded-2xl border border-zg-border bg-zg-surface p-5 md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-xl font-semibold tracking-tight text-zg-fg">Aperçu en direct</h3>
              {pageStatusLabel ? (
                <span className="rounded-full bg-zg-border/60 px-2.5 py-0.5 text-xs font-semibold text-zg-fg">
                  {pageStatusLabel}
                </span>
              ) : null}
              {typeof conversionScore === "number" ? (
                <span className="rounded-full bg-zg-accent/15 px-2.5 py-0.5 text-xs font-semibold text-zg-accent">
                  Conversion {conversionScore}%
                </span>
              ) : null}
            </div>
            <p className="mt-1 max-w-xl text-sm leading-relaxed text-zg-muted">
              Vérifiez le hero, le CTA, la réservation et le bouton sticky en mode mobile avant de publier.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-xl border border-zg-border bg-zg-surface p-1 text-sm font-semibold shadow-sm">
              <button
                type="button"
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-4 py-2.5 transition-colors",
                  viewport === "mobile" ? "bg-zg-accent text-white" : "text-zg-muted hover:bg-zg-card-hover",
                )}
                onClick={() => setViewport("mobile")}
              >
                <Smartphone className="h-4 w-4" />
                Mobile
              </button>
              <button
                type="button"
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-4 py-2.5 transition-colors",
                  viewport === "desktop" ? "bg-zg-accent text-white" : "text-zg-muted hover:bg-zg-card-hover",
                )}
                onClick={() => setViewport("desktop")}
              >
                <Monitor className="h-4 w-4" />
                Desktop
              </button>
            </div>
            <Button type="button" variant="secondary" className="min-h-11" onClick={() => setFullscreen(true)}>
              <Maximize2 className="mr-2 h-4 w-4" />
              Plein écran
            </Button>
            <a href={publicPath} target="_blank" rel="noreferrer">
              <Button type="button" variant="secondary" className="min-h-11">
                <ExternalLink className="mr-2 h-4 w-4" />
                Ouvrir la page
              </Button>
            </a>
          </div>
        </div>

        <div
          className={cn(
            "mx-auto w-full transition-all duration-300",
            viewport === "mobile" ? "max-w-[400px]" : "max-w-none",
          )}
        >
          <div
            className={cn(
              "overflow-hidden rounded-2xl border-2 border-zg-border/80 bg-zg-surface-elevated shadow-xl",
              viewport === "mobile" && "ring-8 ring-zg-border/30",
            )}
          >
            {viewport === "mobile" ? (
              <div className="flex justify-center border-b border-zg-border/60 bg-zg-surface px-3 py-2">
                <div className="h-1.5 w-16 rounded-full bg-zg-border" />
              </div>
            ) : null}
            {previewChrome}
          </div>
        </div>
      </section>

      {fullscreen ? (
        <div className="fixed inset-0 z-[100] flex flex-col bg-[#0a0a0a]/96 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 text-white">
            <p className="truncate font-semibold">
              Aperçu plein écran — {viewport === "desktop" ? "Desktop" : "Mobile"}
            </p>
            <div className="flex items-center gap-2">
              <div className="hidden rounded-xl border border-white/15 bg-white/5 p-1 text-xs font-semibold md:flex">
                <button
                  type="button"
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-colors",
                    viewport === "mobile" ? "bg-white/15 text-white" : "text-white/60 hover:bg-white/10",
                  )}
                  onClick={() => setViewport("mobile")}
                >
                  <Smartphone className="h-3.5 w-3.5" /> Mobile
                </button>
                <button
                  type="button"
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-colors",
                    viewport === "desktop" ? "bg-white/15 text-white" : "text-white/60 hover:bg-white/10",
                  )}
                  onClick={() => setViewport("desktop")}
                >
                  <Monitor className="h-3.5 w-3.5" /> Desktop
                </button>
              </div>
              <Button type="button" variant="secondary" onClick={() => setFullscreen(false)}>
                Fermer (Échap)
              </Button>
            </div>
          </div>
          <div className="flex flex-1 justify-center overflow-hidden p-4 md:p-6">
            <div
              className={cn(
                "relative flex h-full w-full overflow-hidden rounded-xl border border-white/10 bg-zg-surface-elevated shadow-2xl",
                viewport === "mobile" ? "max-w-[420px]" : "max-w-[1400px]",
              )}
            >
              <div
                ref={fullscreenScrollRef}
                className="h-full w-full overflow-x-hidden overflow-y-auto overscroll-contain"
              >
                {previewForm}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
