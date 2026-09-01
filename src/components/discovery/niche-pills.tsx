"use client";

import Link from "next/link";
import type { Category } from "@/src/lib/discovery/types";
import { cn } from "@/src/lib/utils";

export function NichePills({
  categories,
  activeSlug,
  favoriteSlugs = [],
  hrefFor,
  forYouLabel = "For you",
  onNavigate,
}: {
  categories: Category[];
  activeSlug?: string | null;
  favoriteSlugs?: string[];
  hrefFor: (slug: string | null) => string;
  forYouLabel?: string;
  onNavigate?: () => void;
}) {
  const favorites = categories.filter((cat) => favoriteSlugs.includes(cat.slug));
  const rest = categories.filter((cat) => !favoriteSlugs.includes(cat.slug));
  const ordered = [...favorites, ...rest];

  return (
    <div className="flex gap-2 overflow-x-auto overscroll-x-contain pb-1 touch-pan-x [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <Link
        href={hrefFor(null)}
        scroll={false}
        onClick={() => {
          if (activeSlug) onNavigate?.();
        }}
        className={cn("sz-pill", !activeSlug && "is-on")}
      >
        {forYouLabel}
      </Link>
      {ordered.map((cat) => (
        <Link
          key={cat.id}
          href={hrefFor(cat.slug)}
          scroll={false}
          onClick={() => {
            if (activeSlug !== cat.slug) onNavigate?.();
          }}
          className={cn("sz-pill", activeSlug === cat.slug && "is-on")}
        >
          {cat.name}
        </Link>
      ))}
    </div>
  );
}
