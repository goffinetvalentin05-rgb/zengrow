"use client";

import Image from "next/image";
import { Star } from "lucide-react";
import { cn } from "@/src/lib/utils";

export function ShowroomHero({
  coverImageUrl,
  logoUrl,
  restaurantName,
  emotionalHeadline,
  emotionalSubtitle,
  cuisineType,
  city,
  googleRating,
  reviewCount,
  reviewsSuffix = "avis",
  hoursSummary,
  ctaLabel,
  secondaryLabel,
  secondaryHref,
  showSecondary,
  onReserve,
  previewMode = false,
}: {
  coverImageUrl?: string | null;
  logoUrl?: string | null;
  restaurantName: string;
  emotionalHeadline?: string | null;
  emotionalSubtitle?: string | null;
  cuisineType?: string | null;
  city?: string | null;
  googleRating?: number | null;
  reviewCount?: number | null;
  reviewsSuffix?: string;
  hoursSummary?: string | null;
  ctaLabel: string;
  secondaryLabel: string;
  secondaryHref?: string | null;
  showSecondary: boolean;
  onReserve: () => void;
  previewMode?: boolean;
}) {
  const cover = coverImageUrl?.trim() || null;
  const name = restaurantName.trim();
  const headline = emotionalHeadline?.trim();
  const subtitle = emotionalSubtitle?.trim();
  const hours = hoursSummary?.trim();

  const metaParts = [cuisineType?.trim(), city?.trim()].filter(Boolean);
  const metaLine = metaParts.length > 0 ? metaParts.join(" • ") : null;
  const showRating = googleRating != null && reviewCount != null && reviewCount > 0;

  const scrollToMenu = () => {
    document.getElementById("signature")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const secondaryFooter =
    showSecondary &&
    (secondaryHref ? (
      <a
        href={secondaryHref}
        target="_blank"
        rel="noopener noreferrer"
        className="zg-showroom-hero-footer-link"
      >
        {secondaryLabel}
      </a>
    ) : (
      <button type="button" onClick={scrollToMenu} className="zg-showroom-hero-footer-link">
        {secondaryLabel}
      </button>
    ));

  return (
    <section
      id="accueil"
      className={cn(
        "zg-showroom-hero-poster relative flex w-full flex-col overflow-hidden",
        previewMode ? "min-h-[min(100dvh,720px)]" : "min-h-[100dvh] min-h-[100svh]",
      )}
    >
      {cover ? (
        <div className="absolute inset-0">
          <Image
            src={cover}
            alt=""
            fill
            priority
            className="object-cover zg-public-hero-media scale-[1.04]"
            sizes="100vw"
            unoptimized
          />
        </div>
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(165deg, #080706 0%, color-mix(in srgb, var(--hero-primary) 35%, #080706) 50%, #050504 100%)`,
          }}
          aria-hidden
        />
      )}

      <div className="pointer-events-none absolute inset-0 bg-black/35" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/55 via-black/15 to-black/85"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/25"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 120% 80% at 50% 100%, rgba(0,0,0,0.55) 0%, transparent 55%)",
        }}
        aria-hidden
      />

      <div
        className={cn(
          "relative z-[1] flex min-h-[inherit] flex-1 flex-col",
          previewMode ? "min-h-[min(100dvh,720px)]" : "min-h-[100dvh] min-h-[100svh]",
        )}
      >
        <div className="flex flex-1 flex-col items-center justify-center px-7 pb-8 pt-[max(3.5rem,env(safe-area-inset-top))] text-center sm:px-8">
          {logoUrl?.trim() ? (
            <div className="relative mb-10 h-12 w-40 sm:mb-12 sm:h-14 sm:w-48">
              <Image
                src={logoUrl.trim()}
                alt=""
                fill
                className="object-contain object-center"
                style={{ filter: "drop-shadow(0 12px 48px rgba(0,0,0,0.55))" }}
                sizes="192px"
                priority
                unoptimized
              />
            </div>
          ) : null}

          {name ? (
            <h1
              className="text-balance max-w-[16rem] text-[clamp(1.85rem,8vw,2.65rem)] font-medium leading-[1.05] tracking-[-0.02em] text-white sm:max-w-md"
              style={{ fontFamily: "var(--heading-font), Georgia, serif" }}
            >
              {name}
            </h1>
          ) : null}

          {(showRating || metaLine) && (
            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
              {showRating ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/8 px-3 py-1 text-[11px] font-medium tracking-wide text-white/90 backdrop-blur-md">
                  <Star className="h-3 w-3 fill-amber-400/95 text-amber-400/95" aria-hidden />
                  <span className="tabular-nums">{googleRating!.toFixed(1)}</span>
                  <span className="text-white/35">•</span>
                  <span className="tabular-nums text-white/75">
                    {reviewCount} {reviewsSuffix}
                  </span>
                </span>
              ) : null}
              {metaLine ? (
                <span className="text-[12px] font-normal tracking-wide text-white/55">{metaLine}</span>
              ) : null}
            </div>
          )}

          {headline && headline.toLowerCase() !== name.toLowerCase() ? (
            <p
              className={cn(
                "text-balance mt-8 max-w-[19rem] text-pretty font-light leading-[1.35] tracking-[-0.01em] text-white/88 sm:max-w-sm",
                "text-[clamp(1.15rem,4.2vw,1.45rem)]",
              )}
              style={{ fontFamily: "var(--heading-font), Georgia, serif" }}
            >
              {headline}
            </p>
          ) : null}

          {subtitle ? (
            <p
              className="mt-4 max-w-[18rem] text-pretty text-[13px] leading-relaxed font-light text-white/48 sm:max-w-xs sm:text-sm"
              style={{ fontFamily: "var(--body-font), system-ui, sans-serif" }}
            >
              {subtitle}
            </p>
          ) : null}

          <div className="mt-10 sm:mt-12">
            <button type="button" onClick={onReserve} className="zg-showroom-hero-cta">
              {ctaLabel}
            </button>
          </div>
        </div>

        {(hours || secondaryFooter) && (
          <div className="flex items-end justify-between gap-4 px-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-2 sm:px-8">
            {hours ? (
              <p className="max-w-[58%] text-left text-[11px] leading-snug text-white/40">{hours}</p>
            ) : (
              <span aria-hidden />
            )}
            {secondaryFooter}
          </div>
        )}
      </div>
    </section>
  );
}
