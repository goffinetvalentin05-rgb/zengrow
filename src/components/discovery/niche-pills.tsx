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
}: {
  categories: Category[];
  activeSlug?: string | null;
  favoriteSlugs?: string[];
  hrefFor: (slug: string | null) => string;
  forYouLabel?: string;
}) {
  const favorites = categories.filter((cat) => favoriteSlugs.includes(cat.slug));
  const rest = categories.filter((cat) => !favoriteSlugs.includes(cat.slug));
  const ordered = [...favorites, ...rest];

  return (
    <div className="flex gap-2 overflow-x-auto overscroll-x-contain pb-1 touch-pan-x [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <Link
        href={hrefFor(null)}
        scroll={false}
        className={cn(
          "inline-flex min-h-10 shrink-0 items-center rounded-full border px-3.5 text-sm transition active:scale-[0.98]",
          !activeSlug
            ? "border-white/20 bg-white text-zinc-950"
            : "border-white/[0.08] bg-white/[0.03] text-white/65",
        )}
      >
        {forYouLabel}
      </Link>
      {ordered.map((cat) => (
        <Link
          key={cat.id}
          href={hrefFor(cat.slug)}
          scroll={false}
          className={cn(
            "inline-flex min-h-10 shrink-0 items-center rounded-full border px-3.5 text-sm transition active:scale-[0.98]",
            activeSlug === cat.slug
              ? "border-white/20 bg-white text-zinc-950"
              : "border-white/[0.08] bg-white/[0.03] text-white/65",
          )}
        >
          {cat.name}
        </Link>
      ))}
    </div>
  );
}
