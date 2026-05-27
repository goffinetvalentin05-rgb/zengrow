"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/src/lib/utils";
import type { ShowroomAvailability } from "@/src/lib/public-page/showroom-availability";
import { ShowroomSocialProof } from "@/src/components/reservation/showroom/showroom-social-proof";
import { ShowroomAvailabilityBadge } from "@/src/components/reservation/showroom/showroom-availability-badge";
import { ShowroomSocialIcons } from "@/src/components/reservation/showroom/showroom-social-icons";

/**
 * Hero Showroom — landing conversion : promesse → action → CTA → preuve
 */
export function ShowroomHero({
  coverImageUrl,
  logoUrl,
  restaurantName,
  promiseLine,
  actionLine,
  googleRating,
  reviewCount,
  showRating = true,
  ctaLabel,
  ctaReassurance,
  menuLabel = "Voir le menu",
  menuHref,
  showMenu = true,
  availability,
  instagramUrl,
  facebookUrl,
  tiktokUrl,
  websiteUrl,
  directionsUrl,
  onReserve,
  reserveHref,
  previewMode = false,
}: {
  coverImageUrl?: string | null;
  logoUrl?: string | null;
  restaurantName: string;
  promiseLine?: string | null;
  actionLine: string;
  googleRating?: number | null;
  reviewCount?: number | null;
  showRating?: boolean;
  ctaLabel: string;
  ctaReassurance?: string | null;
  menuLabel?: string;
  menuHref?: string | null;
  showMenu?: boolean;
  availability?: ShowroomAvailability | null;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  tiktokUrl?: string | null;
  websiteUrl?: string | null;
  directionsUrl?: string | null;
  onReserve: () => void;
  reserveHref?: string | null;
  previewMode?: boolean;
}) {
  const cover = coverImageUrl?.trim() || null;
  const name = restaurantName.trim();
  const promise = promiseLine?.trim();
  const action = actionLine.trim();
  const reassurance = ctaReassurance?.trim() || "Confirmation rapide · choix de l'horaire en ligne";
  const hasRating =
    showRating && typeof googleRating === "number" && googleRating >= 1 && reviewCount && reviewCount > 0;
  const menuVisible = showMenu && menuHref?.trim();
  const hasTrustStack =
    hasRating ||
    Boolean(availability?.headline) ||
    Boolean(
      instagramUrl?.trim() ||
        facebookUrl?.trim() ||
        tiktokUrl?.trim() ||
        websiteUrl?.trim() ||
        directionsUrl?.trim(),
    );

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
      <div className="zg-showroom-hero-overlay zg-showroom-hero-overlay--spotlight" aria-hidden />
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

          {promise ? (
            <p className="zg-showroom-hero-promise" style={{ fontFamily: "var(--body-font), system-ui, sans-serif" }}>
              {promise}
            </p>
          ) : null}

          {action ? (
            <p className="zg-showroom-hero-action" style={{ fontFamily: "var(--body-font), system-ui, sans-serif" }}>
              {action}
            </p>
          ) : null}

          <div className="zg-showroom-conversion-stage">
            <div className="zg-showroom-conversion-stage__spotlight" aria-hidden />
            <div className="zg-showroom-cta-zone">
              <div className="zg-showroom-cta-zone-glow" aria-hidden />
              {primaryCta}
              <p className="zg-showroom-cta-reassurance">{reassurance}</p>
            </div>
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

          {hasTrustStack ? (
            <div className="zg-showroom-hero-trust-stack">
              {hasRating ? (
                <ShowroomSocialProof
                  googleRating={googleRating!}
                  reviewCount={reviewCount!}
                  className="zg-showroom-hero-proof"
                />
              ) : null}

              {availability?.headline ? (
                <ShowroomAvailabilityBadge availability={availability} />
              ) : null}

              <ShowroomSocialIcons
                instagramUrl={instagramUrl}
                facebookUrl={facebookUrl}
                tiktokUrl={tiktokUrl}
                websiteUrl={websiteUrl}
                directionsUrl={directionsUrl}
              />
            </div>
          ) : null}
        </div>
      </div>

      <div id="showroom-hero-sentinel" className="pointer-events-none absolute bottom-0 h-px w-full opacity-0" aria-hidden />
    </section>
  );
}
