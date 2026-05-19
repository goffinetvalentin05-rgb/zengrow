"use client";

import Image from "next/image";
import { cn } from "@/src/lib/utils";

/** Galerie immersive type Reels / éditorial — sans titres de section */
export function ShowroomGallery({ images }: { images: string[] }) {
  if (images.length === 0) return null;

  return (
    <section id="galerie" className="zg-showroom-gallery scroll-mt-0 py-10 sm:py-14">
      <div className="zg-showroom-reels-scroll flex gap-2.5 overflow-x-auto px-3 pb-1 snap-x snap-mandatory sm:gap-3 sm:px-4 md:justify-center md:gap-4 md:overflow-visible md:px-6">
        {images.slice(0, 8).map((src, i) => (
          <div
            key={`${src}-${i}`}
            className={cn(
              "relative shrink-0 snap-center overflow-hidden",
              "aspect-[9/16] w-[min(82vw,300px)]",
              "shadow-[0_48px_120px_-56px_rgba(0,0,0,0.65)]",
              "md:w-[min(22vw,260px)] md:shrink",
              i % 3 === 1 && "md:translate-y-10",
              i % 3 === 2 && "md:translate-y-5",
            )}
          >
            <Image
              src={src}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width:768px) 82vw, 22vw"
              unoptimized
              priority={i < 2}
            />
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/5"
              aria-hidden
            />
          </div>
        ))}
      </div>
    </section>
  );
}
