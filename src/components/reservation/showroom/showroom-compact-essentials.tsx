"use client";

import { Clock, MapPin } from "lucide-react";
import { Instagram, Facebook, Globe } from "lucide-react";
import { SHOWROOM_PRODUCT_NAME } from "@/src/lib/showroom/branding";

/** Pied de page compact — intégré au hero, style glass ZenGrow */
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
  embedded = false,
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
  /** Rendu dans le hero (fond transparent) */
  embedded?: boolean;
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
    <div
      className={embedded ? "zg-showroom-essentials zg-showroom-essentials--embedded" : "zg-showroom-essentials"}
    >
      <div className="zg-showroom-essentials-inner">
        {(hours || place) ? (
          <div className="zg-showroom-essentials-line">
            {hours ? (
              <span className="zg-showroom-essentials-chip">
                <Clock className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
                {hours}
              </span>
            ) : null}
            {place ? (
              <span className="zg-showroom-essentials-chip">
                {maps ? (
                  <a
                    href={maps}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 transition hover:opacity-90"
                  >
                    <MapPin className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
                    <span>{place}</span>
                    <span className="opacity-60">· Itinéraire</span>
                  </a>
                ) : (
                  <>
                    <MapPin className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
                    {place}
                  </>
                )}
              </span>
            ) : null}
          </div>
        ) : null}

        {socials.length > 0 ? (
          <div className="zg-showroom-essentials-socials">
            {socials.map((s) => {
              const Icon = s.icon;
              return (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="zg-showroom-essentials-social"
                  aria-label={s.label}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden />
                </a>
              );
            })}
          </div>
        ) : null}

        {showPoweredBy ? (
          <p className="zg-showroom-essentials-powered">
            Propulsé par {SHOWROOM_PRODUCT_NAME}
          </p>
        ) : null}
      </div>
    </div>
  );
}
