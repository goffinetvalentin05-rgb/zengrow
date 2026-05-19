"use client";

import Image from "next/image";
import { ChevronRight, Menu, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/src/lib/utils";
import ImageWithVignette from "@/src/lib/themes/shared/image-with-vignette";
import type { MenuOfferItem } from "@/src/lib/public-page/premium-content";
import type { NavLinkContent } from "@/src/lib/public-page/page-sections";

type CtaStyle = { className: string; style?: React.CSSProperties };

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function PremiumDarkNav({
  restaurantName,
  ctaLabel,
  onReserve,
  visible,
  previewMode = false,
  navLinks,
  showReserveCta = true,
}: {
  restaurantName: string;
  ctaLabel: string;
  onReserve: () => void;
  visible: boolean;
  previewMode?: boolean;
  navLinks: NavLinkContent[];
  showReserveCta?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [compact, setCompact] = useState(false);

  const onScroll = useCallback(() => {
    setCompact(window.scrollY > 48);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [onScroll]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!visible) return null;

  return (
    <>
      <header
        className={cn(
          "z-40 w-full border-b transition-[padding,background] duration-300",
          previewMode ? "sticky top-0" : "fixed inset-x-0 top-0",
          compact
            ? "border-[color-mix(in_srgb,var(--zg-border)_80%,transparent)] bg-[color-mix(in_srgb,var(--page-bg)_88%,transparent)] py-1 shadow-lg backdrop-blur-xl"
            : "border-transparent bg-[color-mix(in_srgb,var(--page-bg)_35%,transparent)] py-2 backdrop-blur-md",
        )}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-[var(--zg-container-x)] pt-2 pb-2">
          <button
            type="button"
            onClick={() => scrollToId("accueil")}
            className={cn(
              "truncate font-semibold tracking-wide transition-all",
              compact ? "max-w-[46%] text-base sm:text-lg" : "max-w-[52%] text-lg sm:text-xl",
            )}
            style={{ fontFamily: "var(--zg-font-display), var(--heading-font)", color: "var(--heading-color)" }}
          >
            {restaurantName}
          </button>

          <nav className="hidden items-center gap-7 lg:flex" aria-label="Navigation principale">
            {navLinks.map((item) => (
              <button
                key={item.anchorId}
                type="button"
                onClick={() => scrollToId(item.anchorId)}
                className="text-[11px] font-medium uppercase tracking-[0.05em] transition hover:opacity-90"
                style={{ color: "var(--zg-text-muted, var(--body-text))" }}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            {showReserveCta ? (
            <button
              type="button"
              className="hidden min-h-10 items-center rounded-[var(--zg-radius-pill)] px-5 text-[11px] font-semibold uppercase tracking-[0.12em] transition hover:brightness-110 md:inline-flex"
              style={{
                backgroundColor: "var(--accent-color)",
                color: "var(--button-text)",
                boxShadow: "0 0 0 1px color-mix(in srgb, var(--accent-color) 40%, transparent)",
              }}
              onClick={onReserve}
            >
              {ctaLabel}
            </button>
            ) : null}
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--heading-color)_18%,transparent)] text-[var(--heading-color)] md:hidden"
              aria-label="Menu"
              onClick={() => setOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {open ? (
        <div className={cn(previewMode ? "absolute inset-0 z-50" : "fixed inset-0 z-50", "md:hidden")}>
          <button type="button" className="absolute inset-0 bg-black/55" aria-label="Fermer" onClick={() => setOpen(false)} />
          <div
            className="absolute inset-y-0 right-0 flex w-[min(100%,320px)] flex-col border-l border-[color-mix(in_srgb,var(--heading-color)_12%,transparent)] p-6 shadow-2xl"
            style={{ backgroundColor: "var(--page-bg)" }}
          >
            <div className="flex justify-end">
              <button type="button" onClick={() => setOpen(false)} aria-label="Fermer">
                <X className="h-6 w-6" style={{ color: "var(--heading-color)" }} />
              </button>
            </div>
            <nav className="mt-8 flex flex-col gap-4">
              {navLinks.map((item) => (
                <button
                  key={item.anchorId}
                  type="button"
                  className="text-left text-lg font-medium"
                  style={{ color: "var(--heading-color)", fontFamily: "var(--heading-font)" }}
                  onClick={() => {
                    setOpen(false);
                    scrollToId(item.anchorId);
                  }}
                >
                  {item.label}
                </button>
              ))}
              {showReserveCta ? (
                <button
                  type="button"
                  className="mt-4 min-h-12 rounded-[var(--zg-radius-pill)] text-sm font-semibold uppercase tracking-wider"
                  style={{ backgroundColor: "var(--accent-color)", color: "var(--button-text)" }}
                  onClick={() => {
                    setOpen(false);
                    onReserve();
                  }}
                >
                  {ctaLabel}
                </button>
              ) : null}
            </nav>
          </div>
        </div>
      ) : null}
    </>
  );
}

export function PremiumDarkHero({
  badgeText,
  coverImageUrl,
  headline,
  tagline,
  ctaLabel,
  secondaryLabel,
  secondaryHref,
  showSecondary,
  onReserve,
  ctaStyle,
  openStatus: _openStatus,
  phone: _phone,
  showPhone: _showPhone,
  previewMode = false,
  scriptLineFallback,
  scrollHintLabel,
}: {
  badgeText?: string | null;
  coverImageUrl?: string | null;
  headline: string;
  tagline?: string;
  ctaLabel: string;
  secondaryLabel: string;
  secondaryHref?: string | null;
  showSecondary: boolean;
  onReserve: () => void;
  ctaStyle: CtaStyle;
  openStatus: string;
  phone?: string | null;
  showPhone?: boolean;
  previewMode?: boolean;
  scriptLineFallback: string;
  scrollHintLabel: string;
}) {
  const scriptLine = badgeText?.trim() || tagline?.trim()?.split(/[.!?]/)[0]?.trim() || scriptLineFallback;

  return (
    <section
      id="accueil"
      className={cn(
        "relative flex w-full flex-col overflow-hidden scroll-mt-0",
        previewMode ? "min-h-[min(100vh,820px)]" : "min-h-screen",
      )}
    >
      {coverImageUrl ? (
        <div className="absolute inset-0">
          <ImageWithVignette enabled className="h-full w-full">
            <div className="relative h-full min-h-[100vh] w-full">
              <Image
                src={coverImageUrl}
                alt=""
                fill
                priority={!previewMode}
                className="scale-105 object-cover"
                sizes="100vw"
                unoptimized
              />
              <div
                className="pointer-events-none absolute inset-0"
                style={{ background: "var(--zg-image-overlay, linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.7) 100%))" }}
                aria-hidden
              />
            </div>
          </ImageWithVignette>
        </div>
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(145deg, color-mix(in srgb, var(--accent-color) 22%, var(--page-bg)) 0%, var(--page-bg) 60%)`,
          }}
          aria-hidden
        />
      )}

      <div className="relative z-[1] flex flex-1 flex-col justify-end px-[var(--zg-container-x)] pb-16 pt-28 sm:pb-20 sm:pt-32 md:pb-28">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center text-center">
          <p
            className="mb-3 text-[clamp(1.05rem,2.8vw,1.45rem)] leading-tight"
            style={{
              fontFamily: "var(--zg-font-script), var(--heading-font)",
              color: "var(--accent-color)",
            }}
          >
            {scriptLine}
          </p>
          <h1
            className="max-w-[22ch] text-balance font-medium italic leading-[0.95] tracking-tight"
            style={{
              fontFamily: "var(--zg-font-display), var(--heading-font)",
              fontSize: "clamp(3rem, 8vw, 7rem)",
              color: "var(--heading-color)",
            }}
          >
            {headline}
          </h1>
          {tagline && tagline.trim() !== scriptLine ? (
            <p
              className="mt-8 max-w-xl text-pretty text-[clamp(0.95rem,2vw,1.15rem)] font-light leading-relaxed"
              style={{
                color: "color-mix(in srgb, var(--heading-color) 72%, transparent)",
                fontFamily: "var(--body-font), system-ui, sans-serif",
              }}
            >
              {tagline}
            </p>
          ) : null}

          <div className="mt-12 flex flex-col items-center gap-5 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={onReserve}
              className={cn(
                ctaStyle.className,
                "min-h-[52px] min-w-[220px] rounded-[var(--zg-radius-pill)] px-10 text-[12px] font-semibold uppercase tracking-[0.18em] shadow-lg transition hover:brightness-110",
              )}
              style={{ ...ctaStyle.style, borderRadius: "var(--zg-radius-pill)" }}
            >
              {ctaLabel}
            </button>
            {showSecondary && secondaryHref ? (
              <a
                href={secondaryHref}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em]"
                style={{ color: "var(--accent-color)" }}
              >
                {secondaryLabel}
                <ChevronRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden />
              </a>
            ) : null}
          </div>
        </div>

        <div
          className="pointer-events-none absolute bottom-8 left-1/2 flex h-12 w-8 -translate-x-1/2 flex-col items-center gap-2"
          aria-hidden
        >
          <span className="h-8 w-px animate-pulse bg-[color-mix(in_srgb,var(--accent-color)_55%,transparent)]" />
          <span className="text-[10px] uppercase tracking-[0.3em] text-[color-mix(in_srgb,var(--heading-color)_45%,transparent)]">
            {scrollHintLabel}
          </span>
        </div>
      </div>
    </section>
  );
}

export function PremiumDarkMenuOffersSection({
  offers,
  menuHref,
  menuPdfLabel,
  eyebrow,
  title,
  variant = "editorial-list",
}: {
  offers: MenuOfferItem[];
  menuHref?: string | null;
  menuPdfLabel?: string;
  eyebrow: string;
  title: string;
  variant?: "editorial-list" | "grid-photos" | "split-categories";
}) {
  const hasOffers = offers.length > 0;
  const layoutVariant = variant ?? "editorial-list";
  if (!hasOffers && !menuHref) return null;

  return (
    <section
      id="menu"
      className="relative scroll-mt-24 overflow-hidden py-[var(--zg-section-y)]"
      style={{
        background: `linear-gradient(180deg, var(--page-bg) 0%, color-mix(in srgb, var(--accent-color) 4%, var(--page-bg)) 50%, var(--page-bg) 100%)`,
      }}
    >
      <div className="mx-auto max-w-6xl px-[var(--zg-container-x)]">
        {layoutVariant !== "split-categories" ? (
          <header className="mb-14 max-w-2xl">
            <p
              className="text-[clamp(1.35rem,3.5vw,2rem)] leading-tight"
              style={{ fontFamily: "var(--zg-font-script)", color: "var(--accent-color)" }}
            >
              {eyebrow}
            </p>
            <h2
              className="mt-4 text-[clamp(2rem,4.5vw,3rem)] font-medium leading-[1.02]"
              style={{ fontFamily: "var(--zg-font-display), var(--heading-font)", color: "var(--heading-color)" }}
            >
              {title}
            </h2>
          </header>
        ) : null}

        {hasOffers && layoutVariant === "grid-photos" ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {offers.map((o) => (
              <article
                key={o.id}
                className="overflow-hidden rounded-2xl border"
                style={{ borderColor: "color-mix(in srgb, var(--body-text) 12%, var(--page-bg))" }}
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  {o.imageUrl ? (
                    <Image src={o.imageUrl} alt="" fill className="object-cover" sizes="(max-width:768px) 50vw, 33vw" unoptimized />
                  ) : (
                    <div
                      className="flex h-full min-h-[180px] items-center justify-center"
                      style={{ backgroundColor: "color-mix(in srgb, var(--body-text) 6%, var(--page-bg))" }}
                      aria-hidden
                    />
                  )}
                </div>
                <div className="space-y-2 p-5">
                  <div className="flex flex-wrap items-end justify-between gap-2">
                    <h3
                      className="text-lg font-medium leading-tight"
                      style={{ fontFamily: "var(--zg-font-display), var(--heading-font)", color: "var(--heading-color)" }}
                    >
                      {o.title}
                    </h3>
                    {o.price ? (
                      <span
                        className="shrink-0 rounded-[var(--zg-radius-pill)] px-3 py-1 text-sm tabular-nums"
                        style={{
                          backgroundColor: "color-mix(in srgb, var(--accent-color) 14%, transparent)",
                          color: "var(--accent-color)",
                          fontFamily: "var(--heading-font)",
                        }}
                      >
                        {o.price}
                      </span>
                    ) : null}
                  </div>
                  {o.description ? (
                    <p className="text-sm leading-relaxed" style={{ color: "var(--body-text)" }}>
                      {o.description}
                    </p>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        ) : hasOffers && layoutVariant === "split-categories" ? (
          <div className="grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)] lg:items-start">
            <header className="lg:sticky lg:top-28">
              <p
                className="text-[clamp(1.35rem,3.5vw,2rem)] leading-tight"
                style={{ fontFamily: "var(--zg-font-script)", color: "var(--accent-color)" }}
              >
                {eyebrow}
              </p>
              <h2
                className="mt-4 text-[clamp(2rem,4.5vw,3rem)] font-medium leading-[1.02]"
                style={{ fontFamily: "var(--zg-font-display), var(--heading-font)", color: "var(--heading-color)" }}
              >
                {title}
              </h2>
            </header>
            <ul className="space-y-8">
              {offers.map((o) => (
                <li key={o.id} className="grid gap-6 border-b pb-8 last:border-0 sm:grid-cols-[120px_1fr]">
                  {o.imageUrl ? (
                    <div className="relative aspect-square w-full max-w-[120px] overflow-hidden">
                      <Image src={o.imageUrl} alt="" fill className="object-cover" sizes="120px" unoptimized />
                    </div>
                  ) : null}
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
                      <h3
                        className="min-w-0 flex-1 text-xl font-medium"
                        style={{ fontFamily: "var(--zg-font-display), var(--heading-font)", color: "var(--heading-color)" }}
                      >
                        {o.title}
                      </h3>
                      {o.price ? (
                        <span
                          className="shrink-0 rounded-[var(--zg-radius-pill)] px-3 py-1 text-sm tabular-nums"
                          style={{
                            backgroundColor: "color-mix(in srgb, var(--accent-color) 14%, transparent)",
                            color: "var(--accent-color)",
                            fontFamily: "var(--heading-font)",
                          }}
                        >
                          {o.price}
                        </span>
                      ) : null}
                    </div>
                    {o.description ? (
                      <p className="max-w-prose text-[15px] leading-[1.75]" style={{ color: "var(--body-text)" }}>
                        {o.description}
                      </p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : hasOffers ? (
        <div className="flex flex-col gap-16">

          {offers.map((o, idx) => {
            const rowReverse = idx % 2 === 1;
            return (
              <article
                key={o.id}
                className={cn("grid gap-10 lg:grid-cols-2 lg:items-center", rowReverse && "lg:[direction:rtl]")}
              >
                <div className={cn("relative min-h-[220px] overflow-hidden lg:min-h-[320px]", rowReverse && "lg:[direction:ltr]")}>
                  {o.imageUrl ? (
                    <Image
                      src={o.imageUrl}
                      alt=""
                      fill
                      className="object-cover transition duration-[1.2s] hover:scale-[1.03]"
                      sizes="(max-width:1024px) 100vw, 50vw"
                      unoptimized
                    />
                  ) : (
                    <div
                      className="flex h-full min-h-[220px] items-center justify-center"
                      style={{ backgroundColor: "color-mix(in srgb, var(--body-text) 6%, var(--page-bg))" }}
                      aria-hidden
                    >
                      <span
                        className="text-7xl font-light opacity-[0.12]"
                        style={{ fontFamily: "var(--heading-font)", color: "var(--accent-color)" }}
                      >
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                    </div>
                  )}
                </div>
                <div className={cn("space-y-4", rowReverse && "lg:[direction:ltr]")}>
                  <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
                    <h3
                      className="min-w-0 flex-1 text-[clamp(1.25rem,2.5vw,1.65rem)] font-medium leading-tight"
                      style={{ fontFamily: "var(--zg-font-display), var(--heading-font)", color: "var(--heading-color)" }}
                    >
                      {o.title}
                    </h3>
                    {o.price ? (
                      <span
                        className="shrink-0 rounded-[var(--zg-radius-pill)] px-3 py-1 text-sm tabular-nums"
                        style={{
                          backgroundColor: "color-mix(in srgb, var(--accent-color) 14%, transparent)",
                          color: "var(--accent-color)",
                          fontFamily: "var(--heading-font)",
                        }}
                      >
                        {o.price}
                      </span>
                    ) : null}
                  </div>
                  {o.description ? (
                    <p className="max-w-prose text-[15px] leading-[1.75]" style={{ color: "var(--body-text)" }}>
                      {o.description}
                    </p>
                  ) : null}
                  <div
                    className="h-px w-full bg-[length:8px_1px] bg-repeat-x"
                    style={{
                      backgroundImage:
                        "linear-gradient(to right, color-mix(in srgb, var(--body-text) 35%, transparent) 50%, transparent 50%)",
                    }}
                    aria-hidden
                  />
                </div>
              </article>
            );
          })}
        </div>
        ) : null}

        {menuHref ? (
          <div className="mt-16 flex justify-center">
            <a
              href={menuHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[52px] w-full max-w-md items-center justify-center rounded-[var(--zg-radius-pill)] text-[11px] font-semibold uppercase tracking-[0.22em] transition hover:brightness-110 sm:w-auto sm:px-12"
              style={{
                backgroundColor: "var(--accent-color)",
                color: "var(--button-text)",
              }}
            >
              {menuPdfLabel ?? ""}
            </a>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function PremiumDarkMasonryGallery({
  images,
  eyebrow,
  title,
  instagramUrl,
  showInstagram = false,
  instagramLinkLabel,
  variant = "masonry",
}: {
  images: string[];
  eyebrow: string;
  title: string;
  instagramUrl?: string | null;
  showInstagram?: boolean;
  instagramLinkLabel: string;
  variant?: "masonry" | "grid-uniform" | "showcase-row";
}) {
  const galleryVariant = variant ?? "masonry";
  if (images.length === 0) return null;

  return (
    <section className="py-[var(--zg-section-y)]">
      <div className="mx-auto max-w-6xl px-[var(--zg-container-x)]">
        <header className="mb-12">
          <p
            className="text-[clamp(1.25rem,3vw,1.75rem)]"
            style={{ fontFamily: "var(--zg-font-script)", color: "var(--accent-color)" }}
          >
            {eyebrow}
          </p>
          <h2
            className="mt-3 text-[clamp(2rem,4vw,3rem)] font-medium"
            style={{ fontFamily: "var(--zg-font-display), var(--heading-font)", color: "var(--heading-color)" }}
          >
            {title}
          </h2>
          {showInstagram && instagramUrl ? (
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em]"
              style={{ color: "var(--accent-color)" }}
            >
              {instagramLinkLabel}
              <ChevronRight className="h-4 w-4" />
            </a>
          ) : null}
        </header>
        {galleryVariant === "grid-uniform" ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
            {images.map((src) => (
              <div key={src} className="group relative aspect-square overflow-hidden">
                <Image
                  src={src}
                  alt=""
                  fill
                  className="object-cover transition duration-700 group-hover:scale-[1.05]"
                  sizes="(max-width:768px) 50vw, 33vw"
                  unoptimized
                />
              </div>
            ))}
          </div>
        ) : galleryVariant === "showcase-row" ? (
          <div className="-mx-[var(--zg-container-x)] flex gap-4 overflow-x-auto px-[var(--zg-container-x)] pb-2 snap-x snap-mandatory">
            {images.map((src) => (
              <div
                key={src}
                className="group relative aspect-[16/10] min-w-[min(85vw,420px)] shrink-0 snap-center overflow-hidden sm:min-w-[min(55vw,520px)]"
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  className="object-cover transition duration-700 group-hover:scale-[1.03]"
                  sizes="85vw"
                  unoptimized
                />
              </div>
            ))}
          </div>
        ) : (
        <div className="columns-2 gap-3 sm:columns-3 sm:gap-4">
          {images.map((src, i) => (
            <div
              key={src}
              className={cn(
                "group relative mb-3 break-inside-avoid overflow-hidden sm:mb-4",
                i % 4 === 0 ? "aspect-[3/4]" : i % 4 === 1 ? "aspect-[4/5]" : i % 4 === 2 ? "aspect-square" : "aspect-[5/6]",
              )}
            >
              <Image
                src={src}
                alt=""
                fill
                className="object-cover transition duration-700 group-hover:scale-[1.05]"
                sizes="(max-width:768px) 50vw, 33vw"
                unoptimized
              />
              <div
                className="pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100"
                style={{
                  background:
                    "linear-gradient(180deg, transparent 40%, color-mix(in srgb, var(--accent-color) 35%, rgba(0,0,0,0.55)) 100%)",
                }}
                aria-hidden
              />
            </div>
          ))}
        </div>        )}
      </div>
    </section>
  );
}
