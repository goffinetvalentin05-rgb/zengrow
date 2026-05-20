"use client";

import { Clock, Mail, MapPin, Phone, Globe, Instagram, Facebook } from "lucide-react";
import { cn } from "@/src/lib/utils";

/** Infos pratiques — adresse, horaires, contact, réseaux */
export function ShowroomPractical({
  address,
  phone,
  email,
  websiteUrl,
  openingHoursLines,
  googleMapsUrl,
  instagramUrl,
  facebookUrl,
  showAddress,
  showPhone,
  showEmail,
  showWebsite,
  showHours,
  showInstagram,
  showFacebook,
  directionsLabel = "Itinéraire",
}: {
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  websiteUrl?: string | null;
  openingHoursLines: string[];
  googleMapsUrl?: string | null;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  showAddress?: boolean;
  showPhone?: boolean;
  showEmail?: boolean;
  showWebsite?: boolean;
  showHours?: boolean;
  showInstagram?: boolean;
  showFacebook?: boolean;
  directionsLabel?: string;
}) {
  const rows: { icon: typeof MapPin; label: string; href?: string; content: React.ReactNode }[] = [];

  if (showAddress && address?.trim()) {
    rows.push({
      icon: MapPin,
      label: "Adresse",
      content: (
        <span className="text-[14px] leading-relaxed opacity-85" style={{ color: "var(--body-text)" }}>
          {address.trim()}
        </span>
      ),
    });
  }

  if (showHours && openingHoursLines.length > 0) {
    rows.push({
      icon: Clock,
      label: "Horaires",
      content: (
        <ul className="space-y-0.5 text-[14px] leading-relaxed opacity-85" style={{ color: "var(--body-text)" }}>
          {openingHoursLines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      ),
    });
  }

  if (showPhone && phone?.trim()) {
    rows.push({
      icon: Phone,
      label: "Téléphone",
      href: `tel:${phone.replace(/\s/g, "")}`,
      content: (
        <span className="text-[14px] font-medium" style={{ color: "var(--accent-color)" }}>
          {phone.trim()}
        </span>
      ),
    });
  }

  if (showEmail && email?.trim()) {
    rows.push({
      icon: Mail,
      label: "E-mail",
      href: `mailto:${email.trim()}`,
      content: (
        <span className="text-[14px] font-medium" style={{ color: "var(--accent-color)" }}>
          {email.trim()}
        </span>
      ),
    });
  }

  if (showWebsite && websiteUrl?.trim()) {
    rows.push({
      icon: Globe,
      label: "Site web",
      href: websiteUrl.trim(),
      content: (
        <span className="text-[14px] font-medium" style={{ color: "var(--accent-color)" }}>
          {websiteUrl.trim().replace(/^https?:\/\//, "")}
        </span>
      ),
    });
  }

  const socials: { href: string; icon: typeof Instagram; label: string }[] = [];
  if (showInstagram && instagramUrl?.trim()) {
    socials.push({ href: instagramUrl.trim(), icon: Instagram, label: "Instagram" });
  }
  if (showFacebook && facebookUrl?.trim()) {
    socials.push({ href: facebookUrl.trim(), icon: Facebook, label: "Facebook" });
  }

  if (rows.length === 0 && socials.length === 0 && !googleMapsUrl?.trim()) return null;

  return (
    <section id="infos" className="zg-showroom-practical scroll-mt-0 border-t border-[color-mix(in_srgb,var(--body-text)_6%,transparent)] py-14 sm:py-20">
      <div className="mx-auto max-w-lg px-5 sm:max-w-xl sm:px-6">
        <header className="mb-8">
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.32em]"
            style={{ color: "var(--accent-color)" }}
          >
            Infos pratiques
          </p>
          <h2
            className="mt-3 text-xl font-medium leading-tight sm:text-2xl"
            style={{ fontFamily: "var(--heading-font)", color: "var(--heading-color)" }}
          >
            Nous trouver
          </h2>
        </header>

        <ul className="flex flex-col gap-5">
          {rows.map((row) => {
            const Icon = row.icon;
            const inner = (
              <div className="flex gap-4">
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[color-mix(in_srgb,var(--accent-color)_18%,transparent)] bg-[color-mix(in_srgb,var(--accent-color)_5%,transparent)]"
                  aria-hidden
                >
                  <Icon className="h-4 w-4" style={{ color: "var(--accent-color)" }} />
                </span>
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] opacity-45" style={{ color: "var(--body-text)" }}>
                    {row.label}
                  </p>
                  <div className="mt-1">{row.content}</div>
                </div>
              </div>
            );
            return (
              <li key={row.label}>
                {row.href ? (
                  <a href={row.href} target={row.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="block transition hover:opacity-90">
                    {inner}
                  </a>
                ) : (
                  inner
                )}
              </li>
            );
          })}
        </ul>

        <div className={cn("mt-8 flex flex-wrap items-center gap-3", rows.length === 0 && "mt-0")}>
          {googleMapsUrl?.trim() ? (
            <a
              href={googleMapsUrl.trim()}
              target="_blank"
              rel="noopener noreferrer"
              className="zg-showroom-btn-secondary inline-flex min-h-[44px] items-center justify-center px-5 text-[12px] font-semibold tracking-wide"
            >
              {directionsLabel}
            </a>
          ) : null}
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
      </div>
    </section>
  );
}
