"use client";

import Image from "next/image";
import { cn } from "@/src/lib/utils";

/** Galerie verticale lifestyle — scroll reels mobile-first */
export function ShowroomGallery({
  images,
  eyebrow = "En images",
}: {
  images: string[];
  eyebrow?: string;
}) {
  if (images.length === 0) return null;

  return (
    <section id="galerie" className="scroll-mt-20 py-12 sm:py-20">
      <p
        className="px-4 text-center text-[10px] font-semibold uppercase tracking-[0.32em] sm:px-6"
        style={{ color: "var(--accent-color)" }}
      >
        {eyebrow}
      </p>

      <div className="zg-showroom-reels-scroll mt-10 flex gap-3 overflow-x-auto px-4 pb-2 snap-x snap-mandatory sm:mt-12 sm:gap-4 sm:px-6 md:grid md:grid-cols-3 md:overflow-visible md:pb-0 lg:grid-cols-4">
        {images.slice(0, 10).map((src, i) => (
          <div
            key={`${src}-${i}`}
            className={cn(
              "relative shrink-0 snap-center overflow-hidden rounded-none",
              "aspect-[9/16] w-[min(76vw,280px)]",
              "shadow-[0_40px_100px_-48px_rgba(0,0,0,0.55)]",
              "md:w-full md:shrink",
              i % 3 === 1 && "md:mt-12",
              i % 3 === 2 && "md:mt-6",
            )}
          >
            <Image
              src={src}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width:768px) 76vw, 25vw"
              unoptimized
              priority={i < 2}
            />
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/10"
              aria-hidden
            />
          </div>
        ))}
      </div>
    </section>
  );
}
