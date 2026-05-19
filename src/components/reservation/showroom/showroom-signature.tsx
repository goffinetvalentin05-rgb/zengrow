"use client";

import Image from "next/image";
import type { MenuOfferItem } from "@/src/lib/public-page/premium-content";

const MAX_SIGNATURE = 5;

export function ShowroomSignature({
  offers,
  menuHref,
  menuPdfLabel,
  eyebrow = "Signature",
  title = "Nos plats",
}: {
  offers: MenuOfferItem[];
  menuHref?: string | null;
  menuPdfLabel?: string;
  eyebrow?: string;
  title?: string;
}) {
  const items = offers.filter((o) => o.title.trim()).slice(0, MAX_SIGNATURE);
  if (items.length === 0 && !menuHref?.trim()) return null;

  return (
    <section id="signature" className="scroll-mt-20 py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <p
          className="text-[10px] font-semibold uppercase tracking-[0.32em]"
          style={{ color: "var(--accent-color)" }}
        >
          {eyebrow}
        </p>
        <h2
          className="mt-4 text-[clamp(1.75rem,5vw,2.5rem)] font-medium leading-tight tracking-tight"
          style={{ fontFamily: "var(--heading-font)", color: "var(--heading-color)" }}
        >
          {title}
        </h2>

        {items.length > 0 ? (
          <ul className="mt-12 space-y-14 sm:space-y-16">
            {items.map((o, idx) => (
              <li key={o.id} className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-8">
                {o.imageUrl?.trim() ? (
                  <div className="relative aspect-[4/5] w-full shrink-0 overflow-hidden rounded-sm sm:w-[42%] sm:max-w-[240px]">
                    <Image
                      src={o.imageUrl.trim()}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="(max-width:640px) 100vw, 240px"
                      unoptimized
                    />
                  </div>
                ) : null}
                <div className="min-w-0 flex-1 sm:pt-2">
                  <span
                    className="text-[11px] font-medium tabular-nums opacity-40"
                    style={{ color: "var(--accent-color)" }}
                  >
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <h3
                    className="mt-2 text-xl font-medium leading-snug sm:text-2xl"
                    style={{ fontFamily: "var(--heading-font)", color: "var(--heading-color)" }}
                  >
                    {o.title}
                  </h3>
                  {o.price ? (
                    <p
                      className="mt-2 text-lg tabular-nums"
                      style={{ color: "var(--accent-color)", fontFamily: "var(--heading-font)" }}
                    >
                      {o.price}
                    </p>
                  ) : null}
                  {o.description?.trim() ? (
                    <p
                      className="mt-3 max-w-md text-[15px] leading-relaxed opacity-75"
                      style={{ color: "var(--body-text)" }}
                    >
                      {o.description.trim().length > 100
                        ? o.description.trim().slice(0, 97) + "…"
                        : o.description.trim()}
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        ) : null}

        {menuHref?.trim() ? (
          <p className="mt-12 text-center">
            <a
              href={menuHref}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium underline-offset-4 hover:underline"
              style={{ color: "var(--accent-color)" }}
            >
              {menuPdfLabel?.trim() || "Voir la carte complète"}
            </a>
          </p>
        ) : null}
      </div>
    </section>
  );
}
