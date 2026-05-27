"use client";

import Image from "next/image";
import { Star } from "lucide-react";
import { cn } from "@/src/lib/utils";

export function ShowroomHero({
  coverImageUrl,
  logoUrl,
  restaurantName,
  tagline,
  cuisineType,
  city,
  address,
  googleRating,
  reviewCount,
  showRating = true,
  previewMode = false,
  templateMode = "dark",
}: {
  coverImageUrl?: string | null;
  logoUrl?: string | null;
  restaurantName: string;
  tagline?: string | null;
  cuisineType?: string | null;
  city?: string | null;
  address?: string | null;
  googleRating?: number | null;
  reviewCount?: number | null;
  showRating?: boolean;
  previewMode?: boolean;
  templateMode?: "dark" | "light";
}) {
  const cover = coverImageUrl?.trim() || null;
  const name = restaurantName.trim();
  const metaParts = [cuisineType?.trim(), city?.trim()].filter(Boolean);
  const metaLine = metaParts.length > 0 ? metaParts.join(" · ") : null;
  const subtitle = tagline?.trim();
  const locationLine = address?.trim() || city?.trim() || null;
  const hasRating =
    showRating && typeof googleRating === "number" && googleRating >= 1 && reviewCount && reviewCount > 0;
  const isLight = templateMode === "light";

  return (
    <section
      id="accueil"
      className={cn(
        "zg-showroom-hero-immersive relative flex w-full flex-col overflow-hidden",
        previewMode ? "min-h-[min(72vh,640px)]" : "min-h-[min(88vh,820px)]",
      )}
    >
      {cover ? (
        <div className="absolute inset-0">
          <Image
            src={cover}
            alt=""
            fill
            priority
            className="object-cover zg-public-hero-media scale-[1.03]"
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

      <div
        className={cn("pointer-events-none absolute inset-0", isLight ? "bg-black/20" : "bg-black/40")}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/60 via-black/35 to-black/85"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 100% 80% at 50% 100%, color-mix(in srgb, var(--button-bg) 12%, transparent) 0%, transparent 55%)",
        }}
        aria-hidden
      />

      <div
        className={cn(
          "relative z-[1] flex min-h-[inherit] flex-1 flex-col justify-end",
          previewMode ? "min-h-[min(72vh,640px)]" : "min-h-[min(88vh,820px)]",
        )}
      >
        <div className="mx-auto w-full max-w-lg px-5 pb-8 pt-[max(3.5rem,env(safe-area-inset-top))] sm:max-w-xl sm:px-6 sm:pb-10 md:max-w-2xl">
          {logoUrl?.trim() ? (
            <div className="relative mb-5 h-10 w-32 sm:h-11 sm:w-36">
              <Image
                src={logoUrl.trim()}
                alt=""
                fill
                className="object-contain object-left"
                style={{ filter: "drop-shadow(0 8px 28px rgba(0,0,0,0.45))" }}
                sizes="144px"
                priority
                unoptimized
              />
            </div>
          ) : null}

          {name ? (
            <h1
              className="text-balance max-w-[20rem] text-[clamp(2.35rem,10.5vw,3.65rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-white sm:max-w-none"
              style={{ fontFamily: "var(--heading-font), Georgia, serif" }}
            >
              {name}
            </h1>
          ) : null}

          {metaLine ? (
            <p
              className="mt-3 text-[clamp(0.9rem,3vw,1.05rem)] font-medium tracking-wide text-white/80"
              style={{ fontFamily: "var(--body-font), system-ui, sans-serif" }}
            >
              {metaLine}
            </p>
          ) : null}

          {hasRating ? (
            <p className="mt-3 inline-flex items-center gap-2 text-[14px] text-white/90">
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
              className="mt-4 max-w-md text-pretty text-[15px] font-light leading-relaxed text-white/72 sm:text-base"
              style={{ fontFamily: "var(--body-font), system-ui, sans-serif" }}
            >
              {subtitle}
            </p>
          ) : null}

          {locationLine ? (
            <p className="mt-3 text-[13px] text-white/55">{locationLine}</p>
          ) : null}
        </div>
      </div>

      <div id="showroom-hero-sentinel" className="pointer-events-none absolute bottom-0 h-px w-full opacity-0" aria-hidden />
    </section>
  );
}
