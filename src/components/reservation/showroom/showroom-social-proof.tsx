"use client";

import { Star } from "lucide-react";
import { cn } from "@/src/lib/utils";
import type { CredibilityContent } from "@/src/lib/public-page/premium-content";
import type { ReviewsSectionCopy } from "@/src/lib/public-page/page-sections";
import { hasCredibilityContent } from "@/src/lib/public-page/premium-content";

/** Preuve sociale minimaliste — premium, sans blocs marketing */
export function ShowroomSocialProof({
  data,
  copy,
  omitRating = false,
}: {
  data: CredibilityContent;
  copy: ReviewsSectionCopy;
  /** Note déjà affichée dans le hero */
  omitRating?: boolean;
}) {
  if (!hasCredibilityContent(data)) return null;

  const hasRating = !omitRating && Boolean(data.googleRating && data.reviewCount);
  const hasQuote = Boolean(data.quote.trim());
  const hasPress = data.pressMentions.length > 0;

  if (!hasRating && !hasQuote && !hasPress) return null;

  return (
    <section id="avis" className="zg-showroom-proof scroll-mt-0 py-20 sm:py-28">
      <div className="mx-auto flex max-w-lg flex-col items-center gap-8 px-6 text-center">
        {hasRating ? (
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-baseline gap-2">
              <span
                className="text-3xl font-medium tabular-nums tracking-tight"
                style={{ color: "var(--heading-color)", fontFamily: "var(--heading-font)" }}
              >
                {data.googleRating!.toFixed(1)}
              </span>
              <div className="flex gap-0.5" aria-hidden>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-3.5 w-3.5",
                      i < Math.round(data.googleRating!)
                        ? "fill-amber-500/90 text-amber-500/90"
                        : "text-[color-mix(in_srgb,var(--body-text)_20%,transparent)]",
                    )}
                  />
                ))}
              </div>
            </div>
            <p className="text-[13px] opacity-55" style={{ color: "var(--body-text)" }}>
              {data.reviewCount} {copy.googleReviewsSuffix}
            </p>
            {data.googleReviewsUrl ? (
              <a
                href={data.googleReviewsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[12px] font-medium tracking-wide opacity-70 underline-offset-4 transition hover:opacity-100 hover:underline"
                style={{ color: "var(--accent-color)" }}
              >
                {copy.googleCtaLabel}
              </a>
            ) : null}
          </div>
        ) : null}

        {hasQuote ? (
          <blockquote className="max-w-md">
            <p
              className="text-pretty text-lg font-light italic leading-relaxed sm:text-xl"
              style={{ fontFamily: "var(--heading-font)", color: "var(--heading-color)" }}
            >
              « {data.quote.trim()} »
            </p>
            {data.quoteAuthor.trim() ? (
              <footer className="mt-3 text-[11px] tracking-[0.2em] uppercase opacity-45" style={{ color: "var(--body-text)" }}>
                {data.quoteAuthor}
              </footer>
            ) : null}
          </blockquote>
        ) : null}

        {data.pressMentions.length > 0 ? (
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 opacity-50">
            {data.pressMentions.slice(0, 4).map((m) => (
              <span
                key={m}
                className="text-[11px] font-medium tracking-[0.18em] uppercase"
                style={{ color: "var(--heading-color)" }}
              >
                {m}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
