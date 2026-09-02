"use client";

import { useI18n } from "@/src/i18n/provider";
import type { FeaturedPlatform } from "@/src/lib/discovery/constants";
import { normalizeHttpUrl, resolveFeaturedThumbnail } from "@/src/lib/discovery/media";
import type { FeaturedContent } from "@/src/lib/discovery/types";
import { SocialGlyph } from "@/src/components/discovery/social-glyph";
import { FadeImg } from "@/src/components/discovery/sz-ui";
import { cn } from "@/src/lib/utils";

export function FeaturedContentCard({
  item,
  onClick,
  className,
}: {
  item: FeaturedContent;
  onClick?: () => void;
  className?: string;
}) {
  const { t } = useI18n();
  const thumb = resolveFeaturedThumbnail(item);
  const platform = item.platform as FeaturedPlatform;
  const cta = t.featuredCta[platform] ?? t.featuredCta.other;
  const label = t.featuredPlatform[platform] ?? item.platform;
  const glyphPlatform = item.platform === "article" || item.platform === "other" ? "website" : item.platform;

  return (
    <a
      href={normalizeHttpUrl(item.url)}
      target="_blank"
      rel="noreferrer"
      onClick={onClick}
      className={cn("sz-card sz-card-hover group relative block bg-white/[0.04]", className)}
    >
      {thumb ? (
        <div className="sz-card-media relative">
          <FadeImg src={thumb} alt="" className="aspect-[16/10] w-full object-cover" />
          {item.platform === "youtube" ? (
            <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-black/65 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-white backdrop-blur">
              <SocialGlyph platform="youtube" className="h-3 w-3" />
              YouTube
            </span>
          ) : null}
        </div>
      ) : (
        <div className="relative flex aspect-[16/10] items-end overflow-hidden bg-[#0a0a0c] px-4 py-4">
          <div className="sz-grain absolute inset-0 opacity-[0.12]" />
          <SocialGlyph platform={glyphPlatform} className="relative h-7 w-7 text-white/45" />
        </div>
      )}
      <div className="px-4 py-3">
        <p className="sz-label flex items-center gap-1.5">
          <SocialGlyph platform={glyphPlatform} className="h-3 w-3" />
          {label}
        </p>
        <p className="mt-1.5 line-clamp-2 text-[15px] leading-snug text-white">{item.title || cta}</p>
      </div>
    </a>
  );
}
