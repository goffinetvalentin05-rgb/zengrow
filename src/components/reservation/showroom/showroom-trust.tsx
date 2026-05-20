"use client";

import { Star, Check } from "lucide-react";
import { cn } from "@/src/lib/utils";
import type { CredibilityContent } from "@/src/lib/public-page/premium-content";
import type { ReviewsSectionCopy } from "@/src/lib/public-page/page-sections";
import { hasCredibilityContent } from "@/src/lib/public-page/premium-content";

/** Preuves de confiance — note, avis, tags, citation */
export function ShowroomTrust({
  data,
  copy,
  highlights = [],
  omitRating = false,
}: {
  data: CredibilityContent;
  copy: ReviewsSectionCopy;
  highlights?: string[];
  omitRating?: boolean;
}) {
  const tags = highlights.map((s) => s.trim()).filter(Boolean).slice(0, 6);
  const hasCred = hasCredibilityContent(data);
  const hasRating = !omitRating && Boolean(data.googleRating && data.reviewCount);
  const hasQuote = Boolean(data.quote.trim());
  const hasPress = data.pressMentions.length > 0;

  if (!hasCred && tags.length === 0) return null;
  if (!hasRating && !hasQuote && !hasPress && tags.length === 0) return null;

  return (
    <section id="avis" className="zg-showroom-trust scroll-mt-0 py-14 sm:py-20">
      <div className="mx-auto max-w-lg px-5 sm:max-w-xl sm:px-6">
        {tags.length > 0 ? (
          <ul className="flex flex-wrap justify-center gap-2 sm:justify-start">
            {tags.map((item, i) => (
              <li
                key={`${item}-${i}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-[color-mix(in_srgb,var(--accent-color)_22%,transparent)] bg-[color-mix(in_srgb,var(--accent-color)_6%,transparent)] px-3 py-1.5 text-[11px] font-medium tracking-wide"
                style={{ color: "var(--heading-color)" }}
              >
                <Check className="h-3 w-3 shrink-0" style={{ color: "var(--accent-color)" }} aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        ) : null}

        {(hasRating || hasQuote) && (
          <div
            className={cn(
              "flex flex-col items-center gap-6 text-center",
              tags.length > 0 && "mt-10",
            )}
          >
            {hasRating ? (
              <div className="zg-showroom-card flex w-full flex-col items-center gap-3 px-6 py-7">
                <div className="flex items-baseline gap-2.5">
                  <span
                    className="text-4xl font-medium tabular-nums tracking-tight"
                    style={{ color: "var(--heading-color)", fontFamily: "var(--heading-font)" }}
                  >
                    {data.googleRating!.toFixed(1)}
                  </span>
                  <div className="flex gap-0.5" aria-hidden>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-4 w-4",
                          i < Math.round(data.googleRating!)
                            ? "fill-amber-500/90 text-amber-500/90"
                            : "text-[color-mix(in_srgb,var(--body-text)_18%,transparent)]",
                        )}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-[13px] opacity-60" style={{ color: "var(--body-text)" }}>
                  {data.reviewCount} {copy.googleReviewsSuffix}
                </p>
                {data.googleReviewsUrl ? (
                  <a
                    href={data.googleReviewsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[12px] font-semibold tracking-wide underline-offset-4 transition hover:underline"
                    style={{ color: "var(--accent-color)" }}
                  >
                    {copy.googleCtaLabel}
                  </a>
                ) : null}
              </div>
            ) : null}

            {hasQuote ? (
              <blockquote className="max-w-md px-2">
                <p
                  className="text-pretty text-lg font-light italic leading-relaxed sm:text-xl"
                  style={{ fontFamily: "var(--heading-font)", color: "var(--heading-color)" }}
                >
                  « {data.quote.trim()} »
                </p>
                {data.quoteAuthor.trim() ? (
                  <footer
                    className="mt-3 text-[11px] tracking-[0.18em] uppercase opacity-45"
                    style={{ color: "var(--body-text)" }}
                  >
                    {data.quoteAuthor}
                  </footer>
                ) : null}
              </blockquote>
            ) : null}
          </div>
        )}

        {hasPress ? (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 opacity-45">
            {data.pressMentions.slice(0, 4).map((m) => (
              <span
                key={m}
                className="text-[10px] font-semibold tracking-[0.2em] uppercase"
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
