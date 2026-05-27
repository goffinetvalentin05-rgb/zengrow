"use client";

import { Clock, MapPin, Phone, UtensilsCrossed, Instagram, Facebook, Globe } from "lucide-react";
import { cn } from "@/src/lib/utils";

/** Infos essentielles sous le CTA — horaires, menu, adresse, contact */
export function ShowroomQuickInfo({
  hoursSummary,
  menuLabel = "Voir le menu",
  onMenuClick,
  menuHref,
  address,
  city,
  phone,
  googleMapsUrl,
  instagramUrl,
  facebookUrl,
  tiktokUrl,
  websiteUrl,
  showHours = true,
  showMenu = true,
  showAddress = true,
  showPhone = true,
  showSocials = true,
}: {
  hoursSummary?: string | null;
  menuLabel?: string;
  onMenuClick?: () => void;
  menuHref?: string | null;
  address?: string | null;
  city?: string | null;
  phone?: string | null;
  googleMapsUrl?: string | null;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  tiktokUrl?: string | null;
  websiteUrl?: string | null;
  showHours?: boolean;
  showMenu?: boolean;
  showAddress?: boolean;
  showPhone?: boolean;
  showSocials?: boolean;
}) {
  const hours = hoursSummary?.trim();
  const addr = address?.trim() || city?.trim();
  const tel = phone?.trim();

  const menuControl =
    menuHref?.trim() ? (
      <a
        href={menuHref.trim()}
        target="_blank"
        rel="noopener noreferrer"
        className="zg-showroom-quick-link inline-flex items-center gap-1.5"
      >
        <UtensilsCrossed className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
        {menuLabel}
      </a>
    ) : onMenuClick ? (
      <button type="button" onClick={onMenuClick} className="zg-showroom-quick-link inline-flex items-center gap-1.5">
        <UtensilsCrossed className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
        {menuLabel}
      </button>
    ) : null;

  const socials: { href: string; label: string; icon: typeof Instagram }[] = [];
  if (showSocials) {
    if (instagramUrl?.trim()) socials.push({ href: instagramUrl.trim(), label: "Instagram", icon: Instagram });
    if (facebookUrl?.trim()) socials.push({ href: facebookUrl.trim(), label: "Facebook", icon: Facebook });
    if (tiktokUrl?.trim()) socials.push({ href: tiktokUrl.trim(), label: "TikTok", icon: Globe });
    if (websiteUrl?.trim()) socials.push({ href: websiteUrl.trim(), label: "Site web", icon: Globe });
  }

  const hasContent =
    (showHours && hours) ||
    (showMenu && menuControl) ||
    (showAddress && addr) ||
    (showPhone && tel) ||
    socials.length > 0 ||
    googleMapsUrl?.trim();

  if (!hasContent) return null;

  return (
    <section className="zg-showroom-quick-info scroll-mt-0 px-5 py-4 sm:px-6">
      <div className="mx-auto max-w-lg space-y-3 sm:max-w-xl md:max-w-2xl">
        {showHours && hours ? (
          <p className="flex items-start gap-2 text-[13px] leading-snug opacity-75" style={{ color: "var(--body-text)" }}>
            <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 opacity-60" aria-hidden />
            <span>{hours}</span>
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {showMenu && menuControl ? menuControl : null}
          {showAddress && addr ? (
            googleMapsUrl?.trim() ? (
              <a
                href={googleMapsUrl.trim()}
                target="_blank"
                rel="noopener noreferrer"
                className="zg-showroom-quick-link inline-flex items-center gap-1.5"
              >
                <MapPin className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
                <span className="max-w-[200px] truncate">{addr}</span>
              </a>
            ) : (
              <span
                className="inline-flex items-center gap-1.5 text-[13px] opacity-70"
                style={{ color: "var(--body-text)" }}
              >
                <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
                <span className="max-w-[200px] truncate">{addr}</span>
              </span>
            )
          ) : null}
          {showPhone && tel ? (
            <a href={`tel:${tel.replace(/\s/g, "")}`} className="zg-showroom-quick-link inline-flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
              {tel}
            </a>
          ) : null}
        </div>

        {socials.length > 0 ? (
          <div className={cn("flex flex-wrap gap-2 pt-0.5")}>
            {socials.map((s) => {
              const Icon = s.icon;
              return (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--body-text)_12%,transparent)] transition hover:border-[color-mix(in_srgb,var(--accent-color)_40%,transparent)]"
                  aria-label={s.label}
                >
                  <Icon className="h-3.5 w-3.5" style={{ color: "var(--accent-color)" }} />
                </a>
              );
            })}
          </div>
        ) : null}
      </div>
    </section>
  );
}
