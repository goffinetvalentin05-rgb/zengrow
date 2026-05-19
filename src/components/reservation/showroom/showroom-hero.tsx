"use client";

import Image from "next/image";
import { cn } from "@/src/lib/utils";

export function ShowroomHero({
  coverImageUrl,
  logoUrl,
  restaurantName,
  emotionalHeadline,
  emotionalSubtitle,
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

  const scrollToMenu = () => {
    document.getElementById("signature")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section
      id="accueil"
      className={cn(
        "zg-showroom-hero-poster relative flex w-full flex-col items-center justify-center overflow-hidden",
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
            className="object-cover zg-public-hero-media scale-[1.03]"
            sizes="100vw"
            unoptimized
          />
        </div>
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(168deg, #0a0908 0%, color-mix(in srgb, var(--hero-primary) 40%, #0a0908) 55%, #0a0908 100%)`,
          }}
          aria-hidden
        />
      )}

      <div className="pointer-events-none absolute inset-0 bg-black/50" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/80"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 85% 65% at 50% 42%, transparent 0%, rgba(0,0,0,0.62) 100%)",
        }}
        aria-hidden
      />

      <div
        className={cn(
          "relative z-[1] mx-auto flex w-full max-w-md flex-col items-center px-6 text-center sm:max-w-lg",
          previewMode
            ? "py-[max(4rem,env(safe-area-inset-top))] pb-14"
            : "justify-center py-[max(5.5rem,env(safe-area-inset-top))] pb-[max(3.5rem,env(safe-area-inset-bottom))]",
        )}
      >
        {logoUrl?.trim() ? (
          <div className="relative mb-8 h-[3.25rem] w-44 sm:mb-10 sm:h-14 sm:w-52">
            <Image
              src={logoUrl.trim()}
              alt=""
              fill
              className="object-contain object-center"
              style={{ filter: "drop-shadow(0 8px 40px rgba(0,0,0,0.5))" }}
              sizes="208px"
              priority
              unoptimized
            />
          </div>
        ) : null}

        {name ? (
          <p
            className="text-balance text-[11px] font-medium tracking-[0.28em] text-white/85 uppercase sm:text-xs"
            style={{ fontFamily: "var(--body-font), system-ui, sans-serif" }}
          >
            {name}
          </p>
        ) : null}

        {headline ? (
          <h1
            className={cn(
              "text-balance font-medium leading-[1.1] tracking-tight text-white",
              name ? "mt-6 text-[clamp(1.75rem,6vw,2.85rem)]" : "text-[clamp(2rem,7.5vw,3.25rem)]",
            )}
            style={{ fontFamily: "var(--heading-font), Georgia, serif", letterSpacing: "-0.03em" }}
          >
            {headline}
          </h1>
        ) : name ? (
          <h1
            className="text-balance text-[clamp(2rem,7.5vw,3.25rem)] font-medium leading-[1.1] tracking-tight text-white"
            style={{ fontFamily: "var(--heading-font), Georgia, serif", letterSpacing: "-0.03em" }}
          >
            {name}
          </h1>
        ) : null}

        {subtitle ? (
          <p
            className="mt-5 max-w-[22rem] text-pretty text-[15px] leading-relaxed font-light text-white/62 sm:text-base"
            style={{ fontFamily: "var(--body-font), system-ui, sans-serif" }}
          >
            {subtitle}
          </p>
        ) : null}

        <div className="mt-11 flex flex-col items-center gap-5 sm:mt-12">
          <button type="button" onClick={onReserve} className="zg-showroom-hero-cta">
            {ctaLabel}
          </button>

          {showSecondary && secondaryHref ? (
            <a
              href={secondaryHref}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[12px] font-medium tracking-[0.04em] text-white/45 underline-offset-[6px] transition hover:text-white/75 hover:underline"
            >
              {secondaryLabel}
            </a>
          ) : showSecondary ? (
            <button
              type="button"
              onClick={scrollToMenu}
              className="text-[12px] font-medium tracking-[0.04em] text-white/45 underline-offset-[6px] transition hover:text-white/75 hover:underline"
            >
              {secondaryLabel}
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
