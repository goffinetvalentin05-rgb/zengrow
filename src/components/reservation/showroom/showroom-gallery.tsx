"use client";

import Image from "next/image";
import { cn } from "@/src/lib/utils";

/** Galerie ambiance — scroll horizontal mobile, grille desktop */
export function ShowroomGallery({
  images,
  title = "L'ambiance",
  eyebrow = "Galerie",
}: {
  images: string[];
  title?: string;
  eyebrow?: string;
}) {
  if (images.length === 0) return null;

  const featured = images[0];
  const rest = images.slice(1, 7);

  return (
    <section id="galerie" className="zg-showroom-gallery scroll-mt-0 py-12 sm:py-16">
      <div className="mx-auto max-w-lg px-5 sm:max-w-xl sm:px-6 md:max-w-4xl lg:max-w-5xl">
        <header className="mb-6 sm:mb-8">
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.32em]"
            style={{ color: "var(--accent-color)" }}
          >
            {eyebrow}
          </p>
          <h2
            className="mt-2 text-[clamp(1.5rem,4.5vw,2rem)] font-medium leading-tight"
            style={{ fontFamily: "var(--heading-font)", color: "var(--heading-color)" }}
          >
            {title}
          </h2>
        </header>

        {/* Mobile : carrousel vertical type reels */}
        <div className="zg-showroom-reels-scroll flex gap-2.5 overflow-x-auto pb-1 snap-x snap-mandatory md:hidden">
          {images.slice(0, 8).map((src, i) => (
            <div
              key={`${src}-${i}`}
              className={cn(
                "relative shrink-0 snap-center overflow-hidden rounded-2xl",
                "aspect-[4/5] w-[min(78vw,280px)]",
                "shadow-[0_32px_80px_-40px_rgba(0,0,0,0.7)]",
              )}
            >
              <Image
                src={src}
                alt=""
                fill
                className="object-cover"
                sizes="78vw"
                unoptimized
                priority={i < 2}
              />
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent"
                aria-hidden
              />
            </div>
          ))}
        </div>

        {/* Desktop : hero + mosaïque */}
        <div className="hidden gap-3 md:grid md:grid-cols-12 md:gap-4">
          <div className="relative aspect-[16/11] overflow-hidden rounded-2xl md:col-span-7 md:aspect-auto md:min-h-[360px]">
            <Image
              src={featured}
              alt=""
              fill
              className="object-cover transition duration-700 hover:scale-[1.02]"
              sizes="(max-width:1024px) 100vw, 58vw"
              unoptimized
              priority
            />
          </div>
          <div className="grid grid-cols-2 gap-3 md:col-span-5 md:grid-cols-1">
            {rest.slice(0, 4).map((src) => (
              <div key={src} className="relative aspect-[16/10] overflow-hidden rounded-xl">
                <Image src={src} alt="" fill className="object-cover" sizes="280px" unoptimized />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
