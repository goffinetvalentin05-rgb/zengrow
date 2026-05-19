"use client";

import Image from "next/image";
import {
  ChevronRight,
  Check,
  Clock,
  Facebook,
  Gift,
  Globe,
  Instagram,
  Mail,
  MapPin,
  Menu,
  Phone,
  Star,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { cn } from "@/src/lib/utils";
import type { SectionSurface } from "@/src/lib/public-page/theme";
import { PublicPageSection } from "@/src/components/reservation/public-page-section";
import type {
  ConceptPillar,
  CredibilityContent,
  EditorialSectionContent,
  GalleryStyle,
  GiftVouchersSectionContent,
  MenuOfferItem,
} from "@/src/lib/public-page/premium-content";
import { hasCredibilityContent } from "@/src/lib/public-page/premium-content";
import type {
  GiftVouchersSectionCopy,
  NavLinkContent,
  PracticalSectionCopy,
  ReviewsSectionCopy,
} from "@/src/lib/public-page/page-sections";
import {
  DEFAULT_PRACTICAL_DISPLAY,
  practicalSectionHasVisibleContent,
  resolveHeroDisplay,
  resolvePracticalDisplay,
  type HeroSectionDisplay,
  type PracticalSectionDisplay,
} from "@/src/lib/public-page/section-display";

type CtaStyle = { className: string; style?: React.CSSProperties };

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
  navLinks,
  showReserveCta = true,
}: {
  restaurantName: string;
  ctaLabel: string;
  onReserve: () => void;
  visible: boolean;
  previewMode?: boolean;
  navLinks: NavLinkContent[];
  /** Désactivé en parcours showroom : un seul CTA dans le hero + sticky au scroll. */
  showReserveCta?: boolean;
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
          // Reste transparent au-dessus du hero pour un rendu Ã©ditorial ; les couleurs sont dÃ©finies par les CSS vars
          "bg-gradient-to-b from-black/35 via-black/15 to-transparent backdrop-blur-[2px]",
          previewMode ? "sticky top-0 left-0 right-0" : "fixed inset-x-0 top-0",
        )}
      >
        <div className="mx-auto flex max-w-5xl justify-center px-3 pt-3 sm:px-5 sm:pt-4">
          <div className="flex h-[3.25rem] w-full max-w-4xl items-center justify-between gap-3 rounded-full border border-white/15 bg-black/40 px-4 shadow-[0_8px_40px_rgba(0,0,0,0.35)] backdrop-blur-md sm:gap-4 sm:px-5 md:h-14">
          <button
            type="button"
            onClick={() => scrollToId("accueil")}
            className="truncate text-sm font-semibold tracking-wide text-white sm:text-base"
            style={{ fontFamily: "var(--heading-font)" }}
          >
            {restaurantName}
          </button>
          <nav className="hidden max-w-[52%] items-center gap-3 lg:flex lg:gap-4 xl:max-w-none" aria-label="Navigation principale">
            {navLinks.map((item) => (
              <button
                key={item.anchorId}
                type="button"
                onClick={() => scrollToId(item.anchorId)}
                className="shrink-0 text-[10px] font-medium uppercase tracking-[0.12em] text-white/85 transition hover:text-white xl:text-[11px] xl:tracking-[0.16em]"
              >
                {item.label}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            {showReserveCta ? (
              <button
                type="button"
                className="hidden min-h-10 items-center rounded-full border border-white/40 bg-white/5 px-4 text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-white/15 md:inline-flex"
                onClick={onReserve}
              >
                {ctaLabel}
              </button>
            ) : null}
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
            </nav>
            {showReserveCta ? (
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
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}

/**
 * Hauteur minimale du hero.
 * Le hero ne doit JAMAIS imposer de max-h : c'est ce qui causait le bug "haut coupÃ©"
 * dans l'aperÃ§u (le contenu dÃ©bordait et `overflow-hidden` + `justify-end` rognaient le haut).
 */
function premiumHeroMinHeight(heroHeight: "compact" | "normal" | "tall", previewMode: boolean) {
  if (previewMode) {
    if (heroHeight === "compact") return "min-h-[480px]";
    if (heroHeight === "tall") return "min-h-[680px]";
    return "min-h-[580px]";
  }
  if (heroHeight === "compact") return "min-h-[min(68vh,600px)]";
  if (heroHeight === "tall") return "min-h-[min(92vh,960px)]";
  return "min-h-[min(85vh,840px)]";
}

function HeroContentInner({
  badgeText,
  logoUrl,
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
  discoverConceptLabel,
  discoverAnchorId = "concept",
  tone = "default",
  display,
}: {
  badgeText?: string | null;
  logoUrl?: string | null;
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
  discoverConceptLabel: string;
  discoverAnchorId?: string;
  tone?: "default" | "cinematic";
  display: HeroSectionDisplay;
}) {
  const isCenter = align === "center";
  const cinematic = tone === "cinematic";
  const subtle = textTheme === "onImage" ? "text-white/65" : "opacity-60";
  const headingColor =
    textTheme === "onImage" ? ("#ffffff" as const) : ("var(--heading-color)" as const);
  const bodyColor =
    textTheme === "onImage"
      ? ("rgba(255,255,255,0.88)" as const)
      : ("var(--body-text)" as const);

  const badgeTint =
    textTheme === "onImage"
      ? "border-white/25 bg-black/35 text-[11px] text-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]"
      : "border-[color-mix(in_srgb,var(--body-text)_16%,transparent)] bg-[color-mix(in_srgb,var(--page-bg)_70%,transparent)] text-[11px] text-[color-mix(in_srgb,var(--heading-color)_88%,transparent)] shadow-sm backdrop-blur-sm";

  return (
    <div
      className={cn(
        "flex w-full flex-col",
        cinematic ? "gap-4 sm:gap-5" : "gap-5 sm:gap-6",
        isCenter && "items-center text-center",
      )}
    >
      {display.showBadge && badgeText?.trim() ? (
        <p
          className={cn(
            "inline-flex max-w-[90vw] items-center rounded-full px-5 py-2 font-semibold uppercase tracking-[0.28em]",
            badgeTint,
            isCenter ? "justify-center text-center" : "",
          )}
        >
          {badgeText.trim()}
        </p>
      ) : null}
      {display.showLogo && logoUrl?.trim() ? (
        <>
          <h1 className="sr-only">{headline}</h1>
          <div
            className={cn(
              "relative w-full max-w-[min(340px,88vw)]",
              isCenter ? "mx-auto" : "",
            )}
            style={{ height: "clamp(4.5rem, 14vw, 8.75rem)" }}
          >
            <Image
              src={logoUrl.trim()}
              alt={headline}
              fill
              className={cn(
                "object-contain",
                isCenter ? "object-center" : "object-left",
              )}
              style={
                textTheme === "onImage"
                  ? { filter: "drop-shadow(0 4px 24px rgba(0,0,0,0.35))" }
                  : undefined
              }
              sizes="(max-width:768px) 85vw, 340px"
              priority
              unoptimized
            />
          </div>
        </>
      ) : display.showTitle ? (
        <h1
          className={cn(
            "max-w-3xl text-balance font-medium leading-[0.98] tracking-tight",
            isCenter && "mx-auto",
          )}
          style={{
            fontFamily: "var(--heading-font), Georgia, serif",
            fontSize: "clamp(2.25rem, 5.5vw, 4.25rem)",
            color: headingColor,
            letterSpacing: "-0.015em",
            fontWeight: 500,
          }}
        >
          {headline}
        </h1>
      ) : null}

      {display.showTagline && tagline ? (
        <p
          className={cn(
            "max-w-2xl text-pretty leading-[1.58]",
            (tagline?.length ?? 0) < 100
              ? "text-[clamp(1.0625rem,2.75vw,1.45rem)] font-medium italic tracking-[0.02em] sm:text-[1.375rem]"
              : "text-base font-light sm:text-lg",
            isCenter ? "mx-auto text-center" : "",
          )}
          style={{
            color: bodyColor,
            fontFamily:
              (tagline?.length ?? 0) < 100
                ? "var(--heading-font), ui-serif, Georgia, 'Times New Roman', serif"
                : "var(--body-font), system-ui, sans-serif",
          }}
        >
          {tagline}
        </p>
      ) : null}

      {display.showOpenStatus || (display.showPhone && showPhone && phone) ? (
      <div
        className={cn(
          "flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[13px] font-medium",
          subtle,
          isCenter && "justify-center",
        )}
        style={textTheme === "onSurface" ? { color: "var(--body-text)" } : undefined}
      >
        {display.showOpenStatus ? (
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" aria-hidden />
          {openStatus}
        </span>
        ) : null}
        {display.showPhone && showPhone && phone ? (
          <>
            <span
              className={cn(
                "hidden h-3 w-px sm:inline-block",
                textTheme === "onImage" ? "bg-white/35" : "bg-current opacity-25",
              )}
              aria-hidden
            />
            <a
              href={`tel:${phone.replace(/\s/g, "")}`}
              className="inline-flex items-center gap-1.5 underline-offset-2 hover:underline"
            >
              <Phone className="h-3.5 w-3.5" aria-hidden />
              {phone}
            </a>
          </>
        ) : null}
      </div>
      ) : null}

      {display.showPrimaryCta || display.showSecondaryCta ? (
        <div
          className={cn(
            "mt-2 flex flex-col gap-3 sm:flex-row sm:items-center",
            isCenter ? "sm:justify-center" : "sm:justify-start",
          )}
        >
          {display.showPrimaryCta ? (
            <button
              type="button"
              onClick={onReserve}
              className={cn(
                ctaStyle.className,
                cinematic
                  ? "min-h-[52px] px-8 text-[13px] font-semibold tracking-[0.1em]"
                  : "min-h-[56px] px-9 text-sm uppercase tracking-[0.18em]",
              )}
              style={ctaStyle.style}
            >
              {ctaLabel}
            </button>
          ) : null}
        {display.showSecondaryCta && showSecondary && secondaryHref ? (
          <a
            href={secondaryHref}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "group inline-flex min-h-[56px] items-center gap-2 px-2 text-sm font-semibold uppercase tracking-[0.18em] transition",
              textTheme === "onImage"
                ? "text-white/85 hover:text-white"
                : "hover:opacity-80",
            )}
            style={textTheme === "onSurface" ? { color: "var(--heading-color)" } : undefined}
          >
            <span className="border-b border-current pb-1">{secondaryLabel}</span>
            <ChevronRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden />
          </a>
        ) : display.showSecondaryCta ? (
          <button
            type="button"
            onClick={() => scrollToId(discoverAnchorId)}
            className={cn(
              "group inline-flex items-center gap-2 px-2 text-sm font-medium tracking-wide transition",
              cinematic ? "min-h-0 py-1 opacity-90" : "min-h-[56px] font-semibold uppercase tracking-[0.18em]",
              textTheme === "onImage"
                ? "text-white/85 hover:text-white"
                : "hover:opacity-80",
            )}
            style={textTheme === "onSurface" ? { color: "var(--heading-color)" } : undefined}
          >
            <span className="border-b border-current pb-1">{discoverConceptLabel}</span>
            <ChevronRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden />
          </button>
        ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function PremiumHero({
  badgeText,
  coverImageUrl,
  logoUrl,
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
  overlayOpacity,
  heroAlign,
  heroLayout = "overlay",
  heroHeight = "normal",
  previewMode = false,
  discoverConceptLabel,
  scrollHintLabel,
  display: displayPatch,
  discoverAnchorId = "concept",
  tone = "default",
}: {
  badgeText?: string | null;
  coverImageUrl?: string | null;
  logoUrl?: string | null;
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
  overlayOpacity: number;
  heroAlign: "left" | "center" | "right";
  heroLayout?: HeroLayoutVariant;
  heroHeight?: "compact" | "normal" | "tall";
  previewMode?: boolean;
  discoverConceptLabel: string;
  scrollHintLabel: string;
  display?: Partial<HeroSectionDisplay>;
  discoverAnchorId?: string;
  tone?: "default" | "cinematic";
}) {
  const display = resolveHeroDisplay(displayPatch, {
    showPhone,
    showSecondaryCta: showSecondary,
  });
  const effectiveCoverUrl =
    display.showCoverImage && coverImageUrl?.trim() ? coverImageUrl.trim() : null;
  const minH = premiumHeroMinHeight(heroHeight, previewMode);
  const isCenter = heroAlign === "center" || heroLayout === "center";
  const align: "left" | "center" = isCenter ? "center" : "left";

  /* === LAYOUT 1 : SPLIT â€” image Ã  droite, contenu sur fond clair Ã  gauche === */
  if (heroLayout === "split" && effectiveCoverUrl) {
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
            <div className="relative flex items-center px-5 pb-12 pt-20 sm:px-10 lg:px-16 lg:pb-16 lg:pt-28">
            <div className="w-full max-w-xl">
              <HeroContentInner
                badgeText={badgeText}
                logoUrl={logoUrl}
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
                discoverConceptLabel={discoverConceptLabel}
                discoverAnchorId={discoverAnchorId}
                tone={tone}
                display={display}
              />
            </div>
          </div>
          <div className="relative min-h-[260px] overflow-hidden lg:min-h-full">
            <Image
              src={effectiveCoverUrl}
              alt=""
              fill
              priority
              className="object-cover zg-public-hero-media"
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

  /* === LAYOUT 2 : CENTER â€” image en fond, contenu centrÃ© (style minimal/brasserie) === */
  if (heroLayout === "center") {
    return (
      <section
        id="accueil"
        className={cn(
          "relative flex w-full scroll-mt-20 flex-col items-center justify-center overflow-hidden",
          minH,
        )}
      >
        {effectiveCoverUrl ? (
          <div className="absolute inset-0 overflow-hidden">
            <Image
              src={effectiveCoverUrl}
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
              background: `linear-gradient(135deg, var(--hero-primary) 0%, color-mix(in srgb, var(--accent-color) 25%, var(--hero-primary)) 100%)`,
            }}
            aria-hidden
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/28 to-black/58" aria-hidden />
        <div
          className="absolute inset-0 mix-blend-soft-light opacity-40"
          style={{
            background:
              "radial-gradient(ellipse 90% 55% at 50% 18%, color-mix(in srgb, var(--accent-color) 22%, transparent) 0%, transparent 58%)",
          }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-black" style={{ opacity: overlayOpacity }} aria-hidden />
        <div className="relative z-[1] mx-auto flex w-full max-w-3xl flex-col justify-center px-5 pb-20 pt-24 text-center sm:px-8 sm:pb-24 sm:pt-28">
          <HeroContentInner
            badgeText={badgeText}
            logoUrl={logoUrl}
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
            discoverConceptLabel={discoverConceptLabel}
            discoverAnchorId={discoverAnchorId}
            tone={tone}
            display={display}
          />
        </div>
      </section>
    );
  }

  /* === LAYOUT 3 (DEFAULT) : OVERLAY immersif ou LEFT â€” image plein cadre, contenu en bas/gauche === */
  return (
    <section
      id="accueil"
      className={cn(
        "relative flex w-full scroll-mt-20 flex-col overflow-hidden",
        minH,
      )}
    >
      {effectiveCoverUrl ? (
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src={effectiveCoverUrl}
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
            background: `linear-gradient(160deg, var(--hero-primary) 0%, color-mix(in srgb, var(--body-text) 18%, var(--hero-primary)) 100%)`,
          }}
          aria-hidden
        />
      )}
      {/* Voile cinÃ©ma : gradient principal + vignette + chaleur accent discrÃ¨te */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/42 to-black/15" aria-hidden />
      <div
        className="absolute inset-0 mix-blend-soft-light opacity-[0.38]"
        style={{
          background:
            "radial-gradient(ellipse 95% 50% at 50% 12%, color-mix(in srgb, var(--accent-color) 18%, transparent) 0%, transparent 55%)",
        }}
        aria-hidden
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0,0,0,0) 35%, rgba(0,0,0,0.38) 100%)",
        }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-black" style={{ opacity: overlayOpacity }} aria-hidden />

      {/* Contenu : positionnÃ© dans le tiers infÃ©rieur pour un rendu cinÃ©ma */}
      <div
        className={cn(
          "relative z-[1] mx-auto mt-auto flex w-full max-w-7xl flex-col px-5 pb-14 pt-24 sm:px-8 sm:pb-20 sm:pt-28 lg:px-12 lg:pb-24",
          align === "center" ? "items-center text-center" : "items-start text-left",
        )}
      >
        <HeroContentInner
          badgeText={badgeText}
          logoUrl={logoUrl}
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
          discoverConceptLabel={discoverConceptLabel}
          discoverAnchorId={discoverAnchorId}
          tone={tone}
          display={display}
        />
      </div>

      {/* Scroll hint discret, visible uniquement sur les heros immersifs et hors preview */}
      {display.showScrollHint && heroHeight === "tall" && !previewMode ? (
        <button
          type="button"
          onClick={() => scrollToId("concept")}
          aria-label="Faire dÃ©filer vers le contenu"
          className="absolute bottom-6 left-1/2 z-[2] -translate-x-1/2 text-white/70 transition hover:text-white"
        >
          <span className="flex flex-col items-center gap-1.5">
            <span className="text-[9px] font-semibold uppercase tracking-[0.32em]">{scrollHintLabel}</span>
            <span className="block h-8 w-px bg-current" aria-hidden />
          </span>
        </button>
      ) : null}
    </section>
  );
}

export function ConceptSection({
  title,
  body,
  imageUrl,
  pillars,
  eyebrow,
  imageStampLabel,
  layout = "image-right",
}: {
  title: string;
  body: string;
  imageUrl?: string;
  pillars: ConceptPillar[];
  eyebrow: string;
  /** Vide = ne pas afficher le cachet sous lâ€™image. */
  imageStampLabel: string;
  layout?: "image-right" | "image-left" | "stacked";
}) {
  if (!body.trim() && !imageUrl && pillars.every((p) => !p.title.trim())) return null;

  const stacked = layout === "stacked" || !imageUrl;
  const imageOnRight = layout === "image-right";

  // Si le texte fait plus de 60 caractÃ¨res, on active la drop-cap (capitale lettrine Ã©ditoriale).
  const enableDropCap = body.trim().length > 80 && !stacked;
  const dropCapChar = enableDropCap ? body.trim().charAt(0) : null;
  const restOfBody = enableDropCap ? body.trim().slice(1) : body;

  return (
    <section
      id="concept"
      className="scroll-mt-24 relative z-[2] mt-[-2.75rem] bg-[var(--page-bg)] px-5 pb-[4.75rem] pt-[3rem] shadow-[0_-42px_90px_-58px_rgba(0,0,0,0.42)] sm:mt-[-3.75rem] sm:rounded-t-[2rem] sm:px-8 sm:pb-24 sm:pt-12 lg:mt-[-4.75rem] lg:rounded-t-[2.75rem] lg:px-12 lg:pb-32 lg:pt-16"
    >
      <div className="mx-auto max-w-7xl">
        <div
          className={cn(
            "grid items-center gap-12",
            stacked ? "grid-cols-1 max-w-3xl mx-auto text-center" : "lg:grid-cols-[5fr_6fr] lg:gap-24",
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
                className="object-cover transition duration-[1.2s] hover:scale-[1.02]"
                sizes="(max-width:1024px) 100vw, 50vw"
                unoptimized
              />
              {imageStampLabel.trim() ? (
              <div
                className="pointer-events-none absolute inset-x-6 bottom-6 hidden items-center gap-3 lg:flex"
                aria-hidden
              >
                <span
                  className="h-px flex-1"
                  style={{
                    backgroundColor: "color-mix(in srgb, var(--accent-color) 60%, transparent)",
                  }}
                />
                <span className="text-[10px] font-medium uppercase tracking-[0.32em] text-white/85">
                  {imageStampLabel.trim()}
                </span>
                <span
                  className="h-px flex-1"
                  style={{
                    backgroundColor: "color-mix(in srgb, var(--accent-color) 60%, transparent)",
                  }}
                />
              </div>
              ) : null}
            </div>
          ) : null}

          <div className={cn(!stacked && (imageOnRight ? "lg:order-1" : "lg:order-2"))}>
            {eyebrow.trim() ? (
            <div
              className={cn("flex items-center gap-3", stacked && "justify-center")}
            >
              <span
                className="h-px w-10"
                style={{
                  backgroundColor: "color-mix(in srgb, var(--accent-color) 60%, transparent)",
                }}
                aria-hidden
              />
              <p
                className="text-[10px] font-semibold uppercase tracking-[0.32em]"
                style={{ color: "var(--accent-color)" }}
              >
                {eyebrow}
              </p>
            </div>
            ) : null}
            <h2
              className={cn(
                "text-4xl font-medium leading-[1.05] sm:text-5xl lg:text-[3.25rem]",
                eyebrow.trim() ? "mt-5" : "mt-0",
              )}
              style={{
                fontFamily: "var(--heading-font)",
                color: "var(--heading-color)",
                letterSpacing: "-0.015em",
              }}
            >
              {title}
            </h2>
            {body.trim() ? (
              <p
                className={cn(
                  "mt-7 text-pretty text-[17px] font-light leading-[1.7] sm:text-[19px]",
                  stacked ? "mx-auto max-w-xl" : "max-w-xl",
                )}
                style={{
                  color: "var(--body-text)",
                  fontFamily: "var(--body-font), system-ui, sans-serif",
                }}
              >
                {dropCapChar ? (
                  <span
                    className="float-left mr-3 mt-1 text-6xl font-medium leading-[0.85] sm:text-7xl"
                    style={{
                      fontFamily: "var(--heading-font), Georgia, serif",
                      color: "var(--accent-color)",
                    }}
                    aria-hidden
                  >
                    {dropCapChar}
                  </span>
                ) : null}
                {restOfBody}
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
              <article key={p.id} className="flex flex-col gap-3">
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
}: {
  section: EditorialSectionContent;
  previewMode?: boolean;
}) {
  if (!section.enabled) return null;
  const eyebrow = section.eyebrow.trim();
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
    <section>
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:gap-24 lg:px-12 lg:py-28">
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
  eyebrow,
  title,
}: {
  offers: MenuOfferItem[];
  menuHref?: string | null;
  menuPdfLabel?: string;
  eyebrow: string;
  title: string;
}) {
  const hasOffers = offers.length > 0;
  if (!hasOffers && !menuHref) return null;

  // Si toutes les offres ont une image â†’ grille de cartes premium. Sinon â†’ menu Ã©ditorial avec ligne pointillÃ©e.
  const allHaveImages = hasOffers && offers.every((o) => Boolean(o.imageUrl));

  return (
    <section
      id="menu"
      className="scroll-mt-24 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, color-mix(in srgb, var(--accent-color) 5%, var(--page-bg)) 0%, var(--surface-muted, color-mix(in srgb, var(--body-text) 5%, var(--page-bg))) 42%, var(--page-bg) 100%)",
      }}
    >
      <div
        className="pointer-events-none absolute -right-[18%] top-[-10%] h-[420px] w-[520px] rounded-full blur-3xl opacity-[0.16]"
        style={{
          background: "radial-gradient(circle at center, color-mix(in srgb, var(--accent-color) 55%, transparent) 0%, transparent 70%)",
        }}
        aria-hidden
      />
      <div className="relative mx-auto max-w-7xl px-5 py-[4.75rem] sm:px-8 sm:py-28 lg:px-12 lg:py-36">
        <div className="flex flex-col gap-14 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-14 xl:gap-x-24">
          <header className="flex flex-col items-center gap-4 text-center lg:sticky lg:top-28 lg:col-span-4 lg:items-start lg:self-start lg:text-left">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-center gap-3 lg:justify-start">
                <span
                  className="h-px w-10 lg:w-14"
                  style={{
                    backgroundColor: "color-mix(in srgb, var(--accent-color) 55%, transparent)",
                  }}
                  aria-hidden
                />
                <span
                  className="text-[10px] font-semibold uppercase tracking-[0.34em]"
                  style={{ color: "var(--accent-color)" }}
                >
                  {eyebrow}
                </span>
              </div>
              <h2
                className="text-balance text-[clamp(2rem,5vw,3.5rem)] font-medium leading-[1.02]"
                style={{
                  fontFamily: "var(--heading-font)",
                  color: "var(--heading-color)",
                  letterSpacing: "-0.02em",
                }}
              >
                {title}
              </h2>
              <span
                className="mx-auto mt-6 hidden h-20 w-px lg:mx-0 lg:block lg:bg-gradient-to-b"
                style={{
                  background: `linear-gradient(180deg, color-mix(in srgb, var(--accent-color) 70%, transparent) 0%, transparent 92%)`,
                }}
                aria-hidden
              />
            </div>
          </header>

          <div className="lg:col-span-8">
            {hasOffers && allHaveImages ? (
              <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:gap-y-16 xl:grid-cols-3">
                {offers.map((o, idx) => (
                  <article
                    key={o.id}
                    className="group flex flex-col border border-[color-mix(in_srgb,var(--body-text)_07%,transparent)] bg-[color-mix(in_srgb,var(--page-bg)_55%,transparent)] p-[2px] shadow-[0_40px_110px_-70px_rgba(0,0,0,0.55)] backdrop-blur-[2px]"
                    style={{
                      borderRadius:
                        "calc(var(--radius) + 10px)",
                    }}
                  >
                    <div
                      className="relative overflow-hidden"
                      style={{ borderRadius: "calc(var(--radius) + 6px)" }}
                    >
                      <div className="relative aspect-[4/5] overflow-hidden">
                        <Image
                          src={o.imageUrl!}
                          alt=""
                          fill
                          className="object-cover transition duration-[1.35s] group-hover:scale-[1.05]"
                          sizes="(max-width:768px) 100vw, 400px"
                          unoptimized
                        />
                      </div>
                      <span
                        className="absolute left-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full text-[11px] font-semibold tabular-nums backdrop-blur-md"
                        style={{
                          backgroundColor: "color-mix(in srgb, var(--page-bg) 82%, transparent)",
                          color: "var(--heading-color)",
                          border: "1px solid color-mix(in srgb, var(--accent-color) 45%, transparent)",
                          fontFamily: "var(--heading-font)",
                        }}
                      >
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <div
                        className="pointer-events-none absolute inset-0 opacity-0 transition duration-700 group-hover:opacity-100"
                        style={{
                          boxShadow:
                            "inset 0 0 120px rgba(0,0,0,0.38), inset 0 -80px 100px rgba(0,0,0,0.42)",
                        }}
                        aria-hidden
                      />
                    </div>
                    <div className="px-1 pb-5 pt-5 sm:pb-6 sm:pt-6">
                      <div className="flex items-baseline justify-between gap-4">
                        <h3
                          className="text-[1.2rem] font-medium leading-snug sm:text-xl"
                          style={{
                            fontFamily: "var(--heading-font)",
                            color: "var(--heading-color)",
                          }}
                        >
                          {o.title}
                        </h3>
                        {o.price ? (
                          <span
                            className="shrink-0 text-base font-medium tabular-nums"
                            style={{
                              color: "var(--accent-color)",
                              fontFamily: "var(--heading-font)",
                            }}
                          >
                            {o.price}
                          </span>
                        ) : null}
                      </div>
                      {o.description ? (
                        <p
                          className="mt-3 text-[15px] leading-relaxed opacity-[0.88]"
                          style={{ color: "var(--body-text)" }}
                        >
                          {o.description}
                        </p>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            ) : hasOffers ? (
              <div className="space-y-0">
                {offers.map((o, idx) => (
                  <article
                    key={o.id}
                    className={cn(
                      "flex gap-5 border-b border-[color-mix(in_srgb,var(--body-text)_10%,transparent)] py-10 first:pt-0 last:border-b-0 sm:gap-7 sm:py-11",
                      o.imageUrl ? "items-start" : "items-baseline",
                    )}
                  >
                    {o.imageUrl ? (
                      <div className="relative mt-1 h-[5.75rem] w-[5.75rem] shrink-0 overflow-hidden sm:h-28 sm:w-28 ring-1 ring-[color-mix(in_srgb,var(--accent-color)_35%,transparent)]">
                        <Image
                          src={o.imageUrl}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="120px"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <span
                        className="shrink-0 pt-1 text-[13px] font-semibold uppercase tracking-[0.4em] opacity-55"
                        style={{
                          color: "var(--heading-color)",
                          fontFamily: "var(--heading-font)",
                        }}
                      >
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                    )}
                    <div className="flex flex-1 min-w-0 flex-col gap-2">
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <h3
                          className="text-[clamp(1.125rem,2.5vw,1.5rem)] font-medium leading-tight sm:text-[1.65rem]"
                          style={{
                            fontFamily: "var(--heading-font)",
                            color: "var(--heading-color)",
                          }}
                        >
                          {o.title}
                        </h3>
                        {o.price ? (
                          <>
                            <span
                              aria-hidden
                              className="hidden flex-1 min-w-[32px] translate-y-[2px] border-b md:inline"
                              style={{
                                borderColor:
                                  "color-mix(in srgb, var(--body-text) 22%, transparent)",
                                borderBottomStyle: "dotted",
                              }}
                            />
                            <span
                              className="shrink-0 text-lg font-semibold tabular-nums sm:text-xl"
                              style={{
                                color: "var(--accent-color)",
                                fontFamily: "var(--heading-font)",
                              }}
                            >
                              {o.price}
                            </span>
                          </>
                        ) : null}
                      </div>
                      {o.description ? (
                        <p
                          className="max-w-xl text-[15px] leading-relaxed opacity-[0.86]"
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

            {menuHref ? (
              <div className="mt-12 flex justify-center lg:justify-start">
                <a
                  href={menuHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 rounded-full border px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.26em] transition hover:bg-[color-mix(in_srgb,var(--accent-color)_06%,transparent)]"
                  style={{
                    borderColor: "color-mix(in srgb, var(--accent-color) 45%, transparent)",
                    color: "var(--accent-color)",
                  }}
                >
                  {menuPdfLabel ?? ""}
                  <ChevronRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden />
                </a>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

export function CredibilitySection({
  data,
  copy,
}: {
  data: CredibilityContent;
  copy: ReviewsSectionCopy;
}) {
  if (!hasCredibilityContent(data)) return null;

  return (
    <section>
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-12">
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
              {data.reviewCount} {copy.googleReviewsSuffix}
            </p>
            {data.googleReviewsUrl ? (
              <a
                href={data.googleReviewsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold underline-offset-4 hover:underline"
                style={{ color: "var(--accent-color)" }}
              >
                {copy.googleCtaLabel}
              </a>
            ) : null}
          </div>
        ) : null}

        {data.quote.trim() ? (
          <blockquote className="mx-auto mt-10 max-w-3xl text-center">
            <p className="text-xl font-light italic leading-relaxed sm:text-2xl" style={{ fontFamily: "var(--heading-font)", color: "var(--heading-color)" }}>
              Â« {data.quote.trim()} Â»
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
            <span className="text-[10px] font-medium uppercase tracking-[0.25em] opacity-50">{copy.pressHeading}</span>
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
                {copy.tripAdvisorLabel}
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
  eyebrow,
  title,
  instagramLinkLabel,
}: {
  images: string[];
  style: GalleryStyle;
  instagramUrl?: string | null;
  showInstagram?: boolean;
  eyebrow: string;
  title: string;
  instagramLinkLabel: string;
}) {
  if (images.length === 0) return null;

  /* === STYLE SHOWCASE : 1 grande photo + mosaÃ¯que secondaire (premium) === */
  if (style === "showcase" && images.length >= 2) {
    const [hero, ...rest] = images;
    return (
      <section className="">
        <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
          <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span
                  className="h-px w-10"
                  style={{
                    backgroundColor: "color-mix(in srgb, var(--accent-color) 60%, transparent)",
                  }}
                  aria-hidden
                />
                <p
                  className="text-[10px] font-semibold uppercase tracking-[0.32em]"
                  style={{ color: "var(--accent-color)" }}
                >
                  {eyebrow}
                </p>
              </div>
              <h2
                className="mt-5 text-4xl font-medium leading-[1.05] sm:text-5xl"
                style={{
                  fontFamily: "var(--heading-font)",
                  color: "var(--heading-color)",
                  letterSpacing: "-0.015em",
                }}
              >
                {title}
              </h2>
            </div>
            {showInstagram && instagramUrl ? (
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] transition"
                style={{ color: "var(--accent-color)" }}
              >
                <span className="border-b border-current pb-1">{instagramLinkLabel}</span>
                <ChevronRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden />
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

  /* === STYLE REELS : colonnes verticales type TikTok / Reels (social-native) === */
  if (style === "reels") {
    return (
      <section id="galerie" className="scroll-mt-24">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-10">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span
                  className="h-px w-10"
                  style={{
                    backgroundColor: "color-mix(in srgb, var(--accent-color) 60%, transparent)",
                  }}
                  aria-hidden
                />
                <p
                  className="text-[10px] font-semibold uppercase tracking-[0.32em]"
                  style={{ color: "var(--accent-color)" }}
                >
                  {eyebrow}
                </p>
              </div>
              <h2
                className="mt-4 text-[clamp(1.75rem,4.5vw,2.75rem)] font-medium leading-[1.05]"
                style={{
                  fontFamily: "var(--heading-font)",
                  color: "var(--heading-color)",
                  letterSpacing: "-0.015em",
                }}
              >
                {title}
              </h2>
            </div>
            {showInstagram && instagramUrl ? (
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex shrink-0 items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em]"
                style={{ color: "var(--accent-color)" }}
              >
                <Instagram className="h-4 w-4" aria-hidden />
                <span className="border-b border-current pb-0.5">{instagramLinkLabel}</span>
              </a>
            ) : null}
          </div>
          <div className="zg-showroom-reels-scroll -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 snap-x snap-mandatory sm:-mx-6 sm:gap-4 sm:px-6 md:grid md:grid-cols-3 md:overflow-visible md:pb-0 lg:grid-cols-4 lg:gap-4">
            {images.slice(0, 8).map((src, i) => (
              <div
                key={src}
                className={cn(
                  "zg-showroom-reels-card relative shrink-0 snap-center overflow-hidden rounded-2xl shadow-[0_24px_60px_-28px_rgba(0,0,0,0.55)]",
                  "w-[min(72vw,280px)] aspect-[9/16]",
                  "md:w-full md:shrink",
                  i % 3 === 1 && "md:mt-8",
                  i % 3 === 2 && "md:mt-4",
                )}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  className="object-cover transition duration-700 hover:scale-[1.04]"
                  sizes="(max-width:768px) 72vw, 25vw"
                  unoptimized
                  priority={i < 2}
                />
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10"
                  aria-hidden
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  /* === STYLE INSTAGRAM : grille carrée régulière, style social === */
  if (style === "instagram") {
    return (
      <section className="">
        <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
          <div className="mb-12 text-center">
            <div className="flex items-center justify-center gap-3">
              <span
                className="h-px w-10"
                style={{
                  backgroundColor: "color-mix(in srgb, var(--accent-color) 60%, transparent)",
                }}
                aria-hidden
              />
              <p
                className="text-[10px] font-semibold uppercase tracking-[0.32em]"
                style={{ color: "var(--accent-color)" }}
              >
                {eyebrow}
              </p>
              <span
                className="h-px w-10"
                style={{
                  backgroundColor: "color-mix(in srgb, var(--accent-color) 60%, transparent)",
                }}
                aria-hidden
              />
            </div>
            <h2
              className="mt-5 text-4xl font-medium leading-[1.05] sm:text-5xl"
              style={{
                fontFamily: "var(--heading-font)",
                color: "var(--heading-color)",
                letterSpacing: "-0.015em",
              }}
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
                {instagramLinkLabel}
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

  /* === STYLE GRID (par dÃ©faut) : masonry verticale === */
  return (
    <section className="">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
        <div className="mb-12">
          <div className="flex items-center gap-3">
            <span
              className="h-px w-10"
              style={{
                backgroundColor: "color-mix(in srgb, var(--accent-color) 60%, transparent)",
              }}
              aria-hidden
            />
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.32em]"
              style={{ color: "var(--accent-color)" }}
            >
              {eyebrow}
            </p>
          </div>
          <h2
            className="mt-5 text-4xl font-medium leading-[1.05] sm:text-5xl"
            style={{
              fontFamily: "var(--heading-font)",
              color: "var(--heading-color)",
              letterSpacing: "-0.015em",
            }}
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
  eyebrow,
  title,
  subtitle,
  buttonLabel,
  phone,
  showPhone,
  onReserve,
  ctaStyle,
}: {
  eyebrow: string;
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
          background: `radial-gradient(120% 80% at 50% 10%, color-mix(in srgb, var(--accent-color) 18%, transparent) 0%, transparent 60%), linear-gradient(180deg, var(--page-bg) 0%, color-mix(in srgb, var(--accent-color) 10%, var(--page-bg)) 100%)`,
        }}
        aria-hidden
      />
      {/* Subtle grain (svg noise) â€” apporte vraiment du luxe */}
      <div
        className="absolute inset-0 opacity-[0.06] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.6'/></svg>\")",
        }}
        aria-hidden
      />
      <div className="relative mx-auto max-w-3xl px-5 py-28 text-center sm:px-8 lg:py-36">
        {/* Eyebrow line + label centrÃ© */}
        <div className="flex items-center justify-center gap-3">
          <span
            className="h-px w-10"
            style={{
              backgroundColor: "color-mix(in srgb, var(--accent-color) 60%, transparent)",
            }}
            aria-hidden
          />
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.32em]"
            style={{ color: "var(--accent-color)" }}
          >
            {eyebrow}
          </p>
          <span
            className="h-px w-10"
            style={{
              backgroundColor: "color-mix(in srgb, var(--accent-color) 60%, transparent)",
            }}
            aria-hidden
          />
        </div>

        <h2
          className="mt-6 text-balance text-4xl font-medium italic leading-[1.02] sm:text-5xl lg:text-6xl"
          style={{
            fontFamily: "var(--heading-font)",
            color: "var(--heading-color)",
            letterSpacing: "-0.015em",
          }}
        >
          {title}
        </h2>
        <p
          className="mx-auto mt-7 max-w-lg text-[17px] font-light leading-[1.7] sm:text-[19px]"
          style={{
            color: "var(--body-text)",
            fontFamily: "var(--body-font), system-ui, sans-serif",
          }}
        >
          {subtitle}
        </p>
        <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
          <button
            type="button"
            onClick={onReserve}
            className={cn(
              ctaStyle.className,
              "min-h-[60px] px-12 text-sm uppercase tracking-[0.2em]",
            )}
            style={ctaStyle.style}
          >
            {buttonLabel}
          </button>
          {showPhone && phone ? (
            <a
              href={`tel:${phone.replace(/\s/g, "")}`}
              className="group inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] transition"
              style={{ color: "var(--accent-color)" }}
            >
              <Phone className="h-4 w-4" />
              <span className="border-b border-current pb-1">{phone}</span>
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export { PremiumPracticalInfo } from "@/src/components/reservation/premium-practical-info";

export function PremiumReservationSection({
  title,
  intro,
  groupMessage,
  showPhoneAlt,
  phone,
  children,
  eyebrow,
  phonePreferLabel,
  showroomMinimal = false,
}: {
  title: string;
  intro: string;
  groupMessage?: string;
  showPhoneAlt?: boolean;
  phone?: string | null;
  children: React.ReactNode;
  eyebrow: string;
  phonePreferLabel: string;
  showroomMinimal?: boolean;
}) {
  if (showroomMinimal) {
    return (
      <section id="reservation" className="zg-showroom-reservation relative scroll-mt-0" style={{ backgroundColor: "var(--page-bg)" }}>
        <div className="mx-auto max-w-md px-5 py-16 sm:px-6 sm:py-20">
          <header className="mb-10 text-center">
            <h2
              className="text-balance text-[clamp(1.5rem,5vw,2rem)] font-medium leading-tight tracking-tight"
              style={{ fontFamily: "var(--heading-font)", color: "var(--heading-color)" }}
            >
              {title}
            </h2>
            {intro?.trim() ? (
              <p className="mt-3 text-[15px] font-light leading-relaxed opacity-55" style={{ color: "var(--body-text)" }}>
                {intro}
              </p>
            ) : null}
          </header>
          <div
            className="rounded-[calc(var(--radius)+4px)] border p-5 sm:p-7"
            style={{
              borderColor: "color-mix(in srgb, var(--body-text) 10%, var(--page-bg))",
              backgroundColor: "color-mix(in srgb, var(--body-text) 3%, var(--page-bg))",
            }}
          >
            {children}
          </div>
          {showPhoneAlt && phone ? (
            <p className="mt-8 text-center text-[13px] opacity-50" style={{ color: "var(--body-text)" }}>
              {phonePreferLabel}{" "}
              <a
                href={`tel:${phone.replace(/\s/g, "")}`}
                className="font-medium underline-offset-4 hover:underline"
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

  return (
    <section
      id="reservation"
      className="scroll-mt-24 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, color-mix(in srgb, var(--hero-primary) 6%, var(--page-bg)) 0%, color-mix(in srgb, var(--accent-color) 3%, var(--page-bg)) 38%, var(--page-bg) 100%)",
      }}
    >
      <div
        className="pointer-events-none absolute -left-[12%] top-[-18%] h-[460px] w-[560px] rounded-full blur-[100px] opacity-[0.14]"
        style={{
          background: "radial-gradient(circle at center, color-mix(in srgb, var(--accent-color) 52%, transparent) 0%, transparent 72%)",
        }}
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[color-mix(in_srgb,var(--accent-color)_35%,transparent)] to-transparent opacity-70" />

      <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-12 lg:py-32">
        <div className="flex flex-col gap-14 lg:gap-16 xl:grid xl:grid-cols-12 xl:items-start">
          <header className="flex flex-col items-center gap-5 text-center xl:sticky xl:top-28 xl:col-span-5 xl:items-start xl:text-left">
            <div className="flex w-full justify-center xl:justify-start">
              <div className="flex items-center gap-3">
                <span
                  className="hidden h-px w-14 xl:inline-block xl:bg-gradient-to-r xl:from-transparent xl:to-current"
                  style={{ color: "var(--accent-color)" }}
                  aria-hidden
                />
                <p
                  className="text-[11px] font-semibold uppercase tracking-[0.32em]"
                  style={{ color: "var(--accent-color)" }}
                >
                  {eyebrow}
                </p>
              </div>
            </div>
            <div>
              <h2
                className="mt-2 text-balance text-[clamp(2rem,4vw,2.75rem)] font-medium leading-[1.05] xl:text-left"
                style={{ fontFamily: "var(--heading-font)", color: "var(--heading-color)" }}
              >
                {title}
              </h2>
              <p
                className="mx-auto mt-6 max-w-md text-[17px] font-light leading-[1.7] opacity-[0.92] xl:mx-0 xl:max-w-lg"
                style={{ color: "var(--body-text)", fontFamily: "var(--body-font), system-ui, sans-serif" }}
              >
                {intro}
              </p>
              {groupMessage?.trim() ? (
                <p
                  className="mx-auto mt-4 max-w-md text-sm leading-relaxed opacity-75 xl:mx-0"
                  style={{ color: "var(--body-text)" }}
                >
                  {groupMessage}
                </p>
              ) : null}
            </div>
          </header>

          <div className="xl:col-span-7 xl:justify-self-end xl:w-full xl:max-w-[640px]">
            <div className="relative rounded-[calc(var(--radius)+14px)] bg-gradient-to-br from-[color-mix(in_srgb,var(--accent-color)_28%,transparent)] via-[color-mix(in_srgb,var(--accent-color)_8%,transparent)] to-transparent p-[1px] shadow-[0_48px_130px_-72px_rgba(0,0,0,0.58)]">
              <div
                className="rounded-[calc(var(--radius)+13px)] p-[1px]"
                style={{
                  backgroundColor: "color-mix(in srgb, var(--page-bg) 78%, transparent)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                }}
              >
                <div
                  className="rounded-[calc(var(--radius)+12px)] p-6 sm:p-10"
                  style={{
                    backgroundColor:
                      "color-mix(in srgb, var(--page-bg) 92%, transparent)",
                    borderWidth: "1px",
                    borderStyle: "solid",
                    borderColor: "color-mix(in srgb, var(--body-text) 6%, var(--page-bg))",
                  }}
                >
                  {children}
                </div>
              </div>
            </div>

            {showPhoneAlt && phone ? (
              <p className="mt-10 text-center text-sm xl:text-left" style={{ color: "var(--body-text)" }}>
                {phonePreferLabel}{" "}
                <a
                  href={`tel:${phone.replace(/\s/g, "")}`}
                  className="font-semibold underline-offset-4 hover:underline"
                  style={{ color: "var(--accent-color)" }}
                >
                  {phone}
                </a>
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

export function HighlightsBand({ items, eyebrow }: { items: string[]; eyebrow?: string }) {
  const visible = items.map((s) => s.trim()).filter(Boolean).slice(0, 6);
  if (visible.length === 0) return null;
  const showEyebrow = Boolean(eyebrow?.trim());
  return (
    <section
      style={{
        backgroundColor: "var(--surface-muted, color-mix(in srgb, var(--body-text) 3%, var(--page-bg)))",
      }}
    >
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-12 lg:py-16">
        {showEyebrow ? (
          <p
            className="mb-8 text-center text-[10px] font-semibold uppercase tracking-[0.28em] text-[color-mix(in_srgb,var(--heading-color)_55%,transparent)]"
            style={{ color: "var(--accent-color)" }}
          >
            {eyebrow!.trim()}
          </p>
        ) : null}
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

export function GiftVouchersSection({
  content,
  surfaceCopy,
  restaurantSlug,
  previewMode = false,
  surface,
}: {
  content: GiftVouchersSectionContent;
  surfaceCopy: GiftVouchersSectionCopy;
  restaurantSlug: string;
  previewMode?: boolean;
  surface: SectionSurface;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [beneficiary, setBeneficiary] = useState("");
  const [occasion, setOccasion] = useState("");
  const [message, setMessage] = useState("");

  const title = content.title.trim() || (surfaceCopy.fallbackTitle ?? "").trim();
  const body = content.body.trim() || (surfaceCopy.fallbackBody ?? "").trim();
  const cta = content.ctaLabel.trim() || (surfaceCopy.fallbackCta ?? "").trim();
  const img = content.imageUrl.trim();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    if (previewMode) {
      setErr("Lâ€™envoi est dÃ©sactivÃ© dans lâ€™aperÃ§u du tableau de bord.");
      return;
    }
    if (!restaurantSlug.trim()) {
      setErr("Impossible dâ€™envoyer la demande pour le moment.");
      return;
    }
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setErr("Merci de remplir au minimum prÃ©nom, nom et e-mail.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/public/gift-voucher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: restaurantSlug.trim(),
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          amount: amount.trim() || undefined,
          beneficiary: beneficiary.trim() || undefined,
          occasion: occasion.trim() || undefined,
          message: message.trim() || undefined,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; ok?: boolean };
      if (!res.ok || !data.ok) {
        setErr(data.error ?? "Envoi impossible. RÃ©essayez plus tard.");
        setBusy(false);
        return;
      }
      setDone(true);
      setOpen(false);
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setAmount("");
      setBeneficiary("");
      setOccasion("");
      setMessage("");
    } catch {
      setErr("Erreur rÃ©seau. RÃ©essayez plus tard.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PublicPageSection surface={surface} id="bons-cadeaux" className="relative scroll-mt-24 overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.09]"
          aria-hidden
          style={{
            backgroundImage:
              "radial-gradient(ellipse 110% 80% at 8% -10%, color-mix(in srgb, var(--accent-color) 40%, transparent) 0%, transparent 55%), radial-gradient(ellipse 90% 60% at 95% 100%, color-mix(in srgb, var(--accent-color) 32%, transparent) 0%, transparent 50%)",
          }}
        />
        <div className="relative flex flex-col gap-14 lg:grid lg:grid-cols-12 lg:items-center lg:gap-x-14 xl:gap-x-20">
          <figure
            className={cn(
              "relative order-2 w-full lg:order-1 lg:col-span-6",
              img ? "-mx-4 sm:mx-0" : "",
            )}
          >
            <div className="absolute -inset-[1px] rounded-[calc(var(--radius)+10px)] bg-gradient-to-br from-[color-mix(in_srgb,var(--accent-color)_45%,transparent)] via-transparent to-transparent p-px lg:rounded-[calc(var(--radius)+16px)]" />
            <div
              className={cn(
                "relative mx-auto overflow-hidden shadow-[0_48px_120px_-74px_rgba(0,0,0,0.55)] ring-1 ring-[color-mix(in_srgb,var(--accent-color)_22%,transparent)]",
                "rounded-[calc(var(--radius)+8px)] lg:rounded-[calc(var(--radius)+14px)] lg:-translate-y-5 lg:[transform-origin:center]",
              )}
              style={{ transform: "rotate(-0.2deg)" }}
            >
              <div
                className={cn(
                  "relative w-full overflow-hidden",
                  img ? "aspect-[16/11] min-h-[220px] lg:aspect-[5/6] xl:aspect-[6/7]" : "flex min-h-[260px] items-center justify-center lg:aspect-[6/7]",
                )}
              >
                {img ? (
                  <>
                    <Image
                      src={img}
                      alt=""
                      fill
                      className="object-cover transition duration-[1.4s] hover:scale-[1.03]"
                      sizes="(max-width:1024px) 100vw, 46vw"
                      unoptimized
                    />
                    <div
                      className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
                      aria-hidden
                    />
                  </>
                ) : (
                  <div
                    className="flex h-full min-h-[280px] w-full items-center justify-center"
                    style={{
                      background: `linear-gradient(145deg, color-mix(in srgb, var(--accent-color) 18%, var(--page-bg)) 0%, var(--page-bg) 72%)`,
                    }}
                    aria-hidden
                  >
                    <Gift className="h-[4.25rem] w-[4.25rem] opacity-[0.22]" style={{ color: "var(--accent-color)" }} />
                  </div>
                )}
              </div>
            </div>
          </figure>

          <div className="order-1 flex flex-col text-left lg:order-2 lg:col-span-6">
            <div className="flex items-center gap-3">
              <span
                className="h-px w-10 sm:w-12"
                style={{
                  backgroundColor: "color-mix(in srgb, var(--accent-color) 60%, transparent)",
                }}
                aria-hidden
              />
              <p
                className="text-[10px] font-semibold uppercase tracking-[0.34em]"
                style={{ color: "var(--accent-color)" }}
              >
                {surfaceCopy.surfaceEyebrow}
              </p>
            </div>
            <h2
              className="mt-6 text-balance text-[clamp(2rem,4.5vw,3.25rem)] font-medium leading-[1.04]"
              style={{
                fontFamily: "var(--heading-font), Georgia, serif",
                color: "var(--heading-color)",
                letterSpacing: "-0.02em",
              }}
            >
              {title}
            </h2>
            <p
              className="mt-7 max-w-xl text-pretty text-[17px] font-light leading-[1.75] sm:text-[18px]"
              style={{
                color: "var(--body-text)",
                fontFamily: "var(--body-font), system-ui, sans-serif",
              }}
            >
              {body}
            </p>
            <div className="mt-10">
              <button
                type="button"
                onClick={() => {
                  setErr(null);
                  setOpen(true);
                }}
                className="inline-flex min-h-[56px] min-w-[220px] items-center justify-center px-10 text-[12px] font-semibold uppercase tracking-[0.22em] shadow-[0_28px_90px_-48px_rgba(0,0,0,0.55)] transition hover:brightness-[1.05] active:scale-[0.99]"
                style={{
                  borderRadius: "calc(var(--radius) + 2px)",
                  backgroundColor: "var(--button-bg)",
                  color: "var(--button-text)",
                }}
              >
                {cta}
              </button>
            </div>
          </div>
        </div>
      </PublicPageSection>

      {done ? (
        <div
          className="mx-auto mb-6 max-w-lg rounded-2xl border px-5 py-4 text-center text-sm"
          style={{
            borderColor: "color-mix(in srgb, var(--accent-color) 35%, transparent)",
            backgroundColor: "color-mix(in srgb, var(--accent-color) 8%, var(--page-bg))",
            color: "var(--heading-color)",
          }}
          role="status"
        >
          <p className="font-medium">{surfaceCopy.successTitle}</p>
          <p className="mt-1 opacity-90">{surfaceCopy.successBody}</p>
        </div>
      ) : null}

      {open ? (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center" role="dialog">
          <button
            type="button"
            className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
            aria-label="Fermer"
            onClick={() => !busy && setOpen(false)}
          />
          <div
            className="relative z-[1] w-full max-w-lg rounded-t-3xl border border-white/10 p-6 shadow-2xl sm:rounded-3xl sm:p-8"
            style={{ backgroundColor: "var(--page-bg)", color: "var(--body-text)" }}
          >
            <div className="mb-6 flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[color-mix(in_srgb,var(--body-text)_55%,transparent)]">
                  {surfaceCopy.modalEyebrow}
                </p>
                <h3
                  className="mt-2 text-xl font-medium"
                  style={{ fontFamily: "var(--heading-font)", color: "var(--heading-color)" }}
                >
                  {surfaceCopy.modalTitle}
                </h3>
              </div>
              <button
                type="button"
                className="rounded-full p-2 opacity-70 hover:opacity-100"
                onClick={() => !busy && setOpen(false)}
                aria-label="Fermer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wide opacity-80">PrÃ©nom</span>
                  <input
                    required
                    className="mt-1.5 min-h-[46px] w-full rounded-xl border px-3 text-sm outline-none"
                    style={{
                      borderColor: "color-mix(in srgb, var(--body-text) 18%, var(--page-bg))",
                      backgroundColor: "color-mix(in srgb, var(--body-text) 4%, var(--page-bg))",
                      color: "var(--heading-color)",
                    }}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    autoComplete="given-name"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wide opacity-80">Nom</span>
                  <input
                    required
                    className="mt-1.5 min-h-[46px] w-full rounded-xl border px-3 text-sm outline-none"
                    style={{
                      borderColor: "color-mix(in srgb, var(--body-text) 18%, var(--page-bg))",
                      backgroundColor: "color-mix(in srgb, var(--body-text) 4%, var(--page-bg))",
                      color: "var(--heading-color)",
                    }}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    autoComplete="family-name"
                  />
                </label>
              </div>
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide opacity-80">E-mail</span>
                <input
                  type="email"
                  required
                  className="mt-1.5 min-h-[46px] w-full rounded-xl border px-3 text-sm outline-none"
                  style={{
                    borderColor: "color-mix(in srgb, var(--body-text) 18%, var(--page-bg))",
                    backgroundColor: "color-mix(in srgb, var(--body-text) 4%, var(--page-bg))",
                    color: "var(--heading-color)",
                  }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide opacity-80">TÃ©lÃ©phone (optionnel)</span>
                <input
                  type="tel"
                  className="mt-1.5 min-h-[46px] w-full rounded-xl border px-3 text-sm outline-none"
                  style={{
                    borderColor: "color-mix(in srgb, var(--body-text) 18%, var(--page-bg))",
                    backgroundColor: "color-mix(in srgb, var(--body-text) 4%, var(--page-bg))",
                    color: "var(--heading-color)",
                  }}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="tel"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide opacity-80">
                  Montant souhaitÃ© (ex. 80â‚¬)
                </span>
                <input
                  className="mt-1.5 min-h-[46px] w-full rounded-xl border px-3 text-sm outline-none"
                  style={{
                    borderColor: "color-mix(in srgb, var(--body-text) 18%, var(--page-bg))",
                    backgroundColor: "color-mix(in srgb, var(--body-text) 4%, var(--page-bg))",
                    color: "var(--heading-color)",
                  }}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide opacity-80">
                  Nom du bÃ©nÃ©ficiaire (optionnel)
                </span>
                <input
                  className="mt-1.5 min-h-[46px] w-full rounded-xl border px-3 text-sm outline-none"
                  style={{
                    borderColor: "color-mix(in srgb, var(--body-text) 18%, var(--page-bg))",
                    backgroundColor: "color-mix(in srgb, var(--body-text) 4%, var(--page-bg))",
                    color: "var(--heading-color)",
                  }}
                  value={beneficiary}
                  onChange={(e) => setBeneficiary(e.target.value)}
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide opacity-80">
                  Occasion (optionnel)
                </span>
                <input
                  className="mt-1.5 min-h-[46px] w-full rounded-xl border px-3 text-sm outline-none"
                  placeholder="Anniversaire, NoÃ«lâ€¦"
                  style={{
                    borderColor: "color-mix(in srgb, var(--body-text) 18%, var(--page-bg))",
                    backgroundColor: "color-mix(in srgb, var(--body-text) 4%, var(--page-bg))",
                    color: "var(--heading-color)",
                  }}
                  value={occasion}
                  onChange={(e) => setOccasion(e.target.value)}
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide opacity-80">Message (optionnel)</span>
                <textarea
                  className="mt-1.5 min-h-[88px] w-full resize-none rounded-xl border px-3 py-2 text-sm outline-none"
                  style={{
                    borderColor: "color-mix(in srgb, var(--body-text) 18%, var(--page-bg))",
                    backgroundColor: "color-mix(in srgb, var(--body-text) 4%, var(--page-bg))",
                    color: "var(--heading-color)",
                  }}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </label>

              {err ? <p className="text-sm text-red-600">{err}</p> : null}

              <button
                type="submit"
                disabled={busy}
                className="flex min-h-[52px] w-full items-center justify-center text-sm font-semibold uppercase tracking-[0.12em] disabled:opacity-60"
                style={{
                  borderRadius: "var(--radius)",
                  backgroundColor: "var(--button-bg)",
                  color: "var(--button-text)",
                }}
              >
                {busy ? surfaceCopy.submittingLabel : surfaceCopy.submitLabel}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}

export function StickyReserveBar({
  label,
  onClick,
  visible,
  previewMode = false,
  scrollSmart = false,
}: {
  label: string;
  onClick: () => void;
  visible: boolean;
  previewMode?: boolean;
  scrollSmart?: boolean;
}) {
  const [pastHero, setPastHero] = useState(!scrollSmart);
  const [atReservation, setAtReservation] = useState(false);

  useEffect(() => {
    if (!visible || previewMode || !scrollSmart) {
      setPastHero(!scrollSmart);
      setAtReservation(false);
      return;
    }

    const sentinel = document.getElementById("showroom-hero-sentinel");
    const reservation = document.getElementById("reservation");
    if (!sentinel) return;

    const onSentinel = new IntersectionObserver(
      ([entry]) => setPastHero(!entry.isIntersecting),
      { threshold: 0, rootMargin: "-8% 0px 0px 0px" },
    );
    onSentinel.observe(sentinel);

    let onReservation: IntersectionObserver | undefined;
    if (reservation) {
      onReservation = new IntersectionObserver(
        ([entry]) => setAtReservation(entry.isIntersecting),
        { threshold: 0.12, rootMargin: "0px 0px -20% 0px" },
      );
      onReservation.observe(reservation);
    }

    return () => {
      onSentinel.disconnect();
      onReservation?.disconnect();
    };
  }, [visible, previewMode, scrollSmart]);

  if (!visible) return null;

  const showBar = previewMode || !scrollSmart || (pastHero && !atReservation);

  return (
    <div
      className={cn(
        "zg-showroom-sticky-cta fixed inset-x-0 bottom-0 z-50 px-4 pt-2 pb-[max(0.65rem,env(safe-area-inset-bottom))] md:hidden",
        "transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
        showBar ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-full opacity-0",
      )}
      role="complementary"
      aria-label="Réserver"
      aria-hidden={!showBar}
    >
      <div
        className="pointer-events-none absolute inset-x-0 bottom-full h-10 bg-gradient-to-t from-[var(--page-bg)] to-transparent"
        aria-hidden
      />
      <button
        type="button"
        onClick={onClick}
        className="zg-showroom-sticky-cta__button relative mx-auto flex min-h-[50px] max-w-md items-center justify-center rounded-full px-8 text-[13px] font-semibold tracking-[0.06em] shadow-[0_8px_32px_-8px_rgba(0,0,0,0.35)] transition active:scale-[0.98]"
        style={{
          backgroundColor: "color-mix(in srgb, var(--button-bg) 92%, transparent)",
          color: "var(--button-text)",
        }}
      >
        {label}
      </button>
    </div>
  );
}

