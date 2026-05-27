"use client";

import Image from "next/image";
import { cn } from "@/src/lib/utils";
import {
  ShowroomGalleryLightbox,
  useShowroomGalleryLightbox,
} from "@/src/components/reservation/showroom/showroom-gallery-lightbox";

const MAX_GALLERY = 6;

/** Galerie ambiance — cartes arrondies, clic pour agrandir */
export function ShowroomGallery({
  images,
  title = "L'ambiance",
  eyebrow = "Galerie",
}: {
  images: string[];
  title?: string;
  eyebrow?: string;
  tagline?: string;
}) {
  const photos = images.filter(Boolean).slice(0, MAX_GALLERY);
  const { openIndex, open, close, goPrev, goNext } = useShowroomGalleryLightbox(photos.length);

  if (photos.length === 0) return null;

  return (
    <>
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
          </header>

          <div
            className={cn(
              "grid gap-2.5 sm:gap-3",
              photos.length === 1 && "grid-cols-1",
              photos.length === 2 && "grid-cols-2",
              photos.length >= 3 && "grid-cols-2",
              photos.length >= 5 && "sm:grid-cols-3",
            )}
          >
            {photos.map((src, i) => (
              <button
                key={`${src}-${i}`}
                type="button"
                className={cn(
                  "group relative overflow-hidden rounded-2xl text-left shadow-[0_20px_50px_-28px_rgba(0,0,0,0.55)] transition hover:scale-[1.01] active:scale-[0.99]",
                  photos.length === 1 ? "aspect-[16/10]" : "aspect-[4/5]",
                )}
                onClick={() => open(i)}
                aria-label={`Voir la photo ${i + 1}`}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, 33vw"
                  unoptimized
                  priority={i < 2}
                />
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-80"
                  aria-hidden
                />
              </button>
            ))}
          </div>
        </div>
      </section>

      <ShowroomGalleryLightbox
        images={photos}
        openIndex={openIndex}
        onClose={close}
        onPrev={goPrev}
        onNext={goNext}
      />
    </>
  );
}
