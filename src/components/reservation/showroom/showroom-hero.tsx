"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/src/lib/utils";
import { ShowroomSocialProof } from "@/src/components/reservation/showroom/showroom-social-proof";

/**
 * Hero Showroom — scénario conversion : accroche → CTA → preuve → urgence
 */
export function ShowroomHero({
  coverImageUrl,
  logoUrl,
  restaurantName,
  metaLine,
  marketingHook,
  googleRating,
  reviewCount,
  showRating = true,
  ctaLabel,
  ctaReassurance,
  menuLabel = "Voir le menu",
  menuHref,
  showMenu = true,
  tonightLabel,
  locationLabel,
  onReserve,
  reserveHref,
  previewMode = false,
  trustFooter,
}: {
  coverImageUrl?: string | null;
  logoUrl?: string | null;
  restaurantName: string;
  metaLine?: string | null;
  marketingHook?: string | null;
  googleRating?: number | null;
  reviewCount?: number | null;
  showRating?: boolean;
  ctaLabel: string;
  ctaReassurance?: string | null;
  menuLabel?: string;
  menuHref?: string | null;
  showMenu?: boolean;
  tonightLabel?: string | null;
  locationLabel?: string | null;
  onReserve: () => void;
  reserveHref?: string | null;
  previewMode?: boolean;
  trustFooter?: ReactNode;
}) {
  const cover = coverImageUrl?.trim() || null;
  const name = restaurantName.trim();
  const hook = marketingHook?.trim();
  const reassurance = ctaReassurance?.trim() || "Réservation en moins de 30 secondes";
  const hasRating =
    showRating && typeof googleRating === "number" && googleRating >= 1 && reviewCount && reviewCount > 0;
  const menuVisible = showMenu && menuHref?.trim();
  const trustLine = [tonightLabel?.trim(), locationLabel?.trim()].filter(Boolean).join(" · ");

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
        <div className="absolute inset-0 zg-showroom-hero-fallback" aria-hidden />
      )}

      <div className="zg-showroom-hero-overlay zg-showroom-hero-overlay--base" aria-hidden />
      <div className="zg-showroom-hero-overlay zg-showroom-hero-overlay--vignette" aria-hidden />
      <div className="zg-showroom-hero-overlay zg-showroom-hero-overlay--bottom" aria-hidden />
      <div className="zg-showroom-hero-overlay zg-showroom-hero-overlay--cta-glow" aria-hidden />

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

          {hook ? (
            <p className="zg-showroom-hero-hook" style={{ fontFamily: "var(--body-font), system-ui, sans-serif" }}>
              {hook}
            </p>
          ) : null}

          <div className="zg-showroom-cta-zone">
            <div className="zg-showroom-cta-zone-glow" aria-hidden />
            {primaryCta}
            <p className="zg-showroom-cta-reassurance">{reassurance}</p>
          </div>

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

          {hasRating ? (
            <ShowroomSocialProof
              googleRating={googleRating!}
              reviewCount={reviewCount!}
              className="zg-showroom-hero-proof"
            />
          ) : null}

          {trustLine ? <p className="zg-showroom-trust-line">{trustLine}</p> : null}

          {trustFooter ? <div className="zg-showroom-hero-trust-footer">{trustFooter}</div> : null}
        </div>
      </div>

      <div id="showroom-hero-sentinel" className="pointer-events-none absolute bottom-0 h-px w-full opacity-0" aria-hidden />
    </section>
  );
}
