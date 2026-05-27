"use client";

import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { cn } from "@/src/lib/utils";

/** Hero Showroom — centré, immersif, CTA principal intégré */
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
}) {
  const cover = coverImageUrl?.trim() || null;
  const name = restaurantName.trim();
  const metaParts = [cuisineType?.trim(), city?.trim()].filter(Boolean);
  const metaLine = metaParts.length > 0 ? metaParts.join(" · ") : null;
  const subtitle = tagline?.trim();
  const hasRating =
    showRating && typeof googleRating === "number" && googleRating >= 1 && reviewCount && reviewCount > 0;
  const isLight = templateMode === "light";
  const menuVisible = showMenu && (menuHref?.trim() || menuLabel);

  const primaryCtaClass = "zg-showroom-hero-primary-cta w-full max-w-sm";

  const primaryCta = reserveHref?.trim() ? (
    <Link href={reserveHref.trim()} className={primaryCtaClass}>
      {ctaLabel}
    </Link>
  ) : (
    <button type="button" onClick={onReserve} className={primaryCtaClass}>
      {ctaLabel}
    </button>
  );

  const menuLink = menuHref?.trim() ? (
    <a
      href={menuHref.trim()}
      target="_blank"
      rel="noopener noreferrer"
      className="zg-showroom-hero-menu-link mt-4 inline-block"
    >
      {menuLabel}
    </a>
  ) : null;

  return (
    <section
      id="accueil"
      className={cn(
        "zg-showroom-hero-immersive relative flex w-full flex-col overflow-hidden",
        previewMode ? "min-h-[min(100dvh,720px)]" : "min-h-[100dvh] min-h-dvh",
      )}
    >
      {cover ? (
        <div className="absolute inset-0">
          <Image
            src={cover}
            alt=""
            fill
            priority
            className="object-cover zg-public-hero-media scale-[1.05]"
            sizes="100vw"
            unoptimized
          />
        </div>
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background: isLight
              ? "linear-gradient(165deg, #FAF7F2 0%, color-mix(in srgb, var(--hero-primary) 25%, #E8E0D4) 55%, #F3EEE6 100%)"
              : `linear-gradient(165deg, #0A0A0B 0%, color-mix(in srgb, var(--hero-primary) 35%, #0A0A0B) 55%, #080809 100%)`,
          }}
          aria-hidden
        />
      )}

      <div className={cn("pointer-events-none absolute inset-0", isLight ? "bg-black/25" : "bg-black/45")} aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/65 via-black/40 to-black/88"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 70% at 50% 85%, color-mix(in srgb, var(--button-bg) 18%, transparent) 0%, transparent 60%)",
        }}
        aria-hidden
      />

      <div
        className={cn(
          "relative z-[1] flex min-h-[inherit] flex-1 flex-col items-center justify-center px-5 text-center",
          "pt-[max(3rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))]",
        )}
      >
        <div className="flex w-full max-w-md flex-col items-center">
          {logoUrl?.trim() ? (
            <div className="relative mb-6 h-11 w-36 sm:h-12 sm:w-40">
              <Image
                src={logoUrl.trim()}
                alt=""
                fill
                className="object-contain object-center"
                style={{ filter: "drop-shadow(0 10px 32px rgba(0,0,0,0.5))" }}
                sizes="160px"
                priority
                unoptimized
              />
            </div>
          ) : null}

          {name ? (
            <h1
              className="text-balance text-[clamp(2.25rem,11vw,3.5rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-white"
              style={{ fontFamily: "var(--heading-font), Georgia, serif" }}
            >
              {name}
            </h1>
          ) : null}

          {metaLine ? (
            <p
              className="mt-3 text-[clamp(0.9rem,3.2vw,1.05rem)] font-medium tracking-wide text-white/82"
              style={{ fontFamily: "var(--body-font), system-ui, sans-serif" }}
            >
              {metaLine}
            </p>
          ) : null}

          {hasRating ? (
            <p className="mt-3 inline-flex items-center justify-center gap-2 text-[14px] text-white/90">
              <span className="flex items-center gap-0.5" aria-hidden>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-3.5 w-3.5",
                      i < Math.round(googleRating!)
                        ? "fill-amber-400 text-amber-400"
                        : "fill-white/20 text-white/20",
                    )}
                  />
                ))}
              </span>
              <span className="font-semibold tabular-nums">{googleRating!.toFixed(1)}</span>
              <span className="opacity-75">· {reviewCount} avis</span>
            </p>
          ) : null}

          {subtitle && subtitle.toLowerCase() !== name.toLowerCase() ? (
            <p
              className="mt-4 max-w-sm text-pretty text-[15px] font-light leading-relaxed text-white/68"
              style={{ fontFamily: "var(--body-font), system-ui, sans-serif" }}
            >
              {subtitle}
            </p>
          ) : null}

          <div className="mt-8 w-full px-1 sm:mt-10">{primaryCta}</div>

          {menuVisible ? menuLink : null}
        </div>
      </div>

      <div id="showroom-hero-sentinel" className="pointer-events-none absolute bottom-0 h-px w-full opacity-0" aria-hidden />
    </section>
  );
}
