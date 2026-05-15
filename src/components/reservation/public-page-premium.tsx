"use client";

import Image from "next/image";
import { ChevronRight, MapPin, Menu, Phone, Star, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/src/lib/utils";
import type {
  ConceptPillar,
  CredibilityContent,
  EditorialSectionContent,
  GalleryStyle,
  MenuOfferItem,
} from "@/src/lib/public-page/premium-content";
import { hasCredibilityContent } from "@/src/lib/public-page/premium-content";

type CtaStyle = { className: string; style?: React.CSSProperties };

const NAV_ITEMS = [
  { id: "accueil", label: "Accueil" },
  { id: "concept", label: "Concept" },
  { id: "menu", label: "Menu" },
  { id: "reservation", label: "Réserver" },
  { id: "infos", label: "Infos pratiques" },
  { id: "contact", label: "Contact" },
] as const;

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function PublicPageNav({
  restaurantName,
  ctaLabel,
  onReserve,
  visible,
  previewMode = false,
}: {
  restaurantName: string;
  ctaLabel: string;
  onReserve: () => void;
  visible: boolean;
  previewMode?: boolean;
}) {
  const [open, setOpen] = useState(false);

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
          "z-40 border-b border-white/10 bg-[color-mix(in_srgb,var(--page-bg)_82%,transparent)] backdrop-blur-md",
          previewMode ? "sticky top-0 w-full" : "fixed inset-x-0 top-0",
        )}
      >
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:h-16 sm:px-6 lg:px-10">
          <button
            type="button"
            onClick={() => scrollToId("accueil")}
            className="truncate text-sm font-semibold tracking-wide sm:text-base"
            style={{ fontFamily: "var(--heading-font)", color: "var(--heading-color)" }}
          >
            {restaurantName}
          </button>
          <nav className="hidden items-center gap-6 md:flex" aria-label="Navigation principale">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollToId(item.id)}
                className="text-xs font-medium uppercase tracking-[0.14em] opacity-75 transition hover:opacity-100"
                style={{ color: "var(--heading-color)" }}
              >
                {item.label}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="hidden min-h-10 items-center rounded-sm border px-4 text-xs font-semibold uppercase tracking-wider transition hover:opacity-90 md:inline-flex"
              style={{
                borderColor: "color-mix(in srgb, var(--heading-color) 35%, transparent)",
                color: "var(--heading-color)",
              }}
              onClick={onReserve}
            >
              {ctaLabel}
            </button>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-sm border md:hidden"
              style={{ borderColor: "color-mix(in srgb, var(--heading-color) 25%, transparent)" }}
              aria-label="Menu"
              onClick={() => setOpen(true)}
            >
              <Menu className="h-5 w-5" style={{ color: "var(--heading-color)" }} />
            </button>
          </div>
        </div>
      </header>

      {open ? (
        <div className={cn(previewMode ? "absolute inset-0 z-50" : "fixed inset-0 z-50", "md:hidden")}>
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Fermer"
            onClick={() => setOpen(false)}
          />
          <div
            className="absolute inset-y-0 right-0 flex w-[min(100%,320px)] flex-col p-6 shadow-2xl"
            style={{ backgroundColor: "var(--page-bg)" }}
          >
            <div className="flex justify-end">
              <button type="button" onClick={() => setOpen(false)} aria-label="Fermer">
                <X className="h-6 w-6" style={{ color: "var(--heading-color)" }} />
              </button>
            </div>
            <nav className="mt-8 flex flex-col gap-4">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="text-left text-lg font-medium"
                  style={{ color: "var(--heading-color)", fontFamily: "var(--heading-font)" }}
                  onClick={() => {
                    setOpen(false);
                    scrollToId(item.id);
                  }}
                >
                  {item.label}
                </button>
              ))}
            </nav>
            <button
              type="button"
              className="mt-8 min-h-12 w-full text-sm font-semibold uppercase tracking-wider"
              style={{ backgroundColor: "var(--button-bg)", color: "var(--button-text)" }}
              onClick={() => {
                setOpen(false);
                onReserve();
              }}
            >
              {ctaLabel}
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}

function premiumHeroMinHeight(heroHeight: "compact" | "normal" | "tall", previewMode: boolean) {
  if (previewMode) {
    if (heroHeight === "compact") return "min-h-[200px] max-h-[260px]";
    if (heroHeight === "tall") return "min-h-[280px] max-h-[360px]";
    return "min-h-[240px] max-h-[320px]";
  }
  if (heroHeight === "compact") return "min-h-[38vh] max-h-[440px]";
  if (heroHeight === "tall") return "min-h-[min(72vh,820px)]";
  return "min-h-[min(88vh,920px)]";
}

export function PremiumHero({
  coverImageUrl,
  logoUrl,
  headline,
  cuisineCityLine,
  tagline,
  openStatus,
  phone,
  showPhone,
  ctaLabel,
  secondaryLabel,
  secondaryHref,
  showSecondary,
  onReserve,
  ctaStyle,
  overlayOpacity,
  heroAlign,
  heroHeight = "normal",
  previewMode = false,
}: {
  coverImageUrl?: string | null;
  logoUrl?: string | null;
  headline: string;
  cuisineCityLine?: string;
  tagline?: string;
  openStatus: string;
  phone?: string | null;
  showPhone?: boolean;
  ctaLabel: string;
  secondaryLabel: string;
  secondaryHref?: string | null;
  showSecondary: boolean;
  onReserve: () => void;
  ctaStyle: CtaStyle;
  overlayOpacity: number;
  heroAlign: "left" | "center" | "right";
  heroHeight?: "compact" | "normal" | "tall";
  previewMode?: boolean;
}) {
  const alignLeft = heroAlign === "left";
  return (
    <section
      id="accueil"
      className={cn(
        "relative flex w-full scroll-mt-20 flex-col justify-end overflow-hidden pt-14 sm:pt-16",
        premiumHeroMinHeight(heroHeight, previewMode),
      )}
    >
      {coverImageUrl ? (
        <Image src={coverImageUrl} alt="" fill priority className="object-cover" sizes="100vw" unoptimized />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(160deg, var(--hero-primary) 0%, color-mix(in srgb, var(--body-text) 18%, var(--hero-primary)) 100%)`,
          }}
          aria-hidden
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/15" aria-hidden />
      <div
        className="absolute inset-0 bg-black"
        style={{ opacity: overlayOpacity }}
        aria-hidden
      />

      <div
        className={cn(
          "relative z-[1] mx-auto w-full max-w-7xl px-5 pb-16 pt-24 sm:px-8 sm:pb-24 lg:px-12 lg:pb-28",
          alignLeft ? "text-left" : heroAlign === "right" ? "text-right" : "text-center",
        )}
      >
        {logoUrl ? (
          <div className="relative mb-8 h-16 w-16 overflow-hidden rounded-sm border border-white/20 bg-white/5 p-1 sm:h-20 sm:w-20">
            <Image src={logoUrl} alt="" fill className="object-contain p-1" sizes="80px" unoptimized />
          </div>
        ) : null}

        {cuisineCityLine ? (
          <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-white/75">{cuisineCityLine}</p>
        ) : null}

        <h1
          className={cn(
            "mt-3 max-w-3xl text-balance font-medium leading-[1.05] tracking-tight text-white",
            !alignLeft && "mx-auto",
          )}
          style={{
            fontFamily: "var(--heading-font), Georgia, serif",
            fontSize: "clamp(2.25rem, 6vw, 4.25rem)",
          }}
        >
          {headline}
        </h1>

        {tagline ? (
          <p
            className={cn(
              "mt-5 max-w-xl text-pretty text-base leading-relaxed text-white/88 sm:text-lg",
              !alignLeft && "mx-auto",
            )}
          >
            {tagline}
          </p>
        ) : null}

        <p className={cn("mt-4 text-sm text-white/65", !alignLeft && "mx-auto max-w-xl")}>
          {openStatus}
          {showPhone && phone ? (
            <>
              {" · "}
              <a href={`tel:${phone.replace(/\s/g, "")}`} className="underline-offset-2 hover:underline">
                {phone}
              </a>
            </>
          ) : null}
        </p>

        <div
          className={cn(
            "mt-8 flex flex-col gap-3 sm:flex-row sm:items-center",
            alignLeft ? "sm:justify-start" : "sm:justify-center",
          )}
        >
          <button
            type="button"
            onClick={onReserve}
            className={cn(ctaStyle.className, "min-h-[52px] px-8 text-sm uppercase tracking-wider")}
            style={ctaStyle.style}
          >
            {ctaLabel}
          </button>
          {showSecondary && secondaryHref ? (
            <a
              href={secondaryHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[52px] items-center justify-center gap-2 border border-white/40 px-8 text-sm font-semibold uppercase tracking-wider text-white transition hover:bg-white/10"
            >
              {secondaryLabel}
              <ChevronRight className="h-4 w-4" aria-hidden />
            </a>
          ) : (
            <button
              type="button"
              onClick={() => scrollToId("concept")}
              className="inline-flex min-h-[52px] items-center justify-center gap-2 border border-white/40 px-8 text-sm font-semibold uppercase tracking-wider text-white transition hover:bg-white/10"
            >
              Découvrir le concept
              <ChevronRight className="h-4 w-4" aria-hidden />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

export function ConceptSection({
  title,
  body,
  imageUrl,
  pillars,
}: {
  title: string;
  body: string;
  imageUrl?: string;
  pillars: ConceptPillar[];
}) {
  if (!body.trim() && !imageUrl && pillars.every((p) => !p.title.trim())) return null;

  return (
    <section id="concept" className="scroll-mt-24 border-t border-[color-mix(in_srgb,var(--body-text)_8%,transparent)]">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          {imageUrl ? (
            <div className="relative aspect-[4/5] overflow-hidden sm:aspect-[5/6] lg:order-2">
              <Image src={imageUrl} alt="" fill className="object-cover" sizes="(max-width:1024px) 100vw, 50vw" unoptimized />
            </div>
          ) : null}
          <div className={imageUrl ? "lg:order-1" : "lg:col-span-2"}>
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] opacity-60" style={{ color: "var(--heading-color)" }}>
              Concept
            </p>
            <h2
              className="mt-3 text-3xl font-medium leading-tight sm:text-4xl"
              style={{ fontFamily: "var(--heading-font)", color: "var(--heading-color)" }}
            >
              {title}
            </h2>
            {body.trim() ? (
              <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed opacity-90" style={{ color: "var(--body-text)" }}>
                {body}
              </p>
            ) : null}
          </div>
        </div>

        {pillars.length > 0 ? (
          <div className="mt-14 grid gap-6 sm:grid-cols-3">
            {pillars.map((p) => (
              <article
                key={p.title}
                className="border-t-2 pt-5"
                style={{ borderColor: "var(--accent-color)" }}
              >
                <h3 className="text-lg font-medium" style={{ fontFamily: "var(--heading-font)", color: "var(--heading-color)" }}>
                  {p.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed opacity-85" style={{ color: "var(--body-text)" }}>
                  {p.text}
                </p>
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function EditorialBlock({
  section,
  previewMode = false,
}: {
  section: EditorialSectionContent;
  previewMode?: boolean;
}) {
  if (!section.enabled) return null;
  const hasImage = Boolean(section.imageUrl.trim());
  const isFull = section.layout === "full-bleed" && hasImage;

  if (isFull) {
    return (
      <section
        className={cn(
          "relative overflow-hidden",
          previewMode ? "min-h-[180px]" : "min-h-[min(56vh,520px)]",
        )}
      >
        <Image src={section.imageUrl} alt="" fill className="object-cover" sizes="100vw" unoptimized />
        <div className="absolute inset-0 bg-black/45" />
        <div
          className={cn(
            "relative flex items-end px-5 py-14 sm:px-8 lg:px-12",
            previewMode ? "min-h-[180px]" : "min-h-[min(56vh,520px)]",
          )}
        >
          <div className="max-w-2xl text-white">
            <h2 className="text-3xl font-medium sm:text-4xl" style={{ fontFamily: "var(--heading-font)" }}>
              {section.title}
            </h2>
            {section.text ? <p className="mt-4 text-base leading-relaxed text-white/90">{section.text}</p> : null}
            {section.buttonLabel && section.buttonUrl ? (
              <a
                href={section.buttonUrl}
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider underline-offset-4 hover:underline"
              >
                {section.buttonLabel}
                <ChevronRight className="h-4 w-4" />
              </a>
            ) : null}
          </div>
        </div>
      </section>
    );
  }

  const imageFirst = section.layout === "image-left";
  return (
    <section className="border-t border-[color-mix(in_srgb,var(--body-text)_8%,transparent)]">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-14 sm:px-8 lg:grid-cols-2 lg:gap-16 lg:px-12 lg:py-20">
        {hasImage ? (
          <div
            className={cn(
              "relative aspect-[4/3] overflow-hidden",
              !imageFirst && "lg:order-2",
            )}
          >
            <Image src={section.imageUrl} alt="" fill className="object-cover" sizes="(max-width:1024px) 100vw, 50vw" unoptimized />
          </div>
        ) : null}
        <div className={cn(!imageFirst && hasImage && "lg:order-1")}>
          <h2
            className="text-2xl font-medium sm:text-3xl"
            style={{ fontFamily: "var(--heading-font)", color: "var(--heading-color)" }}
          >
            {section.title}
          </h2>
          {section.text ? (
            <p className="mt-4 text-pretty text-base leading-relaxed opacity-90" style={{ color: "var(--body-text)" }}>
              {section.text}
            </p>
          ) : null}
          {section.buttonLabel && section.buttonUrl ? (
            <a
              href={section.buttonUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider"
              style={{ color: "var(--accent-color)" }}
            >
              {section.buttonLabel}
              <ChevronRight className="h-4 w-4" />
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export function MenuOffersSection({
  offers,
  menuHref,
  menuPdfLabel,
}: {
  offers: MenuOfferItem[];
  menuHref?: string | null;
  menuPdfLabel?: string;
}) {
  const hasOffers = offers.length > 0;
  if (!hasOffers && !menuHref) return null;

  return (
    <section id="menu" className="scroll-mt-24 bg-[color-mix(in_srgb,var(--body-text)_4%,var(--page-bg))]">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] opacity-60" style={{ color: "var(--heading-color)" }}>
              Carte & offres
            </p>
            <h2
              className="mt-2 text-3xl font-medium sm:text-4xl"
              style={{ fontFamily: "var(--heading-font)", color: "var(--heading-color)" }}
            >
              Notre menu
            </h2>
          </div>
          {menuHref ? (
            <a
              href={menuHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-2 border-b-2 pb-1 text-sm font-semibold uppercase tracking-wider"
              style={{ borderColor: "var(--accent-color)", color: "var(--accent-color)" }}
            >
              {menuPdfLabel ?? "Voir la carte complète"}
              <ChevronRight className="h-4 w-4" />
            </a>
          ) : null}
        </div>

        {hasOffers ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {offers.map((o) => (
              <article
                key={o.id}
                className="group flex flex-col overflow-hidden border border-[color-mix(in_srgb,var(--body-text)_12%,transparent)] bg-[var(--page-bg)]"
              >
                {o.imageUrl ? (
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                      src={o.imageUrl}
                      alt=""
                      fill
                      className="object-cover transition duration-700 group-hover:scale-[1.03]"
                      sizes="400px"
                      unoptimized
                    />
                  </div>
                ) : null}
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-medium" style={{ fontFamily: "var(--heading-font)", color: "var(--heading-color)" }}>
                      {o.title}
                    </h3>
                    {o.price ? (
                      <span className="shrink-0 text-sm font-semibold" style={{ color: "var(--accent-color)" }}>
                        {o.price}
                      </span>
                    ) : null}
                  </div>
                  {o.description ? (
                    <p className="mt-2 flex-1 text-sm leading-relaxed opacity-85" style={{ color: "var(--body-text)" }}>
                      {o.description}
                    </p>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function CredibilitySection({ data }: { data: CredibilityContent }) {
  if (!hasCredibilityContent(data)) return null;

  return (
    <section className="border-y border-[color-mix(in_srgb,var(--body-text)_10%,transparent)]">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-12">
        {data.googleRating && data.reviewCount ? (
          <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-center sm:gap-8">
            <div className="flex items-center gap-2">
              <span className="text-4xl font-medium tabular-nums" style={{ color: "var(--heading-color)" }}>
                {data.googleRating.toFixed(1)}
              </span>
              <div className="flex gap-0.5" aria-hidden>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-4 w-4",
                      i < Math.round(data.googleRating!) ? "fill-amber-500 text-amber-500" : "text-[color-mix(in_srgb,var(--body-text)_25%,transparent)]",
                    )}
                  />
                ))}
              </div>
            </div>
            <p className="text-sm opacity-80" style={{ color: "var(--body-text)" }}>
              {data.reviewCount} avis Google
            </p>
            {data.googleReviewsUrl ? (
              <a
                href={data.googleReviewsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold underline-offset-4 hover:underline"
                style={{ color: "var(--accent-color)" }}
              >
                Voir les avis
              </a>
            ) : null}
          </div>
        ) : null}

        {data.quote.trim() ? (
          <blockquote className="mx-auto mt-10 max-w-3xl text-center">
            <p className="text-xl font-light italic leading-relaxed sm:text-2xl" style={{ fontFamily: "var(--heading-font)", color: "var(--heading-color)" }}>
              « {data.quote.trim()} »
            </p>
            {data.quoteAuthor.trim() ? (
              <footer className="mt-4 text-sm uppercase tracking-widest opacity-70" style={{ color: "var(--body-text)" }}>
                {data.quoteAuthor}
              </footer>
            ) : null}
          </blockquote>
        ) : null}

        {data.pressMentions.length > 0 ? (
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            <span className="text-[10px] font-medium uppercase tracking-[0.25em] opacity-50">On parle de nous</span>
            {data.pressMentions.map((m) => (
              <span key={m} className="text-sm font-semibold uppercase tracking-wider opacity-80" style={{ color: "var(--heading-color)" }}>
                {m}
              </span>
            ))}
          </div>
        ) : null}

        {(data.tripAdvisorUrl && !data.googleReviewsUrl) || (data.tripAdvisorUrl && data.googleReviewsUrl) ? (
          <div className="mt-6 flex justify-center gap-4">
            {data.tripAdvisorUrl ? (
              <a
                href={data.tripAdvisorUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold uppercase tracking-wider underline-offset-4 hover:underline"
                style={{ color: "var(--accent-color)" }}
              >
                TripAdvisor
              </a>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function PremiumGallery({
  images,
  style,
  instagramUrl,
  showInstagram,
}: {
  images: string[];
  style: GalleryStyle;
  instagramUrl?: string | null;
  showInstagram?: boolean;
}) {
  if (images.length === 0) return null;

  const title = showInstagram && instagramUrl ? "L'ambiance en images" : "Galerie";

  if (style === "showcase" && images.length >= 2) {
    const [hero, ...rest] = images;
    return (
      <section className="border-t border-[color-mix(in_srgb,var(--body-text)_8%,transparent)]">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
          <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="text-3xl font-medium sm:text-4xl" style={{ fontFamily: "var(--heading-font)", color: "var(--heading-color)" }}>
              {title}
            </h2>
            {showInstagram && instagramUrl ? (
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold uppercase tracking-wider"
                style={{ color: "var(--accent-color)" }}
              >
                @ Instagram
              </a>
            ) : null}
          </div>
          <div className="grid gap-3 lg:grid-cols-12 lg:gap-4">
            <div className="relative aspect-[16/10] overflow-hidden lg:col-span-8 lg:aspect-auto lg:min-h-[420px]">
              <Image src={hero} alt="" fill className="object-cover" sizes="(max-width:1024px) 100vw, 66vw" unoptimized priority />
            </div>
            <div className="grid grid-cols-2 gap-3 lg:col-span-4 lg:grid-cols-1">
              {rest.slice(0, 4).map((src) => (
                <div key={src} className="relative aspect-[4/3] overflow-hidden lg:aspect-[16/10]">
                  <Image src={src} alt="" fill className="object-cover transition duration-700 hover:scale-[1.04]" sizes="300px" unoptimized />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="border-t border-[color-mix(in_srgb,var(--body-text)_8%,transparent)]">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
        <h2 className="mb-8 text-3xl font-medium sm:text-4xl" style={{ fontFamily: "var(--heading-font)", color: "var(--heading-color)" }}>
          {title}
        </h2>
        <div className="columns-2 gap-3 md:columns-3 md:gap-4">
          {images.map((src) => (
            <div key={src} className="relative mb-3 aspect-[3/4] break-inside-avoid overflow-hidden md:mb-4">
              <Image src={src} alt="" fill className="object-cover" sizes="(max-width:768px) 50vw, 33vw" unoptimized />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PremiumFinalCta({
  title,
  subtitle,
  buttonLabel,
  phone,
  showPhone,
  onReserve,
  ctaStyle,
}: {
  title: string;
  subtitle: string;
  buttonLabel: string;
  phone?: string | null;
  showPhone?: boolean;
  onReserve: () => void;
  ctaStyle: CtaStyle;
}) {
  return (
    <section className="relative overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, color-mix(in srgb, var(--accent-color) 18%, var(--page-bg)) 0%, var(--page-bg) 50%)`,
        }}
        aria-hidden
      />
      <div className="relative mx-auto max-w-3xl px-5 py-20 text-center sm:px-8 lg:py-28">
        <h2
          className="text-3xl font-medium sm:text-4xl"
          style={{ fontFamily: "var(--heading-font)", color: "var(--heading-color)" }}
        >
          {title}
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed opacity-90" style={{ color: "var(--body-text)" }}>
          {subtitle}
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onReserve}
            className={cn(ctaStyle.className, "min-h-[52px] px-10 uppercase tracking-wider")}
            style={ctaStyle.style}
          >
            {buttonLabel}
          </button>
          {showPhone && phone ? (
            <a
              href={`tel:${phone.replace(/\s/g, "")}`}
              className="inline-flex min-h-[52px] items-center gap-2 px-6 text-sm font-semibold uppercase tracking-wider"
              style={{ color: "var(--accent-color)" }}
            >
              <Phone className="h-4 w-4" />
              {phone}
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export function PremiumPracticalInfo({
  address,
  phone,
  openingHoursLines,
  googleMapsUrl,
  parking,
  accessibility,
  showMaps,
}: {
  address?: string | null;
  phone?: string | null;
  openingHoursLines: string[];
  googleMapsUrl?: string | null;
  parking?: string;
  accessibility?: string;
  showMaps?: boolean;
}) {
  return (
    <section id="infos" className="scroll-mt-24 border-t border-[color-mix(in_srgb,var(--body-text)_8%,transparent)]">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] opacity-60" style={{ color: "var(--heading-color)" }}>
          Infos pratiques
        </p>
        <div className="mt-8 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {address ? (
            <div id="contact">
              <MapPin className="h-5 w-5 opacity-60" style={{ color: "var(--accent-color)" }} />
              <p className="mt-3 text-sm font-semibold uppercase tracking-wider opacity-60">Adresse</p>
              <p className="mt-2 text-base leading-relaxed" style={{ color: "var(--heading-color)" }}>
                {address}
              </p>
              {showMaps && googleMapsUrl ? (
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1 text-sm font-semibold uppercase tracking-wider"
                  style={{ color: "var(--accent-color)" }}
                >
                  Itinéraire
                  <ChevronRight className="h-4 w-4" />
                </a>
              ) : null}
            </div>
          ) : null}
          {phone ? (
            <div>
              <Phone className="h-5 w-5 opacity-60" style={{ color: "var(--accent-color)" }} />
              <p className="mt-3 text-sm font-semibold uppercase tracking-wider opacity-60">Téléphone</p>
              <a href={`tel:${phone.replace(/\s/g, "")}`} className="mt-2 block text-base font-medium" style={{ color: "var(--heading-color)" }}>
                {phone}
              </a>
            </div>
          ) : null}
          {openingHoursLines.length > 0 ? (
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider opacity-60">Horaires</p>
              <ul className="mt-3 space-y-1 text-sm leading-relaxed" style={{ color: "var(--body-text)" }}>
                {openingHoursLines.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {parking?.trim() ? (
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider opacity-60">Parking</p>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--body-text)" }}>
                {parking}
              </p>
            </div>
          ) : null}
          {accessibility?.trim() ? (
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider opacity-60">Accessibilité</p>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--body-text)" }}>
                {accessibility}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export function PremiumReservationSection({
  title,
  intro,
  groupMessage,
  showPhoneAlt,
  phone,
  children,
}: {
  title: string;
  intro: string;
  groupMessage?: string;
  showPhoneAlt?: boolean;
  phone?: string | null;
  children: React.ReactNode;
}) {
  return (
    <section
      id="reservation"
      className="scroll-mt-24 border-t border-[color-mix(in_srgb,var(--body-text)_8%,transparent)] bg-[color-mix(in_srgb,var(--body-text)_3%,var(--page-bg))]"
    >
      <div className="mx-auto max-w-3xl px-5 py-14 sm:px-8 lg:py-20">
        <header className="mb-8 text-center md:text-left">
          <p
            className="text-[11px] font-medium uppercase tracking-[0.28em] opacity-60"
            style={{ color: "var(--heading-color)" }}
          >
            Réservation
          </p>
          <h2
            className="mt-2 text-3xl font-medium md:text-4xl"
            style={{ fontFamily: "var(--heading-font)", color: "var(--heading-color)" }}
          >
            {title}
          </h2>
          <p className="mt-3 text-base leading-relaxed opacity-90" style={{ color: "var(--body-text)" }}>
            {intro}
          </p>
          {groupMessage?.trim() ? (
            <p className="mt-2 text-sm opacity-75" style={{ color: "var(--body-text)" }}>
              {groupMessage}
            </p>
          ) : null}
        </header>
        <div
          className="border p-5 sm:p-8"
          style={{
            borderColor: "color-mix(in srgb, var(--body-text) 12%, var(--page-bg))",
            backgroundColor: "var(--page-bg)",
          }}
        >
          {children}
        </div>
        {showPhoneAlt && phone ? (
          <p className="mt-6 text-center text-sm md:text-left" style={{ color: "var(--body-text)" }}>
            Vous préférez appeler ?{" "}
            <a
              href={`tel:${phone.replace(/\s/g, "")}`}
              className="font-semibold underline-offset-2 hover:underline"
              style={{ color: "var(--accent-color)" }}
            >
              {phone}
            </a>
          </p>
        ) : null}
      </div>
    </section>
  );
}

export function StickyReserveBar({
  label,
  onClick,
  visible,
}: {
  label: string;
  onClick: () => void;
  visible: boolean;
}) {
  if (!visible) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[color-mix(in_srgb,var(--body-text)_10%,var(--page-bg))] bg-[color-mix(in_srgb,var(--page-bg)_96%,transparent)] px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-lg md:hidden">
      <button
        type="button"
        onClick={onClick}
        className="flex min-h-[52px] w-full items-center justify-center text-sm font-semibold uppercase tracking-[0.12em]"
        style={{ backgroundColor: "var(--button-bg)", color: "var(--button-text)" }}
      >
        {label}
      </button>
    </div>
  );
}
