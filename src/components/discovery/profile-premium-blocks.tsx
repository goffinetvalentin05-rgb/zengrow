"use client";

import { activeProfileBlocks, isProfileBlockType } from "@/src/lib/discovery/conversion";
import { normalizeHttpUrl } from "@/src/lib/discovery/media";
import { trackDiscoveryEvent } from "@/src/lib/discovery/track";
import type { ProfileBlock } from "@/src/lib/discovery/types";
import { useI18n } from "@/src/i18n/provider";

export function ProfilePremiumBlocks({
  profileId,
  blocks,
  source,
}: {
  profileId: string;
  blocks: ProfileBlock[];
  source: string;
}) {
  const { t } = useI18n();
  const visible = activeProfileBlocks(blocks);
  if (!visible.length) return null;

  return (
    <section className="px-5">
      <div className="space-y-3">
        {visible.map((block) => {
          const type = isProfileBlockType(block.blockType) ? block.blockType : "custom";
          const defaults = t.conversion.blockDefaults[type];
          const title = block.title?.trim() || defaults.title;
          const description = block.description?.trim() || defaults.description;
          const cta = block.ctaLabel?.trim() || defaults.ctaLabel;
          const href = block.url ? normalizeHttpUrl(block.url) : "";
          if (!href) return null;
          return (
            <a
              key={block.id}
              href={href}
              target="_blank"
              rel="noreferrer"
              onClick={() =>
                trackDiscoveryEvent({
                  profileId,
                  eventType: "premium_block_click",
                  source,
                  platform: type,
                  contentId: block.id,
                  destination: href,
                })
              }
              className="sz-press block overflow-hidden rounded-[1.5rem] bg-black/35 px-4 py-3.5 ring-1 ring-white/[0.08] backdrop-blur-md sm:px-5 sm:py-4"
            >
              <p className="text-[11px] uppercase tracking-[0.14em] text-white/40">
                {t.conversion.blockTypes[type]}
              </p>
              <h2 className="mt-2 text-[17px] text-white">{title}</h2>
              {description ? (
                <p className="mt-1.5 text-[15px] leading-relaxed text-white/55">{description}</p>
              ) : null}
              <p className="mt-3 text-sm" style={{ color: "var(--profile-accent)" }}>
                {cta} →
              </p>
            </a>
          );
        })}
      </div>
    </section>
  );
}
