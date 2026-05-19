"use client";

import Image from "next/image";
import type { MenuOfferItem } from "@/src/lib/public-page/premium-content";
import { cn } from "@/src/lib/utils";

const MAX_ITEMS = 4;

/** Expérience signature — atmosphère et désir, pas une carte « site web » */
export function ShowroomSignature({
  offers,
  moodLine,
  atmosphereImageUrl,
}: {
  offers: MenuOfferItem[];
  moodLine?: string | null;
  atmosphereImageUrl?: string | null;
}) {
  const items = offers.filter((o) => o.title.trim()).slice(0, MAX_ITEMS);
  const mood = moodLine?.trim();
  const atmosphere = atmosphereImageUrl?.trim();
  const shortMood =
    mood && mood.length <= 140 ? mood : mood ? mood.slice(0, 137).trimEnd() + "…" : null;

  if (!shortMood && !atmosphere && items.length === 0) return null;

  return (
    <section id="signature" className="zg-showroom-signature scroll-mt-0 py-16 sm:py-24">
      {shortMood ? (
        <p
          className="mx-auto max-w-md px-6 text-center text-pretty text-[clamp(1.2rem,4vw,1.55rem)] font-light leading-[1.45] tracking-tight opacity-90"
          style={{ color: "var(--heading-color)", fontFamily: "var(--heading-font)" }}
        >
          {shortMood}
        </p>
      ) : null}

      {atmosphere ? (
        <div
          className={cn(
            "relative mx-auto mt-12 aspect-[4/5] w-[min(90vw,400px)] overflow-hidden sm:mt-16 sm:w-[min(72vw,440px)]",
            !shortMood && "mt-0",
          )}
        >
          <Image
            src={atmosphere}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width:640px) 90vw, 440px"
            unoptimized
            priority
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"
            aria-hidden
          />
        </div>
      ) : null}

      {items.length > 0 ? (
        <ul
          className={cn(
            "mx-auto mt-14 flex max-w-4xl flex-col gap-12 px-4 sm:mt-20 sm:gap-16 sm:px-6",
            !atmosphere && !shortMood && "mt-0",
          )}
        >
          {items.map((o) => (
            <li key={o.id} className="flex flex-col items-center gap-5 sm:flex-row sm:items-start sm:gap-10">
              {o.imageUrl?.trim() ? (
                <div className="relative aspect-[3/4] w-full max-w-[280px] shrink-0 overflow-hidden sm:max-w-[220px]">
                  <Image
                    src={o.imageUrl.trim()}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width:640px) 280px, 220px"
                    unoptimized
                  />
                </div>
              ) : null}
              <div className="min-w-0 flex-1 text-center sm:text-left">
                <h3
                  className="text-xl font-medium leading-snug sm:text-2xl"
                  style={{ fontFamily: "var(--heading-font)", color: "var(--heading-color)" }}
                >
                  {o.title}
                </h3>
                {o.price ? (
                  <p
                    className="mt-2 text-base tabular-nums opacity-80"
                    style={{ color: "var(--accent-color)", fontFamily: "var(--heading-font)" }}
                  >
                    {o.price}
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
