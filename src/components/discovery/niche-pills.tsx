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
    <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
      <Link
        href={hrefFor(null)}
        className={cn(
          "shrink-0 rounded-full border px-3.5 py-1.5 text-sm transition",
          !activeSlug
            ? "border-white/20 bg-white text-zinc-950"
            : "border-white/[0.08] bg-white/[0.03] text-white/65 hover:text-white",
        )}
      >
        {forYouLabel}
      </Link>
      {ordered.map((cat) => (
        <Link
          key={cat.id}
          href={hrefFor(cat.slug)}
          className={cn(
            "shrink-0 rounded-full border px-3.5 py-1.5 text-sm transition",
            activeSlug === cat.slug
              ? "border-white/20 bg-white text-zinc-950"
              : "border-white/[0.08] bg-white/[0.03] text-white/65 hover:text-white",
          )}
        >
          {cat.name}
        </Link>
      ))}
    </div>
  );
}
