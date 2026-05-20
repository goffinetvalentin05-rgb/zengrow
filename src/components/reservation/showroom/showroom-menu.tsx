"use client";

import Image from "next/image";
import { ChevronRight } from "lucide-react";
import type { MenuOfferItem } from "@/src/lib/public-page/premium-content";
import { cn } from "@/src/lib/utils";

const MAX_ITEMS = 4;

/** Aperçu menu — cartes plats + lien menu complet */
export function ShowroomMenu({
  offers,
  menuHref,
  menuPdfLabel,
  title = "À la carte",
  eyebrow = "Le menu",
  onReserve,
}: {
  offers: MenuOfferItem[];
  menuHref?: string | null;
  menuPdfLabel?: string;
  title?: string;
  eyebrow?: string;
  onReserve?: () => void;
}) {
  const items = offers.filter((o) => o.title.trim()).slice(0, MAX_ITEMS);
  const href = menuHref?.trim();
  const pdfLabel = menuPdfLabel?.trim() || "Voir le menu complet";

  if (items.length === 0 && !href) return null;

  return (
    <section id="menu" className="zg-showroom-menu scroll-mt-0 py-12 sm:py-16">
      <div className="mx-auto max-w-lg px-5 sm:max-w-xl sm:px-6 md:max-w-2xl">
        <header className="mb-8">
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.32em]"
            style={{ color: "var(--accent-color)" }}
          >
            {eyebrow}
          </p>
          <h2
            className="mt-3 text-[clamp(1.65rem,5vw,2.25rem)] font-medium leading-tight tracking-tight"
            style={{ fontFamily: "var(--heading-font)", color: "var(--heading-color)" }}
          >
            {title}
          </h2>
        </header>

        {items.length > 0 ? (
          <ul className="flex flex-col gap-4">
            {items.map((o) => (
              <li key={o.id}>
                <article className="zg-showroom-card group flex gap-4 overflow-hidden p-3 sm:gap-5 sm:p-4">
                  {o.imageUrl?.trim() ? (
                    <div className="relative aspect-square w-[88px] shrink-0 overflow-hidden rounded-xl sm:w-[100px]">
                      <Image
                        src={o.imageUrl.trim()}
                        alt=""
                        fill
                        className="object-cover transition duration-500 group-hover:scale-[1.04]"
                        sizes="100px"
                        unoptimized
                      />
                    </div>
                  ) : null}
                  <div className="min-w-0 flex-1 py-0.5">
                    <div className="flex items-baseline justify-between gap-3">
                      <h3
                        className="text-base font-medium leading-snug sm:text-lg"
                        style={{ fontFamily: "var(--heading-font)", color: "var(--heading-color)" }}
                      >
                        {o.title}
                      </h3>
                      {o.price ? (
                        <span
                          className="shrink-0 text-sm font-medium tabular-nums sm:text-base"
                          style={{ color: "var(--accent-color)", fontFamily: "var(--heading-font)" }}
                        >
                          {o.price}
                        </span>
                      ) : null}
                    </div>
                    {o.description?.trim() ? (
                      <p
                        className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed opacity-65"
                        style={{ color: "var(--body-text)" }}
                      >
                        {o.description.trim()}
                      </p>
                    ) : null}
                  </div>
                </article>
              </li>
            ))}
          </ul>
        ) : null}

        <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-center", items.length > 0 && "mt-8")}>
          {href ? (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="zg-showroom-btn-secondary group inline-flex min-h-[48px] items-center justify-center gap-2 px-6"
            >
              {pdfLabel}
              <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
            </a>
          ) : null}
          {onReserve ? (
            <button type="button" onClick={onReserve} className="zg-showroom-btn-ghost min-h-[48px] px-6 text-sm font-medium">
              Réserver une table
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
