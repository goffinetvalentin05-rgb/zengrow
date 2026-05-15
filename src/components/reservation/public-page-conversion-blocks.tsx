"use client";

import { Check, Clock, MapPin, Phone, Star, UtensilsCrossed } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { openStatusLabel } from "@/src/lib/public-page/opening-status";
import { PublicPageSection } from "@/src/components/reservation/public-page-section";
import type { SectionSurface } from "@/src/lib/public-page/theme";

type CtaStyle = { className: string; style?: React.CSSProperties };

export function HeroQuickFacts({
  openStatus,
  shortAddress,
  showPhone,
  phone,
}: {
  openStatus: string;
  shortAddress?: string | null;
  showPhone?: boolean;
  phone?: string | null;
}) {
  const open = openStatus.toLowerCase().includes("ouvert");
  return (
    <div className="mt-6 flex w-full max-w-2xl flex-wrap items-center justify-center gap-2 sm:mt-8">
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold backdrop-blur-sm",
          open ? "bg-emerald-500/25 text-emerald-50" : "bg-white/15 text-white/90",
        )}
      >
        <Clock className="h-3.5 w-3.5" aria-hidden />
        {openStatus}
      </span>
      {shortAddress ? (
        <span className="inline-flex max-w-[min(100%,280px)] items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white/90 backdrop-blur-sm">
          <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <span className="truncate">{shortAddress}</span>
        </span>
      ) : null}
      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white/90 backdrop-blur-sm">
        Réservation rapide en ligne
      </span>
      {showPhone && phone ? (
        <a
          href={`tel:${phone.replace(/\s/g, "")}`}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition hover:bg-white/20 md:hidden"
        >
          <Phone className="h-3.5 w-3.5" aria-hidden />
          Appeler
        </a>
      ) : null}
    </div>
  );
}

export function SocialProofSection({
  surface,
  highlights,
  showReviews,
  trustLines,
}: {
  surface: SectionSurface;
  highlights: string[];
  showReviews: boolean;
  trustLines: string[];
}) {
  const items = highlights.length > 0 ? highlights : trustLines;
  if (items.length === 0 && !showReviews) return null;

  return (
    <PublicPageSection surface={surface}>
      <div className="mx-auto max-w-4xl space-y-5 text-center">
        {showReviews ? (
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-1 text-amber-400/90" aria-hidden>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <p className="text-sm font-medium opacity-90" style={{ color: surface.headingColor }}>
              Avis clients recommandés
            </p>
          </div>
        ) : null}
        {items.length > 0 ? (
          <ul className="flex flex-wrap justify-center gap-2">
            {items.map((h) => (
              <li
                key={h}
                className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold sm:text-sm"
                style={{
                  borderColor: "color-mix(in srgb, var(--accent-color) 35%, transparent)",
                  color: surface.headingColor,
                  backgroundColor: "color-mix(in srgb, var(--accent-color) 10%, transparent)",
                }}
              >
                <Check className="h-3.5 w-3.5 text-[var(--accent-color)]" aria-hidden />
                {h}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </PublicPageSection>
  );
}

export function ConversionMiddleCta({
  title,
  subtitle,
  buttonLabel,
  onClick,
  ctaStyle,
}: {
  title: string;
  subtitle: string;
  buttonLabel: string;
  onClick: () => void;
  ctaStyle: CtaStyle;
}) {
  return (
    <section className="scroll-mt-24">
      <div
        className="rounded-[var(--radius)] border px-6 py-10 text-center shadow-md sm:px-10"
        style={{
          borderColor: "color-mix(in srgb, var(--accent-color) 28%, var(--page-bg))",
          backgroundColor: "color-mix(in srgb, var(--accent-color) 8%, var(--page-bg))",
        }}
      >
        <h2
          className="text-xl font-semibold sm:text-2xl"
          style={{ fontFamily: "var(--heading-font)", color: "var(--heading-color)" }}
        >
          {title}
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm opacity-90" style={{ color: "var(--body-text)" }}>
          {subtitle}
        </p>
        <button
          type="button"
          onClick={onClick}
          className={cn(ctaStyle.className, "mt-5 min-h-[48px] px-8")}
          style={ctaStyle.style}
        >
          {buttonLabel}
        </button>
      </div>
    </section>
  );
}

export function MenuActionSection({
  surface,
  menuHref,
  menuLabel,
  specialties,
}: {
  surface: SectionSurface;
  menuHref: string;
  menuLabel: string;
  specialties: string[];
}) {
  return (
    <PublicPageSection surface={surface}>
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2
            className="text-2xl font-medium md:text-3xl"
            style={{ fontFamily: "var(--heading-font)", color: surface.headingColor }}
          >
            Découvrez notre menu
          </h2>
          <p className="mt-2 max-w-lg text-sm opacity-90" style={{ color: surface.color }}>
            Parcourez la carte avant de réserver.
          </p>
          {specialties.length > 0 ? (
            <ul className="mt-4 flex flex-wrap gap-2">
              {specialties.slice(0, 3).map((s) => (
                <li
                  key={s}
                  className="rounded-full px-3 py-1 text-xs font-semibold"
                  style={{
                    backgroundColor: "color-mix(in srgb, var(--accent-color) 12%, transparent)",
                    color: surface.headingColor,
                  }}
                >
                  {s}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <a
          href={menuHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[48px] shrink-0 items-center justify-center gap-2 rounded-[var(--radius)] border-2 px-6 text-sm font-semibold transition hover:opacity-90"
          style={{
            borderColor: "var(--accent-color)",
            color: "var(--accent-color)",
          }}
        >
          <UtensilsCrossed className="h-4 w-4" aria-hidden />
          {menuLabel}
        </a>
      </div>
    </PublicPageSection>
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
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[color-mix(in_srgb,var(--body-text)_12%,var(--page-bg))] bg-[color-mix(in_srgb,var(--page-bg)_94%,transparent)] p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md md:hidden">
      <button
        type="button"
        onClick={onClick}
        className="flex min-h-[52px] w-full items-center justify-center rounded-[var(--radius)] text-[15px] font-semibold shadow-lg transition active:scale-[0.99]"
        style={{ backgroundColor: "var(--button-bg)", color: "var(--button-text)" }}
      >
        {label}
      </button>
    </div>
  );
}

export { openStatusLabel };
