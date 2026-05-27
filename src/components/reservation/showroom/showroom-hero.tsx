"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/src/lib/utils";
import { ShowroomSocialProof } from "@/src/components/reservation/showroom/showroom-social-proof";

/** Hero Showroom — plein écran, contenu centré sur l’image, sans carte glass */
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
  essentialsSlot,
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
  essentialsSlot?: ReactNode;
}) {
  const cover = coverImageUrl?.trim() || null;
  const name = restaurantName.trim();
  const metaParts = [cuisineType?.trim(), city?.trim()].filter(Boolean);
  const metaLine = metaParts.length > 0 ? metaParts.join(" · ") : null;
  const subtitle = tagline?.trim();
  const showSubtitle = Boolean(subtitle && subtitle.toLowerCase() !== name.toLowerCase());
  const hasRating =
    showRating && typeof googleRating === "number" && googleRating >= 1 && reviewCount && reviewCount > 0;
  const menuVisible = showMenu && menuHref?.trim();

  const primaryCta = reserveHref?.trim() ? (
    <Link href={reserveHref.trim()} className="zg-showroom-cta-primary">
      {ctaLabel}
    </Link>
  ) : (
    <button type="button" onClick={onReserve} className="zg-showroom-cta-primary">
      {ctaLabel}
    </button>
  );

  return (
    <section
      id="accueil"
      className={cn(
        "zg-showroom-hero relative flex w-full flex-col overflow-hidden bg-[#06040f]",
        previewMode ? "min-h-[min(100dvh,760px)]" : "min-h-[100dvh] min-h-dvh",
      )}
    >
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
          aria-hidden
        />
      )}

      <div className="zg-showroom-hero-overlay zg-showroom-hero-overlay--base" aria-hidden />
      <div className="zg-showroom-hero-overlay zg-showroom-hero-overlay--vignette" aria-hidden />

      <div
        className={cn(
          "relative z-[1] flex min-h-[inherit] flex-col items-center justify-center px-5 text-center",
          "pt-[max(2.5rem,env(safe-area-inset-top))]",
          "pb-[max(5.5rem,env(safe-area-inset-bottom))]",
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
            {primaryCta}
            {menuVisible ? (
              <a
                href={menuHref!.trim()}
                target="_blank"
                rel="noopener noreferrer"
                className="zg-showroom-cta-menu-link"
              >
                {menuLabel}
              </a>
            ) : null}
          </div>

          {essentialsSlot ? <div className="zg-showroom-hero-essentials-slot">{essentialsSlot}</div> : null}
        </div>
      </div>

      <div id="showroom-hero-sentinel" className="pointer-events-none absolute bottom-0 h-px w-full opacity-0" aria-hidden />
    </section>
  );
}
