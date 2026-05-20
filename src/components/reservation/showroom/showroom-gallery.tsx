"use client";

import Image from "next/image";
import { cn } from "@/src/lib/utils";

const MAX_AMBIANCE_PHOTOS = 3;

/** Bandeau ambiance court — phrase + quelques photos */
export function ShowroomGallery({
  images,
  title = "L'ambiance",
  eyebrow = "Galerie",
  tagline,
}: {
  images: string[];
  title?: string;
  eyebrow?: string;
  tagline?: string;
}) {
  if (images.length === 0) return null;

  const photos = images.slice(0, MAX_AMBIANCE_PHOTOS);
  const phrase = tagline?.trim();

  return (
    <section id="galerie" className="zg-showroom-gallery scroll-mt-0 py-10 sm:py-14">
      <div className="mx-auto max-w-lg px-5 sm:max-w-xl sm:px-6 md:max-w-2xl">
        <header className="mb-5 sm:mb-6">
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.32em]"
            style={{ color: "var(--accent-color)" }}
          >
            {eyebrow}
          </p>
          <h2
            className="mt-2 text-[clamp(1.35rem,4vw,1.75rem)] font-medium leading-tight"
            style={{ fontFamily: "var(--heading-font)", color: "var(--heading-color)" }}
          >
            {title}
          </h2>
          {phrase ? (
            <p className="mt-3 max-w-md text-pretty text-[14px] leading-relaxed opacity-70" style={{ color: "var(--body-text)" }}>
              {phrase}
            </p>
          ) : null}
        </header>

        <div className="zg-showroom-reels-scroll flex gap-2.5 overflow-x-auto pb-1 snap-x snap-mandatory sm:gap-3">
          {photos.map((src, i) => (
            <div
              key={`${src}-${i}`}
              className={cn(
                "relative shrink-0 snap-center overflow-hidden rounded-2xl",
                photos.length === 1 ? "aspect-[16/10] w-full" : "aspect-[4/5] w-[min(72vw,240px)] sm:w-[min(38vw,260px)]",
                "shadow-[0_24px_64px_-36px_rgba(0,0,0,0.75)]",
              )}
            >
              <Image
                src={src}
                alt=""
                fill
                className="object-cover"
                sizes="72vw"
                unoptimized
                priority={i === 0}
              />
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"
                aria-hidden
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
