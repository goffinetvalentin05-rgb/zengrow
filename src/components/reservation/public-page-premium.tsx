"use client";

import Image from "next/image";
import { ChevronRight, Check, Clock, MapPin, Menu, Phone, Star, X } from "lucide-react";
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

export type HeroLayoutVariant = "overlay" | "left" | "center" | "split";

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
          "z-40 w-full border-b border-white/10",
          // Reste transparent au-dessus du hero pour un rendu éditorial ; les couleurs sont définies par les CSS vars
          "bg-gradient-to-b from-black/35 via-black/15 to-transparent backdrop-blur-[2px]",
          previewMode ? "sticky top-0 left-0 right-0" : "fixed inset-x-0 top-0",
        )}
      >
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:h-16 sm:px-6 lg:px-10">
          <button
            type="button"
            onClick={() => scrollToId("accueil")}
            className="truncate text-sm font-semibold tracking-wide text-white sm:text-base"
            style={{ fontFamily: "var(--heading-font)" }}
          >
            {restaurantName}
          </button>
          <nav className="hidden items-center gap-6 md:flex" aria-label="Navigation principale">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollToId(item.id)}
                className="text-xs font-medium uppercase tracking-[0.16em] text-white/85 transition hover:text-white"
              >
                {item.label}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="hidden min-h-10 items-center rounded-full border border-white/40 bg-white/5 px-4 text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-white/15 md:inline-flex"
              onClick={onReserve}
            >
              {ctaLabel}
            </button>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/5 text-white md:hidden"
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

/**
 * Hauteur minimale du hero.
 * Le hero ne doit JAMAIS imposer de max-h : c'est ce qui causait le bug "haut coupé"
 * dans l'aperçu (le contenu débordait et `overflow-hidden` + `justify-end` rognaient le haut).
 */
function premiumHeroMinHeight(heroHeight: "compact" | "normal" | "tall", previewMode: boolean) {
  if (previewMode) {
    if (heroHeight === "compact") return "min-h-[440px]";
    if (heroHeight === "tall") return "min-h-[640px]";
    return "min-h-[540px]";
  }
  if (heroHeight === "compact") return "min-h-[min(62vh,560px)]";
  if (heroHeight === "tall") return "min-h-[min(88vh,920px)]";
  return "min-h-[min(78vh,780px)]";
}

function HeroContentInner({
  logoUrl,
  cuisineCityLine,
  badge,
  headline,
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
  textTheme,
  align,
}: {
  logoUrl?: string | null;
  cuisineCityLine?: string;
  badge?: string;
  headline: string;
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
  textTheme: "onImage" | "onSurface";
  align: "left" | "center";
}) {
  const isCenter = align === "center";
  const muted = textTheme === "onImage" ? "text-white/80" : "opacity-75";
  const subtle = textTheme === "onImage" ? "text-white/65" : "opacity-60";
  const headingColor =
    textTheme === "onImage" ? ("#ffffff" as const) : ("var(--heading-color)" as const);
  const bodyColor =
    textTheme === "onImage"
      ? ("rgba(255,255,255,0.88)" as const)
      : ("var(--body-text)" as const);

  return (
    <div className={cn("flex w-full flex-col gap-6", isCenter && "items-center text-center")}>
      {logoUrl ? (
        <div
          className={cn(
            "relative h-16 w-16 overflow-hidden rounded-full border p-1 sm:h-20 sm:w-20",
            textTheme === "onImage"
              ? "border-white/25 bg-white/10 backdrop-blur-sm"
              : "border-[color-mix(in_srgb,var(--heading-color)_18%,transparent)] bg-[color-mix(in_srgb,var(--heading-color)_6%,transparent)]",
          )}
        >
          <Image src={logoUrl} alt="" fill className="object-contain p-1" sizes="80px" unoptimized />
        </div>
      ) : null}

      {badge ? (
        <span
          className={cn(
            "inline-flex items-center gap-2 self-start rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em]",
            textTheme === "onImage"
              ? "border border-white/30 bg-white/10 text-white"
              : "border border-[color-mix(in_srgb,var(--accent-color)_45%,transparent)] bg-[color-mix(in_srgb,var(--accent-color)_12%,transparent)]",
          )}
          style={textTheme === "onSurface" ? { color: "var(--accent-color)" } : undefined}
        >
          {badge}
        </span>
      ) : null}

      {cuisineCityLine ? (
        <p
          className={cn(
            "text-[11px] font-medium uppercase tracking-[0.3em]",
            muted,
          )}
          style={textTheme === "onSurface" ? { color: "var(--body-text)" } : undefined}
        >
          {cuisineCityLine}
        </p>
      ) : null}

      <h1
        className={cn("max-w-3xl text-balance font-medium leading-[1.04] tracking-tight")}
        style={{
          fontFamily: "var(--heading-font), Georgia, serif",
          fontSize: "clamp(2.25rem, 5.5vw, 4.5rem)",
          color: headingColor,
        }}
      >
        {headline}
      </h1>

      {tagline ? (
        <p
          className={cn("max-w-xl text-pretty text-base leading-relaxed sm:text-lg")}
          style={{ color: bodyColor }}
        >
          {tagline}
        </p>
      ) : null}

      <p
        className={cn("flex flex-wrap items-center gap-x-3 gap-y-1 text-sm", subtle)}
        style={textTheme === "onSurface" ? { color: "var(--body-text)" } : undefined}
      >
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" aria-hidden />
          {openStatus}
        </span>
        {showPhone && phone ? (
          <a
            href={`tel:${phone.replace(/\s/g, "")}`}
            className="inline-flex items-center gap-1.5 underline-offset-2 hover:underline"
          >
            <Phone className="h-3.5 w-3.5" aria-hidden />
            {phone}
          </a>
        ) : null}
      </p>

      <div
        className={cn(
          "flex flex-col gap-3 sm:flex-row sm:items-center",
          isCenter ? "sm:justify-center" : "sm:justify-start",
        )}
      >
        <button
          type="button"
          onClick={onReserve}
          className={cn(ctaStyle.className, "min-h-[52px] px-8 text-sm uppercase tracking-[0.16em]")}
          style={ctaStyle.style}
        >
          {ctaLabel}
        </button>
        {showSecondary && secondaryHref ? (
          <a
            href={secondaryHref}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "inline-flex min-h-[52px] items-center justify-center gap-2 rounded-[var(--radius)] px-8 text-sm font-semibold uppercase tracking-[0.16em] transition",
              textTheme === "onImage"
                ? "border border-white/40 text-white hover:bg-white/10"
                : "border border-[color-mix(in_srgb,var(--heading-color)_25%,transparent)] hover:bg-[color-mix(in_srgb,var(--heading-color)_6%,transparent)]",
            )}
            style={textTheme === "onSurface" ? { color: "var(--heading-color)" } : undefined}
          >
            {secondaryLabel}
            <ChevronRight className="h-4 w-4" aria-hidden />
          </a>
        ) : (
          <button
            type="button"
            onClick={() => scrollToId("concept")}
            className={cn(
              "inline-flex min-h-[52px] items-center justify-center gap-2 rounded-[var(--radius)] px-8 text-sm font-semibold uppercase tracking-[0.16em] transition",
              textTheme === "onImage"
                ? "border border-white/40 text-white hover:bg-white/10"
                : "border border-[color-mix(in_srgb,var(--heading-color)_25%,transparent)] hover:bg-[color-mix(in_srgb,var(--heading-color)_6%,transparent)]",
            )}
            style={textTheme === "onSurface" ? { color: "var(--heading-color)" } : undefined}
          >
            Découvrir le concept
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
        )}
      </div>
    </div>
  );
}

export function PremiumHero({
  coverImageUrl,
  logoUrl,
  headline,
  cuisineCityLine,
  badge,
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
  heroLayout = "overlay",
  heroHeight = "normal",
  previewMode = false,
}: {
  coverImageUrl?: string | null;
  logoUrl?: string | null;
  headline: string;
  cuisineCityLine?: string;
  badge?: string;
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
  heroLayout?: HeroLayoutVariant;
  heroHeight?: "compact" | "normal" | "tall";
  previewMode?: boolean;
}) {
  const minH = premiumHeroMinHeight(heroHeight, previewMode);
  const isCenter = heroAlign === "center" || heroLayout === "center";
  const align: "left" | "center" = isCenter ? "center" : "left";

  /* === LAYOUT 1 : SPLIT — image à droite, contenu sur fond clair à gauche === */
  if (heroLayout === "split" && coverImageUrl) {
    return (
      <section
        id="accueil"
        className={cn(
          "relative w-full scroll-mt-20 overflow-hidden",
          minH,
        )}
        style={{ backgroundColor: "var(--page-bg)" }}
      >
        <div className="grid h-full min-h-inherit grid-cols-1 lg:grid-cols-[1.05fr_1fr]">
          <div className="relative flex items-center px-5 pb-12 pt-24 sm:px-10 lg:px-16 lg:pb-16 lg:pt-32">
            <div className="w-full max-w-xl">
              <HeroContentInner
                logoUrl={logoUrl}
                cuisineCityLine={cuisineCityLine}
                badge={badge}
                headline={headline}
                tagline={tagline}
                openStatus={openStatus}
                phone={phone}
                showPhone={showPhone}
                ctaLabel={ctaLabel}
                secondaryLabel={secondaryLabel}
                secondaryHref={secondaryHref}
                showSecondary={showSecondary}
                onReserve={onReserve}
                ctaStyle={ctaStyle}
                textTheme="onSurface"
                align="left"
              />
            </div>
          </div>
          <div className="relative min-h-[260px] overflow-hidden lg:min-h-full">
            <Image
              src={coverImageUrl}
              alt=""
              fill
              priority
              className="object-cover"
              sizes="(max-width:1024px) 100vw, 50vw"
              unoptimized
            />
            <div
              className="absolute inset-0 bg-black"
              style={{ opacity: overlayOpacity * 0.45 }}
              aria-hidden
            />
          </div>
        </div>
      </section>
    );
  }

  /* === LAYOUT 2 : CENTER — image en fond, contenu centré (style minimal/brasserie) === */
  if (heroLayout === "center") {
    return (
      <section
        id="accueil"
        className={cn(
          "relative flex w-full scroll-mt-20 flex-col items-center justify-center overflow-hidden",
          minH,
        )}
      >
        {coverImageUrl ? (
          <Image
            src={coverImageUrl}
            alt=""
            fill
            priority
            className="object-cover"
            sizes="100vw"
            unoptimized
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, var(--hero-primary) 0%, color-mix(in srgb, var(--accent-color) 25%, var(--hero-primary)) 100%)`,
            }}
            aria-hidden
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/55" aria-hidden />
        <div className="absolute inset-0 bg-black" style={{ opacity: overlayOpacity }} aria-hidden />
        <div className="relative z-[1] mx-auto w-full max-w-3xl px-5 pb-20 pt-28 text-center sm:px-8 sm:pb-28 sm:pt-32">
          <HeroContentInner
            logoUrl={logoUrl}
            cuisineCityLine={cuisineCityLine}
            badge={badge}
            headline={headline}
            tagline={tagline}
            openStatus={openStatus}
            phone={phone}
            showPhone={showPhone}
            ctaLabel={ctaLabel}
            secondaryLabel={secondaryLabel}
            secondaryHref={secondaryHref}
            showSecondary={showSecondary}
            onReserve={onReserve}
            ctaStyle={ctaStyle}
            textTheme="onImage"
            align="center"
          />
        </div>
      </section>
    );
  }

  /* === LAYOUT 3 (DEFAULT) : OVERLAY immersif ou LEFT — image plein cadre, contenu en bas/gauche === */
  return (
    <section
      id="accueil"
      className={cn(
        "relative flex w-full scroll-mt-20 flex-col overflow-hidden",
        minH,
      )}
    >
      {coverImageUrl ? (
        <Image
          src={coverImageUrl}
          alt=""
          fill
          priority
          className="object-cover"
          sizes="100vw"
          unoptimized
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(160deg, var(--hero-primary) 0%, color-mix(in srgb, var(--body-text) 18%, var(--hero-primary)) 100%)`,
          }}
          aria-hidden
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/15" aria-hidden />
      <div className="absolute inset-0 bg-black" style={{ opacity: overlayOpacity }} aria-hidden />

      {/* Contenu : positionné dans le tiers inférieur pour un rendu cinéma */}
      <div
        className={cn(
          "relative z-[1] mx-auto mt-auto flex w-full max-w-7xl flex-col px-5 pb-14 pt-28 sm:px-8 sm:pb-20 sm:pt-32 lg:px-12 lg:pb-24",
          align === "center" ? "items-center text-center" : "items-start text-left",
        )}
      >
        <HeroContentInner
          logoUrl={logoUrl}
          cuisineCityLine={cuisineCityLine}
          badge={badge}
          headline={headline}
          tagline={tagline}
          openStatus={openStatus}
          phone={phone}
          showPhone={showPhone}
          ctaLabel={ctaLabel}
          secondaryLabel={secondaryLabel}
          secondaryHref={secondaryHref}
          showSecondary={showSecondary}
          onReserve={onReserve}
          ctaStyle={ctaStyle}
          textTheme="onImage"
          align={align}
        />
      </div>
    </section>
  );
}

export function ConceptSection({
  title,
  body,
  imageUrl,
  pillars,
  eyebrow = "Le concept",
  layout = "image-right",
}: {
  title: string;
  body: string;
  imageUrl?: string;
  pillars: ConceptPillar[];
  eyebrow?: string;
  layout?: "image-right" | "image-left" | "stacked";
}) {
  if (!body.trim() && !imageUrl && pillars.every((p) => !p.title.trim())) return null;

  const stacked = layout === "stacked" || !imageUrl;
  const imageOnRight = layout === "image-right";

  return (
    <section
      id="concept"
      className="scroll-mt-24 border-t border-[color-mix(in_srgb,var(--body-text)_8%,transparent)]"
    >
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div
          className={cn(
            "grid items-center gap-12",
            stacked ? "grid-cols-1 max-w-3xl mx-auto text-center" : "lg:grid-cols-2 lg:gap-20",
          )}
        >
          {imageUrl && !stacked ? (
            <div
              className={cn(
                "relative aspect-[4/5] overflow-hidden sm:aspect-[5/6]",
                imageOnRight ? "lg:order-2" : "lg:order-1",
              )}
            >
              <Image
                src={imageUrl}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width:1024px) 100vw, 50vw"
                unoptimized
              />
              <div
                className="pointer-events-none absolute inset-x-6 bottom-6 hidden h-px lg:block"
                style={{ backgroundColor: "color-mix(in srgb, var(--accent-color) 45%, transparent)" }}
                aria-hidden
              />
            </div>
          ) : null}

          <div className={cn(!stacked && (imageOnRight ? "lg:order-1" : "lg:order-2"))}>
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.32em] opacity-60"
              style={{ color: "var(--heading-color)" }}
            >
              {eyebrow}
            </p>
            <h2
              className="mt-4 text-3xl font-medium leading-[1.1] sm:text-4xl lg:text-[2.75rem]"
              style={{ fontFamily: "var(--heading-font)", color: "var(--heading-color)" }}
            >
              {title}
            </h2>
            <div
              className={cn("mt-5 h-px w-16", stacked && "mx-auto")}
              style={{ backgroundColor: "var(--accent-color)" }}
              aria-hidden
            />
            {body.trim() ? (
              <p
                className={cn(
                  "mt-6 text-pretty text-base leading-relaxed opacity-90 sm:text-lg",
                  stacked ? "mx-auto max-w-xl" : "max-w-xl",
                )}
                style={{ color: "var(--body-text)" }}
              >
                {body}
              </p>
            ) : null}
          </div>
        </div>

        {pillars.length > 0 ? (
          <div
            className={cn(
              "mt-16 grid gap-8",
              pillars.length >= 3 ? "sm:grid-cols-3" : "sm:grid-cols-2",
            )}
          >
            {pillars.map((p, i) => (
              <article key={`${p.title}-${i}`} className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
                    style={{
                      backgroundColor: "color-mix(in srgb, var(--accent-color) 16%, transparent)",
                      color: "var(--accent-color)",
                      fontFamily: "var(--heading-font)",
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3
                    className="text-lg font-medium leading-tight"
                    style={{ fontFamily: "var(--heading-font)", color: "var(--heading-color)" }}
                  >
                    {p.title}
                  </h3>
                </div>
                {p.text ? (
                  <p
                    className="text-sm leading-relaxed opacity-85"
                    style={{ color: "var(--body-text)" }}
                  >
                    {p.text}
                  </p>
                ) : null}
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
  eyebrow,
}: {
  section: EditorialSectionContent;
  previewMode?: boolean;
  eyebrow?: string;
}) {
  if (!section.enabled) return null;
  const hasImage = Boolean(section.imageUrl.trim());
  const isFull = section.layout === "full-bleed" && hasImage;

  if (isFull) {
    return (
      <section
        className={cn(
          "relative overflow-hidden",
          previewMode ? "min-h-[360px]" : "min-h-[min(60vh,560px)]",
        )}
      >
        <Image src={section.imageUrl} alt="" fill className="object-cover" sizes="100vw" unoptimized />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div
          className={cn(
            "relative flex h-full items-end px-5 py-16 sm:px-8 lg:px-12",
            previewMode ? "min-h-[360px]" : "min-h-[min(60vh,560px)]",
          )}
        >
          <div className="max-w-2xl text-white">
            {eyebrow ? (
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/75">
                {eyebrow}
              </p>
            ) : null}
            <h2 className="text-3xl font-medium leading-tight sm:text-4xl" style={{ fontFamily: "var(--heading-font)" }}>
              {section.title}
            </h2>
            {section.text ? (
              <p className="mt-5 text-base leading-relaxed text-white/90">{section.text}</p>
            ) : null}
            {section.buttonLabel && section.buttonUrl ? (
              <a
                href={section.buttonUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-7 inline-flex items-center gap-2 border-b border-white/70 pb-1 text-sm font-semibold uppercase tracking-[0.18em] text-white"
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
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:gap-20 lg:px-12 lg:py-24">
        {hasImage ? (
          <div
            className={cn(
              "relative aspect-[4/5] overflow-hidden sm:aspect-[5/6]",
              !imageFirst && "lg:order-2",
            )}
          >
            <Image src={section.imageUrl} alt="" fill className="object-cover" sizes="(max-width:1024px) 100vw, 50vw" unoptimized />
          </div>
        ) : null}
        <div className={cn(!imageFirst && hasImage && "lg:order-1")}>
          {eyebrow ? (
            <p
              className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] opacity-60"
              style={{ color: "var(--heading-color)" }}
            >
              {eyebrow}
            </p>
          ) : null}
          <h2
            className="text-2xl font-medium leading-tight sm:text-3xl lg:text-4xl"
            style={{ fontFamily: "var(--heading-font)", color: "var(--heading-color)" }}
          >
            {section.title}
          </h2>
          {section.text ? (
            <p
              className="mt-5 text-pretty text-base leading-relaxed opacity-90"
              style={{ color: "var(--body-text)" }}
            >
              {section.text}
            </p>
          ) : null}
          {section.buttonLabel && section.buttonUrl ? (
            <a
              href={section.buttonUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-7 inline-flex items-center gap-2 border-b-2 pb-1 text-sm font-semibold uppercase tracking-[0.18em]"
              style={{ borderColor: "var(--accent-color)", color: "var(--accent-color)" }}
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
  eyebrow = "Carte & offres",
  title = "Notre menu",
}: {
  offers: MenuOfferItem[];
  menuHref?: string | null;
  menuPdfLabel?: string;
  eyebrow?: string;
  title?: string;
}) {
  const hasOffers = offers.length > 0;
  if (!hasOffers && !menuHref) return null;

  return (
    <section
      id="menu"
      className="scroll-mt-24 border-t border-[color-mix(in_srgb,var(--body-text)_8%,transparent)] bg-[color-mix(in_srgb,var(--body-text)_4%,var(--page-bg))]"
    >
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.32em] opacity-60"
              style={{ color: "var(--heading-color)" }}
            >
              {eyebrow}
            </p>
            <h2
              className="mt-3 text-3xl font-medium sm:text-4xl"
              style={{ fontFamily: "var(--heading-font)", color: "var(--heading-color)" }}
            >
              {title}
            </h2>
            <div className="mt-4 h-px w-16" style={{ backgroundColor: "var(--accent-color)" }} aria-hidden />
          </div>
          {menuHref ? (
            <a
              href={menuHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-2 border-b-2 pb-1 text-sm font-semibold uppercase tracking-[0.18em]"
              style={{ borderColor: "var(--accent-color)", color: "var(--accent-color)" }}
            >
              {menuPdfLabel ?? "Voir la carte complète"}
              <ChevronRight className="h-4 w-4" />
            </a>
          ) : null}
        </div>

        {hasOffers ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {offers.map((o) => (
              <article
                key={o.id}
                className="group flex flex-col overflow-hidden bg-[var(--page-bg)] shadow-[0_24px_80px_-48px_rgba(15,23,42,0.25)] transition duration-500 hover:shadow-[0_32px_100px_-48px_rgba(15,23,42,0.35)]"
              >
                {o.imageUrl ? (
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                      src={o.imageUrl}
                      alt=""
                      fill
                      className="object-cover transition duration-700 group-hover:scale-[1.04]"
                      sizes="400px"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div
                    className="aspect-[16/10] w-full"
                    style={{
                      background:
                        "linear-gradient(135deg, color-mix(in srgb, var(--accent-color) 16%, var(--page-bg)) 0%, var(--page-bg) 100%)",
                    }}
                    aria-hidden
                  />
                )}
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-start justify-between gap-3">
                    <h3
                      className="text-lg font-medium leading-tight"
                      style={{ fontFamily: "var(--heading-font)", color: "var(--heading-color)" }}
                    >
                      {o.title}
                    </h3>
                    {o.price ? (
                      <span
                        className="shrink-0 text-base font-semibold"
                        style={{ color: "var(--accent-color)", fontFamily: "var(--heading-font)" }}
                      >
                        {o.price}
                      </span>
                    ) : null}
                  </div>
                  {o.description ? (
                    <p
                      className="mt-3 flex-1 text-sm leading-relaxed opacity-85"
                      style={{ color: "var(--body-text)" }}
                    >
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
  eyebrow = "Galerie",
}: {
  images: string[];
  style: GalleryStyle;
  instagramUrl?: string | null;
  showInstagram?: boolean;
  eyebrow?: string;
}) {
  if (images.length === 0) return null;
  const title = showInstagram && instagramUrl ? "L'ambiance en images" : "Le lieu en images";

  /* === STYLE SHOWCASE : 1 grande photo + mosaïque secondaire (premium) === */
  if (style === "showcase" && images.length >= 2) {
    const [hero, ...rest] = images;
    return (
      <section className="border-t border-[color-mix(in_srgb,var(--body-text)_8%,transparent)]">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
          <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.32em] opacity-60"
                style={{ color: "var(--heading-color)" }}
              >
                {eyebrow}
              </p>
              <h2
                className="mt-3 text-3xl font-medium sm:text-4xl"
                style={{ fontFamily: "var(--heading-font)", color: "var(--heading-color)" }}
              >
                {title}
              </h2>
            </div>
            {showInstagram && instagramUrl ? (
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold uppercase tracking-[0.2em] underline-offset-4 hover:underline"
                style={{ color: "var(--accent-color)" }}
              >
                Voir sur Instagram →
              </a>
            ) : null}
          </div>
          <div className="grid gap-3 lg:grid-cols-12 lg:gap-4">
            <div className="relative aspect-[16/10] overflow-hidden lg:col-span-8 lg:aspect-auto lg:min-h-[480px]">
              <Image
                src={hero}
                alt=""
                fill
                className="object-cover transition duration-700 hover:scale-[1.02]"
                sizes="(max-width:1024px) 100vw, 66vw"
                unoptimized
                priority
              />
            </div>
            <div className="grid grid-cols-2 gap-3 lg:col-span-4 lg:grid-cols-1">
              {rest.slice(0, 4).map((src) => (
                <div key={src} className="relative aspect-[4/3] overflow-hidden lg:aspect-[16/10]">
                  <Image
                    src={src}
                    alt=""
                    fill
                    className="object-cover transition duration-700 hover:scale-[1.05]"
                    sizes="300px"
                    unoptimized
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  /* === STYLE INSTAGRAM : grille carrée régulière, style social === */
  if (style === "instagram") {
    return (
      <section className="border-t border-[color-mix(in_srgb,var(--body-text)_8%,transparent)]">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
          <div className="mb-8 text-center">
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.32em] opacity-60"
              style={{ color: "var(--heading-color)" }}
            >
              {eyebrow}
            </p>
            <h2
              className="mt-3 text-3xl font-medium sm:text-4xl"
              style={{ fontFamily: "var(--heading-font)", color: "var(--heading-color)" }}
            >
              {title}
            </h2>
            {showInstagram && instagramUrl ? (
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block text-sm font-semibold uppercase tracking-[0.2em]"
                style={{ color: "var(--accent-color)" }}
              >
                @ Instagram
              </a>
            ) : null}
          </div>
          <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-4">
            {images.slice(0, 8).map((src) => (
              <div key={src} className="relative aspect-square overflow-hidden">
                <Image
                  src={src}
                  alt=""
                  fill
                  className="object-cover transition duration-500 hover:scale-[1.06]"
                  sizes="(max-width:768px) 50vw, 25vw"
                  unoptimized
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  /* === STYLE GRID (par défaut) : masonry verticale === */
  return (
    <section className="border-t border-[color-mix(in_srgb,var(--body-text)_8%,transparent)]">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="mb-10">
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.32em] opacity-60"
            style={{ color: "var(--heading-color)" }}
          >
            {eyebrow}
          </p>
          <h2
            className="mt-3 text-3xl font-medium sm:text-4xl"
            style={{ fontFamily: "var(--heading-font)", color: "var(--heading-color)" }}
          >
            {title}
          </h2>
        </div>
        <div className="columns-2 gap-3 md:columns-3 md:gap-4">
          {images.map((src, i) => (
            <div
              key={src}
              className={cn(
                "relative mb-3 break-inside-avoid overflow-hidden md:mb-4",
                i % 3 === 0 ? "aspect-[3/4]" : i % 3 === 1 ? "aspect-[4/3]" : "aspect-square",
              )}
            >
              <Image
                src={src}
                alt=""
                fill
                className="object-cover transition duration-500 hover:scale-[1.04]"
                sizes="(max-width:768px) 50vw, 33vw"
                unoptimized
              />
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
    <section className="relative overflow-hidden border-t border-[color-mix(in_srgb,var(--body-text)_8%,transparent)]">
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at 30% 30%, color-mix(in srgb, var(--accent-color) 22%, transparent) 0%, transparent 55%), linear-gradient(180deg, var(--page-bg) 0%, color-mix(in srgb, var(--accent-color) 8%, var(--page-bg)) 100%)`,
        }}
        aria-hidden
      />
      <div className="relative mx-auto max-w-3xl px-5 py-24 text-center sm:px-8 lg:py-32">
        <p
          className="text-[11px] font-semibold uppercase tracking-[0.32em] opacity-60"
          style={{ color: "var(--heading-color)" }}
        >
          Prêt·e à venir
        </p>
        <h2
          className="mt-3 text-3xl font-medium leading-tight sm:text-4xl lg:text-5xl"
          style={{ fontFamily: "var(--heading-font)", color: "var(--heading-color)" }}
        >
          {title}
        </h2>
        <p
          className="mx-auto mt-5 max-w-lg text-base leading-relaxed opacity-90 sm:text-lg"
          style={{ color: "var(--body-text)" }}
        >
          {subtitle}
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onReserve}
            className={cn(ctaStyle.className, "min-h-[56px] px-10 uppercase tracking-[0.16em]")}
            style={ctaStyle.style}
          >
            {buttonLabel}
          </button>
          {showPhone && phone ? (
            <a
              href={`tel:${phone.replace(/\s/g, "")}`}
              className="inline-flex min-h-[56px] items-center gap-2 px-6 text-sm font-semibold uppercase tracking-[0.16em]"
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
    <section
      id="infos"
      className="scroll-mt-24 border-t border-[color-mix(in_srgb,var(--body-text)_8%,transparent)] bg-[color-mix(in_srgb,var(--body-text)_4%,var(--page-bg))]"
    >
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12 lg:py-24">
        <div className="max-w-2xl">
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.32em] opacity-60"
            style={{ color: "var(--heading-color)" }}
          >
            Venir nous voir
          </p>
          <h2
            className="mt-3 text-3xl font-medium sm:text-4xl"
            style={{ fontFamily: "var(--heading-font)", color: "var(--heading-color)" }}
          >
            Infos pratiques
          </h2>
        </div>
        <div className="mt-10 grid gap-10 md:grid-cols-2 lg:grid-cols-3 lg:gap-12">
          {address ? (
            <div id="contact" className="flex flex-col gap-3">
              <span
                className="flex h-10 w-10 items-center justify-center rounded-full"
                style={{
                  backgroundColor: "color-mix(in srgb, var(--accent-color) 12%, transparent)",
                  color: "var(--accent-color)",
                }}
              >
                <MapPin className="h-5 w-5" />
              </span>
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.22em] opacity-60"
                style={{ color: "var(--heading-color)" }}
              >
                Adresse
              </p>
              <p
                className="text-base leading-relaxed"
                style={{ color: "var(--heading-color)", fontFamily: "var(--heading-font)" }}
              >
                {address}
              </p>
              {showMaps && googleMapsUrl ? (
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-semibold uppercase tracking-[0.18em] underline-offset-4 hover:underline"
                  style={{ color: "var(--accent-color)" }}
                >
                  Itinéraire
                  <ChevronRight className="h-4 w-4" />
                </a>
              ) : null}
            </div>
          ) : null}
          {phone ? (
            <div className="flex flex-col gap-3">
              <span
                className="flex h-10 w-10 items-center justify-center rounded-full"
                style={{
                  backgroundColor: "color-mix(in srgb, var(--accent-color) 12%, transparent)",
                  color: "var(--accent-color)",
                }}
              >
                <Phone className="h-5 w-5" />
              </span>
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.22em] opacity-60"
                style={{ color: "var(--heading-color)" }}
              >
                Téléphone
              </p>
              <a
                href={`tel:${phone.replace(/\s/g, "")}`}
                className="text-base font-medium"
                style={{ color: "var(--heading-color)", fontFamily: "var(--heading-font)" }}
              >
                {phone}
              </a>
            </div>
          ) : null}
          {openingHoursLines.length > 0 ? (
            <div className="flex flex-col gap-3">
              <span
                className="flex h-10 w-10 items-center justify-center rounded-full"
                style={{
                  backgroundColor: "color-mix(in srgb, var(--accent-color) 12%, transparent)",
                  color: "var(--accent-color)",
                }}
              >
                <Clock className="h-5 w-5" />
              </span>
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.22em] opacity-60"
                style={{ color: "var(--heading-color)" }}
              >
                Horaires
              </p>
              <ul
                className="space-y-1 text-sm leading-relaxed"
                style={{ color: "var(--body-text)" }}
              >
                {openingHoursLines.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {parking?.trim() ? (
            <div className="flex flex-col gap-3">
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.22em] opacity-60"
                style={{ color: "var(--heading-color)" }}
              >
                Parking
              </p>
              <p className="text-sm leading-relaxed" style={{ color: "var(--body-text)" }}>
                {parking}
              </p>
            </div>
          ) : null}
          {accessibility?.trim() ? (
            <div className="flex flex-col gap-3">
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.22em] opacity-60"
                style={{ color: "var(--heading-color)" }}
              >
                Accessibilité
              </p>
              <p className="text-sm leading-relaxed" style={{ color: "var(--body-text)" }}>
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
  eyebrow = "Réservation",
}: {
  title: string;
  intro: string;
  groupMessage?: string;
  showPhoneAlt?: boolean;
  phone?: string | null;
  children: React.ReactNode;
  eyebrow?: string;
}) {
  return (
    <section
      id="reservation"
      className="scroll-mt-24 border-t border-[color-mix(in_srgb,var(--body-text)_8%,transparent)]"
      style={{
        background:
          "linear-gradient(180deg, color-mix(in srgb, var(--accent-color) 6%, var(--page-bg)) 0%, var(--page-bg) 80%)",
      }}
    >
      <div className="mx-auto max-w-3xl px-5 py-20 sm:px-8 lg:py-28">
        <header className="mb-10 text-center">
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.32em] opacity-60"
            style={{ color: "var(--heading-color)" }}
          >
            {eyebrow}
          </p>
          <h2
            className="mt-3 text-3xl font-medium md:text-4xl lg:text-[2.5rem]"
            style={{ fontFamily: "var(--heading-font)", color: "var(--heading-color)" }}
          >
            {title}
          </h2>
          <div
            className="mx-auto mt-4 h-px w-16"
            style={{ backgroundColor: "var(--accent-color)" }}
            aria-hidden
          />
          <p
            className="mx-auto mt-5 max-w-xl text-base leading-relaxed opacity-90"
            style={{ color: "var(--body-text)" }}
          >
            {intro}
          </p>
          {groupMessage?.trim() ? (
            <p className="mx-auto mt-3 max-w-xl text-sm opacity-70" style={{ color: "var(--body-text)" }}>
              {groupMessage}
            </p>
          ) : null}
        </header>
        <div
          className="relative rounded-[calc(var(--radius)+8px)] border p-6 shadow-[0_40px_120px_-60px_rgba(15,23,42,0.35)] sm:p-10"
          style={{
            borderColor: "color-mix(in srgb, var(--body-text) 10%, var(--page-bg))",
            backgroundColor: "var(--page-bg)",
          }}
        >
          {children}
        </div>
        {showPhoneAlt && phone ? (
          <p className="mt-8 text-center text-sm" style={{ color: "var(--body-text)" }}>
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

export function HighlightsBand({ items }: { items: string[] }) {
  const visible = items.map((s) => s.trim()).filter(Boolean).slice(0, 6);
  if (visible.length === 0) return null;
  return (
    <section className="border-y border-[color-mix(in_srgb,var(--body-text)_8%,transparent)] bg-[color-mix(in_srgb,var(--body-text)_3%,var(--page-bg))]">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-12 lg:py-14">
        <ul
          className={cn(
            "grid gap-x-8 gap-y-5",
            visible.length === 1
              ? "place-items-center"
              : visible.length === 2
                ? "sm:grid-cols-2"
                : visible.length === 4
                  ? "sm:grid-cols-2 lg:grid-cols-4"
                  : "sm:grid-cols-2 lg:grid-cols-3",
          )}
        >
          {visible.map((item, i) => (
            <li
              key={`${item}-${i}`}
              className="flex items-start gap-3"
              style={{ color: "var(--body-text)" }}
            >
              <span
                className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                style={{
                  backgroundColor: "color-mix(in srgb, var(--accent-color) 14%, var(--page-bg))",
                  color: "var(--accent-color)",
                }}
                aria-hidden
              >
                <Check className="h-4 w-4" />
              </span>
              <span
                className="text-[15px] font-medium leading-snug"
                style={{ color: "var(--heading-color)", fontFamily: "var(--heading-font)" }}
              >
                {item}
              </span>
            </li>
          ))}
        </ul>
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
