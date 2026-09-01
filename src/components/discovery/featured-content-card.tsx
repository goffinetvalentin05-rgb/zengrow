"use client";

import { FEATURED_CTA, FEATURED_PLATFORM_LABELS, type FeaturedPlatform } from "@/src/lib/discovery/constants";
import { normalizeHttpUrl, resolveFeaturedThumbnail } from "@/src/lib/discovery/media";
import type { FeaturedContent } from "@/src/lib/discovery/types";
import { SocialGlyph } from "@/src/components/discovery/social-glyph";
import { cn } from "@/src/lib/utils";

const FALLBACK: Record<string, string> = {
  youtube: "from-red-500/25 via-white/[0.04] to-transparent",
  instagram: "from-fuchsia-500/20 via-orange-400/10 to-transparent",
  tiktok: "from-cyan-400/20 via-pink-500/10 to-transparent",
  x: "from-white/15 via-white/[0.04] to-transparent",
  linkedin: "from-sky-500/25 via-white/[0.04] to-transparent",
  article: "from-amber-400/20 via-white/[0.04] to-transparent",
  other: "from-white/10 via-white/[0.04] to-transparent",
};

export function FeaturedContentCard({
  item,
  onClick,
  className,
}: {
  item: FeaturedContent;
  onClick?: () => void;
  className?: string;
}) {
  const thumb = resolveFeaturedThumbnail(item);
  const cta = FEATURED_CTA[item.platform] ?? "Open link";
  const label = FEATURED_PLATFORM_LABELS[item.platform as FeaturedPlatform] ?? item.platform;
  const glyphPlatform = item.platform === "article" || item.platform === "other" ? "website" : item.platform;

  return (
    <a
      href={normalizeHttpUrl(item.url)}
      target="_blank"
      rel="noreferrer"
      onClick={onClick}
      className={cn(
        "group relative block overflow-hidden rounded-[1.35rem] bg-white/[0.04] ring-1 ring-white/[0.06] transition hover:ring-white/15",
        className,
      )}
    >
      {thumb ? (
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={thumb} alt="" className="aspect-[16/10] w-full object-cover" />
          {item.platform === "youtube" ? (
            <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-black/65 px-2 py-1 text-[10px] uppercase tracking-wide text-white backdrop-blur">
              <SocialGlyph platform="youtube" className="h-3 w-3" />
              YouTube
            </span>
          ) : null}
        </div>
      ) : (
        <div className={cn("flex aspect-[16/10] items-end bg-gradient-to-br px-4 py-4", FALLBACK[item.platform] ?? FALLBACK.other)}>
          <SocialGlyph platform={glyphPlatform} className="h-7 w-7 text-white/50" />
        </div>
      )}
      <div className="px-4 py-3">
        <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] text-white/40">
          <SocialGlyph platform={glyphPlatform} className="h-3 w-3" />
          {label}
        </p>
        <p className="mt-1.5 line-clamp-2 text-[15px] leading-snug text-white">{item.title || cta}</p>
      </div>
    </a>
  );
}
