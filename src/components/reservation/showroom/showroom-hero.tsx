"use client";

import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { cn } from "@/src/lib/utils";

export function ShowroomHero({
  coverImageUrl,
  logoUrl,
  restaurantName,
  emotionalHeadline,
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
  /** Phrase émotionnelle courte — distincte du nom de l’établissement */
  emotionalHeadline?: string | null;
  ctaLabel: string;
  secondaryLabel: string;
  secondaryHref?: string | null;
  showSecondary: boolean;
  onReserve: () => void;
  previewMode?: boolean;
}) {
  const cover = coverImageUrl?.trim() || null;
  const name = restaurantName.trim();
  const line = emotionalHeadline?.trim();
  const showName =
    name.length > 0 &&
    (!line || line.toLowerCase() !== name.toLowerCase());

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
            className="object-cover zg-public-hero-media"
            sizes="100vw"
            unoptimized
          />
        </div>
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(165deg, var(--hero-primary) 0%, color-mix(in srgb, var(--body-text) 28%, var(--hero-primary)) 100%)`,
          }}
          aria-hidden
        />
      )}

      {/* Overlay cinéma */}
      <div className="pointer-events-none absolute inset-0 bg-black/45" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/55 via-black/25 to-black/75"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 70% at 50% 45%, transparent 0%, rgba(0,0,0,0.55) 100%)",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(ellipse 50% 35% at 50% 100%, color-mix(in srgb, var(--accent-color) 18%, transparent), transparent 70%)",
        }}
        aria-hidden
      />

      <div
        className={cn(
          "relative z-[1] mx-auto flex w-full max-w-lg flex-col items-center px-6 py-[max(5rem,env(safe-area-inset-top))] text-center sm:max-w-xl",
          previewMode ? "pb-14" : "pb-[max(3rem,env(safe-area-inset-bottom))]",
        )}
      >
        {logoUrl?.trim() ? (
          <div className="relative mb-6 h-16 w-48 sm:mb-8 sm:h-[4.5rem] sm:w-56">
            <Image
              src={logoUrl.trim()}
              alt=""
              fill
              className="object-contain object-center"
              style={{ filter: "drop-shadow(0 6px 32px rgba(0,0,0,0.45))" }}
              sizes="224px"
              priority
              unoptimized
            />
          </div>
        ) : null}

        {showName ? (
          <p
            className={cn(
              "text-balance font-medium tracking-[0.2em] text-white/90 uppercase",
              logoUrl?.trim() ? "text-[11px] sm:text-xs" : "text-[clamp(1.5rem,5vw,2.25rem)] normal-case tracking-tight",
            )}
            style={{
              fontFamily: logoUrl?.trim()
                ? "var(--body-font), system-ui, sans-serif"
                : "var(--heading-font), Georgia, serif",
              letterSpacing: logoUrl?.trim() ? undefined : "-0.02em",
            }}
          >
            {name}
          </p>
        ) : null}

        {line ? (
          <h1
            className={cn(
              "text-balance font-medium leading-[1.08] tracking-tight text-white",
              showName ? "mt-5 text-[clamp(1.65rem,6.5vw,2.75rem)]" : "text-[clamp(2rem,7.5vw,3.35rem)]",
            )}
            style={{ fontFamily: "var(--heading-font), Georgia, serif", letterSpacing: "-0.025em" }}
          >
            {line}
          </h1>
        ) : showName ? null : (
          <h1
            className="text-balance text-[clamp(2rem,7.5vw,3.35rem)] font-medium leading-[1.08] tracking-tight text-white"
            style={{ fontFamily: "var(--heading-font), Georgia, serif", letterSpacing: "-0.025em" }}
          >
            {name}
          </h1>
        )}

        <div className="mt-10 flex flex-col items-center gap-5 sm:mt-12">
          <button type="button" onClick={onReserve} className="zg-showroom-hero-cta">
            {ctaLabel}
          </button>

          {showSecondary && secondaryHref ? (
            <a
              href={secondaryHref}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px] font-medium tracking-wide text-white/55 underline-offset-[5px] transition hover:text-white/85 hover:underline"
            >
              {secondaryLabel}
            </a>
          ) : showSecondary ? (
            <button
              type="button"
              onClick={scrollToMenu}
              className="text-[13px] font-medium tracking-wide text-white/55 underline-offset-[5px] transition hover:text-white/85 hover:underline"
            >
              {secondaryLabel}
            </button>
          ) : null}
        </div>
      </div>

      {!previewMode ? (
        <div
          className="pointer-events-none absolute bottom-5 left-1/2 z-[1] -translate-x-1/2 text-white/30 sm:bottom-7"
          aria-hidden
        >
          <ChevronDown className="h-5 w-5 animate-bounce" style={{ animationDuration: "2.8s" }} />
        </div>
      ) : null}
    </section>
  );
}
