"use client";

import { MapPin } from "lucide-react";
import { Instagram, Facebook, Globe } from "lucide-react";
import { SHOWROOM_PRODUCT_NAME } from "@/src/lib/showroom/branding";

/** Infos pratiques compactes + réseaux + mention ZenGrow */
export function ShowroomCompactEssentials({
  hoursSummary,
  city,
  address,
  googleMapsUrl,
  instagramUrl,
  facebookUrl,
  tiktokUrl,
  websiteUrl,
  showPoweredBy = true,
}: {
  hoursSummary?: string | null;
  city?: string | null;
  address?: string | null;
  googleMapsUrl?: string | null;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  tiktokUrl?: string | null;
  websiteUrl?: string | null;
  showPoweredBy?: boolean;
}) {
  const hours = hoursSummary?.trim();
  const place = city?.trim() || address?.trim();
  const maps = googleMapsUrl?.trim();

  const socials: { href: string; label: string; icon: typeof Instagram }[] = [];
  if (instagramUrl?.trim()) socials.push({ href: instagramUrl.trim(), label: "Instagram", icon: Instagram });
  if (facebookUrl?.trim()) socials.push({ href: facebookUrl.trim(), label: "Facebook", icon: Facebook });
  if (tiktokUrl?.trim()) socials.push({ href: tiktokUrl.trim(), label: "TikTok", icon: Globe });
  if (websiteUrl?.trim()) socials.push({ href: websiteUrl.trim(), label: "Site", icon: Globe });

  const hasEssentials = hours || place || socials.length > 0 || showPoweredBy;
  if (!hasEssentials) return null;

  return (
    <section className="zg-showroom-essentials px-5 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto flex max-w-md flex-col items-center gap-5 text-center">
        {hours ? (
          <p className="text-[13px] leading-relaxed opacity-70" style={{ color: "var(--body-text)" }}>
            {hours}
          </p>
        ) : null}

        {place ? (
          <p className="flex flex-wrap items-center justify-center gap-1.5 text-[13px] opacity-75" style={{ color: "var(--body-text)" }}>
            <span>{place}</span>
            {maps ? (
              <>
                <span className="opacity-40">·</span>
                <a
                  href={maps}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-semibold underline-offset-2 hover:underline"
                  style={{ color: "var(--accent-color)" }}
                >
                  <MapPin className="h-3.5 w-3.5" aria-hidden />
                  Voir l&apos;itinéraire
                </a>
              </>
            ) : null}
          </p>
        ) : null}

        {socials.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-2.5">
            {socials.map((s) => {
              const Icon = s.icon;
              return (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--body-text)_10%,transparent)] transition hover:border-[color-mix(in_srgb,var(--accent-color)_35%,transparent)]"
                  aria-label={s.label}
                >
                  <Icon className="h-4 w-4" style={{ color: "var(--accent-color)" }} />
                </a>
              );
            })}
          </div>
        ) : null}

        {showPoweredBy ? (
          <p className="text-[10px] font-medium tracking-[0.22em] uppercase opacity-30" style={{ color: "var(--body-text)" }}>
            Propulsé par {SHOWROOM_PRODUCT_NAME}
          </p>
        ) : null}
      </div>
    </section>
  );
}
