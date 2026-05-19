"use client";

import Image from "next/image";
import { cn } from "@/src/lib/utils";

export function ShowroomAmbiance({
  images,
  moodLine,
  eyebrow = "L'ambiance",
}: {
  images: string[];
  moodLine?: string;
  eyebrow?: string;
}) {
  if (images.length === 0 && !moodLine?.trim()) return null;

  const line = moodLine?.trim();
  const shortLine =
    line && line.length <= 140 ? line : line ? line.slice(0, 137).trimEnd() + "…" : null;

  return (
    <section id="ambiance" className="scroll-mt-20 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p
          className="text-center text-[10px] font-semibold uppercase tracking-[0.32em]"
          style={{ color: "var(--accent-color)" }}
        >
          {eyebrow}
        </p>
        {shortLine ? (
          <p
            className="mx-auto mt-5 max-w-md text-center text-lg font-light leading-relaxed opacity-90 sm:text-xl"
            style={{ color: "var(--heading-color)", fontFamily: "var(--heading-font)" }}
          >
            {shortLine}
          </p>
        ) : null}
      </div>

      {images.length > 0 ? (
        <div className="zg-showroom-reels-scroll mt-12 flex gap-3 overflow-x-auto px-4 pb-1 snap-x snap-mandatory sm:gap-4 sm:px-6 md:grid md:grid-cols-3 md:overflow-visible md:pb-0 lg:grid-cols-4 lg:gap-4">
          {images.slice(0, 8).map((src, i) => (
            <div
              key={src}
              className={cn(
                "relative shrink-0 snap-center overflow-hidden rounded-2xl",
                "aspect-[9/16] w-[min(78vw,300px)] shadow-[0_32px_80px_-40px_rgba(0,0,0,0.5)]",
                "md:w-full md:shrink",
                i % 3 === 1 && "md:mt-10",
                i % 3 === 2 && "md:mt-5",
              )}
            >
              <Image
                src={src}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width:768px) 78vw, 25vw"
                unoptimized
                priority={i < 2}
              />
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"
                aria-hidden
              />
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
