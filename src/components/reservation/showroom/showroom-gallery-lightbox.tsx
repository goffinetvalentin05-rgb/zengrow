"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/src/lib/utils";

export function useShowroomGalleryLightbox(imageCount: number) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const open = useCallback((index: number) => setOpenIndex(index), []);
  const close = useCallback(() => setOpenIndex(null), []);

  const goPrev = useCallback(() => {
    setOpenIndex((i) => (i === null || imageCount === 0 ? null : (i - 1 + imageCount) % imageCount));
  }, [imageCount]);

  const goNext = useCallback(() => {
    setOpenIndex((i) => (i === null || imageCount === 0 ? null : (i + 1) % imageCount));
  }, [imageCount]);

  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [openIndex, close, goPrev, goNext]);

  return { openIndex, open, close, goPrev, goNext };
}

export function ShowroomGalleryLightbox({
  images,
  openIndex,
  onClose,
  onPrev,
  onNext,
}: {
  images: string[];
  openIndex: number | null;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  if (openIndex === null || !images[openIndex]) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/92 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Photo agrandie"
      onClick={onClose}
    >
      <button
        type="button"
        className="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-label="Fermer"
      >
        <X className="h-5 w-5" />
      </button>

      {images.length > 1 ? (
        <>
          <button
            type="button"
            className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white sm:left-6"
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
            aria-label="Photo précédente"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white sm:right-6"
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            aria-label="Photo suivante"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      ) : null}

      <div
        className={cn("relative aspect-[4/5] w-full max-w-md overflow-hidden rounded-2xl sm:aspect-[3/4]")}
        onClick={(e) => e.stopPropagation()}
      >
        <Image src={images[openIndex]} alt="" fill className="object-cover" sizes="90vw" unoptimized priority />
      </div>
    </div>
  );
}
