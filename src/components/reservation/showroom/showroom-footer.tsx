"use client";

import { Instagram, Facebook, Globe, MapPin } from "lucide-react";
import { SHOWROOM_PRODUCT_NAME } from "@/src/lib/showroom/branding";

/** Pied de page — réseaux, adresse, mention ZenGrow */
export function ShowroomFooter({
  address,
  instagramUrl,
  facebookUrl,
  tiktokUrl,
  websiteUrl,
  showPoweredBy = true,
}: {
  address?: string | null;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  tiktokUrl?: string | null;
  websiteUrl?: string | null;
  showPoweredBy?: boolean;
}) {
  const socials: { href: string; label: string; icon: typeof Instagram }[] = [];
  if (instagramUrl?.trim()) socials.push({ href: instagramUrl.trim(), label: "Instagram", icon: Instagram });
  if (facebookUrl?.trim()) socials.push({ href: facebookUrl.trim(), label: "Facebook", icon: Facebook });
  if (tiktokUrl?.trim()) socials.push({ href: tiktokUrl.trim(), label: "TikTok", icon: Globe });
  if (websiteUrl?.trim()) socials.push({ href: websiteUrl.trim(), label: "Site web", icon: Globe });

  const addr = address?.trim();
  if (socials.length === 0 && !addr && !showPoweredBy) return null;

  return (
    <footer className="zg-showroom-footer border-t border-[color-mix(in_srgb,var(--body-text)_6%,transparent)] px-5 py-10 sm:px-6 sm:py-12">
      <div className="mx-auto flex max-w-lg flex-col items-center gap-6 text-center sm:max-w-xl md:max-w-2xl">
        {socials.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-3">
            {socials.map((s) => {
              const Icon = s.icon;
              return (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--body-text)_10%,transparent)] transition hover:border-[color-mix(in_srgb,var(--accent-color)_35%,transparent)]"
                  aria-label={s.label}
                >
                  <Icon className="h-4 w-4" style={{ color: "var(--accent-color)" }} />
                </a>
              );
            })}
          </div>
        ) : null}

        {addr ? (
          <p className="inline-flex items-center gap-1.5 text-[12px] opacity-50" style={{ color: "var(--body-text)" }}>
            <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {addr}
          </p>
        ) : null}

        {showPoweredBy ? (
          <p className="text-[10px] font-medium tracking-[0.2em] uppercase opacity-35" style={{ color: "var(--body-text)" }}>
            Propulsé par {SHOWROOM_PRODUCT_NAME}
          </p>
        ) : null}
      </div>
    </footer>
  );
}
