"use client";

import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { cn } from "@/src/lib/utils";

type CtaStyle = { className: string; style?: React.CSSProperties };

export function ShowroomHero({
  coverImageUrl,
  logoUrl,
  headline,
  tagline,
  ctaLabel,
  secondaryLabel,
  secondaryHref,
  showSecondary,
  onReserve,
  ctaStyle,
  previewMode = false,
}: {
  coverImageUrl?: string | null;
  logoUrl?: string | null;
  headline: string;
  tagline?: string;
  ctaLabel: string;
  secondaryLabel: string;
  secondaryHref?: string | null;
  showSecondary: boolean;
  onReserve: () => void;
  ctaStyle: CtaStyle;
  previewMode?: boolean;
}) {
  const cover = coverImageUrl?.trim() || null;
  const shortTagline = tagline?.trim();
  const displayTagline =
    shortTagline && shortTagline.length <= 120 ? shortTagline : shortTagline?.slice(0, 117).trimEnd() + "…";

  return (
    <section
      id="accueil"
      className={cn(
        "relative flex w-full flex-col justify-end overflow-hidden",
        previewMode ? "min-h-[min(92vh,720px)]" : "min-h-[100dvh] min-h-[100svh]",
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
            background: `linear-gradient(165deg, var(--hero-primary) 0%, color-mix(in srgb, var(--body-text) 22%, var(--hero-primary)) 100%)`,
          }}
          aria-hidden
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/20" aria-hidden />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 100%, color-mix(in srgb, var(--accent-color) 12%, transparent), transparent 70%)",
        }}
        aria-hidden
      />

      <div
        className={cn(
          "relative z-[1] mx-auto flex w-full max-w-lg flex-col items-center px-6 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-28 text-center sm:max-w-xl sm:pb-16",
          previewMode ? "pt-20" : "pt-32",
        )}
      >
        {logoUrl?.trim() ? (
          <div className="relative mb-8 h-14 w-44 sm:h-16 sm:w-52">
            <Image
              src={logoUrl.trim()}
              alt=""
              fill
              className="object-contain object-center"
              style={{ filter: "drop-shadow(0 4px 24px rgba(0,0,0,0.4))" }}
              sizes="200px"
              priority
              unoptimized
            />
          </div>
        ) : null}

        <h1
          className="text-balance text-[clamp(2rem,7vw,3.25rem)] font-medium leading-[1.02] tracking-tight text-white"
          style={{ fontFamily: "var(--heading-font), Georgia, serif", letterSpacing: "-0.02em" }}
        >
          {headline}
        </h1>

        {displayTagline ? (
          <p className="mt-4 max-w-md text-pretty text-base font-light leading-relaxed text-white/80 sm:text-lg">
            {displayTagline}
          </p>
        ) : null}

        <div className="mt-10 flex w-full max-w-xs flex-col items-stretch gap-4 sm:max-w-sm">
          <button
            type="button"
            onClick={onReserve}
            className={cn(
              ctaStyle.className,
              "min-h-[52px] w-full rounded-full text-[13px] font-semibold tracking-[0.08em]",
            )}
            style={ctaStyle.style}
          >
            {ctaLabel}
          </button>

          {showSecondary && secondaryHref ? (
            <a
              href={secondaryHref}
              target="_blank"
              rel="noopener noreferrer"
              className="text-center text-sm font-medium text-white/75 underline-offset-4 transition hover:text-white hover:underline"
            >
              {secondaryLabel}
            </a>
          ) : showSecondary ? (
            <button
              type="button"
              onClick={() =>
                document.getElementById("signature")?.scrollIntoView({ behavior: "smooth", block: "start" })
              }
              className="text-sm font-medium text-white/75 underline-offset-4 transition hover:text-white hover:underline"
            >
              {secondaryLabel}
            </button>
          ) : null}
        </div>
      </div>

      {!previewMode ? (
        <div
          className="pointer-events-none absolute bottom-6 left-1/2 z-[1] -translate-x-1/2 text-white/40"
          aria-hidden
        >
          <ChevronDown className="h-6 w-6 animate-bounce" style={{ animationDuration: "2.5s" }} />
        </div>
      ) : null}
    </section>
  );
}
