"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/src/lib/utils";

export function ShowroomHero({
  coverImageUrl,
  logoUrl,
  restaurantName,
  emotionalHeadline,
  emotionalSubtitle,
  cuisineType,
  city,
  openStatus,
  hoursSummary,
  ctaLabel,
  secondaryLabel,
  secondaryHref,
  showSecondary,
  onReserve,
  reserveHref,
  conversionScreen = false,
  previewMode = false,
}: {
  coverImageUrl?: string | null;
  logoUrl?: string | null;
  restaurantName: string;
  emotionalHeadline?: string | null;
  emotionalSubtitle?: string | null;
  cuisineType?: string | null;
  city?: string | null;
  openStatus?: string | null;
  hoursSummary?: string | null;
  ctaLabel: string;
  secondaryLabel?: string;
  secondaryHref?: string | null;
  showSecondary: boolean;
  onReserve: () => void;
  /** Page réservation dédiée `/r/[slug]/reserver`. */
  reserveHref?: string | null;
  conversionScreen?: boolean;
  previewMode?: boolean;
}) {
  const cover = coverImageUrl?.trim() || null;
  const name = restaurantName.trim();
  const headline = emotionalHeadline?.trim();
  const subtitle = emotionalSubtitle?.trim();
  const hours = hoursSummary?.trim();
  const status = openStatus?.trim();
  const isOpen = status?.toLowerCase().includes("ouvert");

  const metaParts = [cuisineType?.trim(), city?.trim()].filter(Boolean);
  const metaLine = metaParts.length > 0 ? metaParts.join(" · ") : null;

  const scrollToMenu = () => {
    document.getElementById("menu")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const ctaClassName = cn(
    "zg-showroom-hero-cta zg-showroom-hero-cta--primary w-full",
    conversionScreen && "zg-showroom-hero-cta--conversion",
  );

  const reserveCta =
    reserveHref?.trim() ? (
      <Link href={reserveHref.trim()} className={ctaClassName}>
        {ctaLabel}
      </Link>
    ) : (
      <button type="button" onClick={onReserve} className={ctaClassName}>
        {ctaLabel}
      </button>
    );

  if (conversionScreen) {
    const menuLink = (
      <button type="button" onClick={scrollToMenu} className="zg-showroom-hero-footer-link">
        {secondaryLabel ?? "Voir le menu"}
      </button>
    );

    return (
      <section
        id="accueil"
        className={cn(
          "zg-showroom-hero-poster zg-showroom-hero-poster--conversion relative flex w-full flex-col overflow-hidden",
          previewMode ? "min-h-[min(100dvh,720px)]" : "min-h-[100dvh]",
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
              background: `linear-gradient(165deg, #0A0A0B 0%, color-mix(in srgb, var(--hero-primary) 35%, #0A0A0B) 55%, #080809 100%)`,
            }}
            aria-hidden
          />
        )}

        <div className="pointer-events-none absolute inset-0 bg-black/45" aria-hidden />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-black/80"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 90% 70% at 50% 50%, transparent 0%, rgba(0,0,0,0.35) 100%)",
          }}
          aria-hidden
        />

        <div className="relative z-[1] flex min-h-[inherit] flex-1 flex-col items-center justify-center px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-[max(1.25rem,env(safe-area-inset-bottom))] text-center sm:px-6">
          <div className="flex w-full max-w-md flex-col items-center">
            {logoUrl?.trim() ? (
              <div className="relative mb-5 h-9 w-28 opacity-90 sm:h-10 sm:w-32">
                <Image
                  src={logoUrl.trim()}
                  alt=""
                  fill
                  className="object-contain object-center"
                  style={{ filter: "drop-shadow(0 6px 24px rgba(0,0,0,0.45))" }}
                  sizes="128px"
                  priority
                  unoptimized
                />
              </div>
            ) : null}

            {name ? (
              <h1
                className="text-balance max-w-[18rem] text-[clamp(2.5rem,11vw,3.75rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-white sm:max-w-none"
                style={{ fontFamily: "var(--heading-font), Georgia, serif" }}
              >
                {name}
              </h1>
            ) : null}

            <div className="mt-8 w-full max-w-sm sm:mt-9">{reserveCta}</div>

            {showSecondary ? <div className="mt-4">{menuLink}</div> : null}
          </div>
        </div>
      </section>
    );
  }

  const secondaryFooter =
    showSecondary &&
    (secondaryHref ? (
      <a
        href={secondaryHref}
        target="_blank"
        rel="noopener noreferrer"
        className="zg-showroom-hero-footer-link"
      >
        {secondaryLabel ?? "Voir le menu"}
      </a>
    ) : (
      <button type="button" onClick={scrollToMenu} className="zg-showroom-hero-footer-link">
        {secondaryLabel ?? "Voir le menu"}
      </button>
    ));

  return (
    <section
      id="accueil"
      className={cn(
        "zg-showroom-hero-poster relative flex w-full flex-col overflow-hidden",
        previewMode ? "min-h-[min(100dvh,720px)]" : "min-h-[100dvh]",
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
            background: `linear-gradient(165deg, #0A0A0B 0%, color-mix(in srgb, var(--hero-primary) 35%, #0A0A0B) 55%, #080809 100%)`,
          }}
          aria-hidden
        />
      )}

      <div className="pointer-events-none absolute inset-0 bg-black/25" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/55 via-black/20 to-[#0A0A0B]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0A0A0B] via-transparent to-transparent"
        style={{ backgroundSize: "100% 45%", backgroundPosition: "bottom", backgroundRepeat: "no-repeat" }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 120% 55% at 50% 100%, color-mix(in srgb, var(--button-bg) 18%, transparent) 0%, transparent 58%)",
        }}
        aria-hidden
      />

      <div
        className={cn(
          "relative z-[1] flex min-h-[inherit] flex-1 flex-col justify-end",
          previewMode ? "min-h-[min(100dvh,720px)]" : "min-h-[100dvh]",
        )}
      >
        <div className="mx-auto w-full max-w-lg px-5 pb-4 pt-[max(3rem,env(safe-area-inset-top))] sm:max-w-xl sm:px-6 md:max-w-2xl">
          {logoUrl?.trim() ? (
            <div className="relative mb-6 h-11 w-36 sm:h-12 sm:w-40">
              <Image
                src={logoUrl.trim()}
                alt=""
                fill
                className="object-contain object-left"
                style={{ filter: "drop-shadow(0 8px 32px rgba(0,0,0,0.5))" }}
                sizes="160px"
                priority
                unoptimized
              />
            </div>
          ) : null}

          {name ? (
            <h1
              className="text-balance max-w-[20rem] text-[clamp(2.25rem,10vw,3.5rem)] font-medium leading-[1.0] tracking-[-0.025em] text-white sm:max-w-none"
              style={{ fontFamily: "var(--heading-font), Georgia, serif" }}
            >
              {name}
            </h1>
          ) : null}

          {headline && headline.toLowerCase() !== name.toLowerCase() ? (
            <p
              className="mt-3 max-w-md text-pretty text-[clamp(1.05rem,3.8vw,1.25rem)] font-light leading-snug text-white/85"
              style={{ fontFamily: "var(--heading-font), Georgia, serif" }}
            >
              {headline}
            </p>
          ) : metaLine ? (
            <p
              className="mt-3 max-w-md text-pretty text-[clamp(0.95rem,3.2vw,1.1rem)] font-light leading-snug text-white/72"
              style={{ fontFamily: "var(--body-font), system-ui, sans-serif" }}
            >
              {metaLine}
            </p>
          ) : null}

          {subtitle ? (
            <p
              className="mt-2 max-w-md text-pretty text-[13px] leading-relaxed text-white/48 sm:text-sm"
              style={{ fontFamily: "var(--body-font), system-ui, sans-serif" }}
            >
              {subtitle}
            </p>
          ) : null}

          <div className="mt-5 flex flex-wrap items-center gap-2">
            {status ? (
              <span
                className={cn(
                  "inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold tracking-wide backdrop-blur-md",
                  isOpen
                    ? "border-emerald-400/25 bg-emerald-500/15 text-emerald-100"
                    : "border-white/12 bg-white/8 text-white/75",
                )}
              >
                <span
                  className={cn(
                    "mr-1.5 h-1.5 w-1.5 rounded-full",
                    isOpen ? "bg-emerald-400" : "bg-white/40",
                  )}
                  aria-hidden
                />
                {status}
              </span>
            ) : null}
            {metaLine && headline && headline.toLowerCase() !== name.toLowerCase() ? (
              <span className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-[11px] font-medium tracking-wide text-white/70 backdrop-blur-sm">
                {metaLine}
              </span>
            ) : null}
          </div>

          <div className="mt-8 flex w-full flex-col gap-3 sm:mt-9">
            {reserveCta}
            {showSecondary ? (
              <div className="flex justify-center sm:justify-start">{secondaryFooter}</div>
            ) : null}
          </div>
        </div>

        {hours ? (
          <div className="mx-auto w-full max-w-lg px-5 pb-[max(1rem,env(safe-area-inset-bottom))] sm:max-w-xl sm:px-6 md:max-w-2xl">
            <p className="max-w-[85%] text-left text-[11px] leading-snug text-white/38">{hours}</p>
          </div>
        ) : null}
      </div>

      <div id="showroom-hero-sentinel" className="pointer-events-none absolute bottom-0 h-px w-full opacity-0" aria-hidden />
    </section>
  );
}
