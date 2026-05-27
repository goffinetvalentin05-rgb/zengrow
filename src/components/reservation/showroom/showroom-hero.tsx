"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/src/lib/utils";
import { ShowroomSocialProof } from "@/src/components/reservation/showroom/showroom-social-proof";

/** Hero Showroom — composition conversion premium, alignée ZenGrow */
export function ShowroomHero({
  coverImageUrl,
  logoUrl,
  restaurantName,
  tagline,
  cuisineType,
  city,
  googleRating,
  reviewCount,
  showRating = true,
  ctaLabel,
  menuLabel = "Voir le menu",
  menuHref,
  showMenu = true,
  onReserve,
  reserveHref,
  previewMode = false,
  templateMode = "dark",
  footerSlot,
}: {
  coverImageUrl?: string | null;
  logoUrl?: string | null;
  restaurantName: string;
  tagline?: string | null;
  cuisineType?: string | null;
  city?: string | null;
  googleRating?: number | null;
  reviewCount?: number | null;
  showRating?: boolean;
  ctaLabel: string;
  menuLabel?: string;
  menuHref?: string | null;
  showMenu?: boolean;
  onReserve: () => void;
  reserveHref?: string | null;
  previewMode?: boolean;
  templateMode?: "dark" | "light";
  /** Infos pratiques intégrées en bas du hero */
  footerSlot?: ReactNode;
}) {
  const cover = coverImageUrl?.trim() || null;
  const name = restaurantName.trim();
  const metaParts = [cuisineType?.trim(), city?.trim()].filter(Boolean);
  const metaLine = metaParts.length > 0 ? metaParts.join(" · ") : null;
  const subtitle = tagline?.trim();
  const showSubtitle = Boolean(subtitle && subtitle.toLowerCase() !== name.toLowerCase());
  const hasRating =
    showRating && typeof googleRating === "number" && googleRating >= 1 && reviewCount && reviewCount > 0;
  const isLight = templateMode === "light";
  const menuVisible = showMenu && menuHref?.trim();

  const primaryCtaInner = <span className="zg-showroom-cta-primary__label">{ctaLabel}</span>;

  const primaryCta = reserveHref?.trim() ? (
    <Link href={reserveHref.trim()} className="zg-showroom-cta-primary">
      {primaryCtaInner}
    </Link>
  ) : (
    <button type="button" onClick={onReserve} className="zg-showroom-cta-primary">
      {primaryCtaInner}
    </button>
  );

  const menuControl = menuVisible ? (
    <a
      href={menuHref!.trim()}
      target="_blank"
      rel="noopener noreferrer"
      className="zg-showroom-cta-ghost"
    >
      {menuLabel}
    </a>
  ) : null;

  return (
    <section
      id="accueil"
      className={cn(
        "zg-showroom-hero relative flex w-full flex-col overflow-hidden",
        previewMode ? "min-h-[min(100dvh,760px)]" : "min-h-[100dvh] min-h-dvh",
      )}
    >
      {/* Fond immersif */}
      {cover ? (
        <div className="absolute inset-0">
          <Image
            src={cover}
            alt=""
            fill
            priority
            className="object-cover zg-showroom-hero-media"
            sizes="100vw"
            unoptimized
          />
        </div>
      ) : (
        <div
          className="absolute inset-0 zg-showroom-hero-fallback"
          data-light={isLight ? "true" : undefined}
          aria-hidden
        />
      )}

      {/* Overlays éditoriaux */}
      <div className="zg-showroom-hero-overlay zg-showroom-hero-overlay--base" aria-hidden />
      <div className="zg-showroom-hero-overlay zg-showroom-hero-overlay--vignette" aria-hidden />
      <div className="zg-showroom-hero-overlay zg-showroom-hero-overlay--glow" aria-hidden />

      {/* Contenu centré */}
      <div className="relative z-[1] flex min-h-[inherit] flex-1 flex-col">
        <div
          className={cn(
            "flex flex-1 flex-col items-center justify-center px-5",
            "pt-[max(2.75rem,env(safe-area-inset-top))]",
            footerSlot ? "pb-6" : "pb-[max(2rem,env(safe-area-inset-bottom))]",
          )}
        >
          <div className="zg-showroom-hero-stack">
            {logoUrl?.trim() ? (
              <div className="zg-showroom-hero-logo">
                <Image
                  src={logoUrl.trim()}
                  alt=""
                  width={160}
                  height={48}
                  className="h-10 w-auto max-w-[9rem] object-contain sm:h-11 sm:max-w-[10rem]"
                  priority
                  unoptimized
                />
              </div>
            ) : null}

            {name ? (
              <h1 className="zg-showroom-hero-title" style={{ fontFamily: "var(--heading-font), Georgia, serif" }}>
                {name}
              </h1>
            ) : null}

            {metaLine ? (
              <p className="zg-showroom-hero-meta" style={{ fontFamily: "var(--body-font), system-ui, sans-serif" }}>
                {metaLine}
              </p>
            ) : null}

            {hasRating ? (
              <ShowroomSocialProof
                googleRating={googleRating!}
                reviewCount={reviewCount!}
                className="zg-showroom-hero-proof"
              />
            ) : null}

            {showSubtitle ? (
              <p className="zg-showroom-hero-tagline" style={{ fontFamily: "var(--body-font), system-ui, sans-serif" }}>
                {subtitle}
              </p>
            ) : null}

            <div className="zg-showroom-hero-actions">
              <div className="zg-showroom-hero-cta-wrap">{primaryCta}</div>
              {menuControl ? <div className="zg-showroom-hero-menu-wrap">{menuControl}</div> : null}
            </div>
          </div>
        </div>

        {footerSlot ? (
          <div className="zg-showroom-hero-footer px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-2">
            {footerSlot}
          </div>
        ) : null}
      </div>

      <div id="showroom-hero-sentinel" className="pointer-events-none absolute bottom-0 h-px w-full opacity-0" aria-hidden />
    </section>
  );
}
