"use client";

import { FEATURED_CTA, FEATURED_PLATFORM_LABELS, type FeaturedPlatform } from "@/src/lib/discovery/constants";
import { normalizeHttpUrl, resolveFeaturedThumbnail } from "@/src/lib/discovery/media";
import type { FeaturedContent } from "@/src/lib/discovery/types";

export function FeaturedContentCard({
  item,
  onClick,
}: {
  item: FeaturedContent;
  onClick?: () => void;
}) {
  const thumb = resolveFeaturedThumbnail(item);
  const cta = FEATURED_CTA[item.platform] ?? "Open link";

  return (
    <a
      href={normalizeHttpUrl(item.url)}
      target="_blank"
      rel="noreferrer"
      onClick={onClick}
      className="group block overflow-hidden rounded-[1.4rem] bg-white/[0.04]"
    >
      {thumb ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={thumb} alt="" className="aspect-video w-full object-cover" />
      ) : (
        <div className="flex aspect-video items-end bg-white/[0.03] px-4 py-4">
          <p className="text-sm text-white/35">{FEATURED_PLATFORM_LABELS[item.platform]}</p>
        </div>
      )}
      <div className="px-4 py-3">
        <p className="text-[11px] uppercase tracking-[0.16em] text-white/35">
          {FEATURED_PLATFORM_LABELS[item.platform as FeaturedPlatform] ?? item.platform}
        </p>
        <p className="mt-1 line-clamp-2 text-[15px] text-white">{item.title || cta}</p>
        <p className="mt-2 text-sm text-white/40 group-hover:text-white">{cta} →</p>
      </div>
    </a>
  );
}
