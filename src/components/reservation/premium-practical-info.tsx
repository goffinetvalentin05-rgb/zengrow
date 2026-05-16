"use client";

import {
  ChevronRight,
  Clock,
  Facebook,
  Globe,
  Instagram,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import type { PracticalSectionCopy } from "@/src/lib/public-page/page-sections";
import {
  practicalSectionHasVisibleContent,
  resolvePracticalDisplay,
  type PracticalSectionDisplay,
} from "@/src/lib/public-page/section-display";

export function PremiumPracticalInfo({
  address,
  phone,
  email,
  websiteUrl,
  openingHoursLines,
  googleMapsUrl,
  parking,
  accessibility,
  instagramUrl,
  facebookUrl,
  tiktokUrl,
  copy,
  display: displayPatch,
}: {
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  websiteUrl?: string | null;
  openingHoursLines: string[];
  googleMapsUrl?: string | null;
  parking?: string;
  accessibility?: string;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  tiktokUrl?: string | null;
  copy: PracticalSectionCopy;
  display?: Partial<PracticalSectionDisplay>;
}) {
  const display = resolvePracticalDisplay(displayPatch);
  const showAddress = display.showAddress && Boolean(address?.trim());
  const showPhone = display.showPhone && Boolean(phone?.trim());
  const showEmail = display.showEmail && Boolean(email?.trim());
  const showWebsite = display.showWebsite && Boolean(websiteUrl?.trim());
  const showHours = display.showHours && openingHoursLines.length > 0;
  const showParking = display.showParking && Boolean(parking?.trim());
  const showAccessibility = display.showAccessibility && Boolean(accessibility?.trim());
  const showDirections =
    display.showDirections && Boolean(googleMapsUrl?.trim()) && showAddress;
  const showInstagram = display.showInstagram && Boolean(instagramUrl?.trim());
  const showFacebook = display.showFacebook && Boolean(facebookUrl?.trim());
  const showTiktok = display.showTiktok && Boolean(tiktokUrl?.trim());
  const showSocialBar =
    display.showSocialBar && (showInstagram || showFacebook || showTiktok);

  if (
    !practicalSectionHasVisibleContent({
      display,
      eyebrow: copy.eyebrow,
      title: copy.title,
      address,
      phone,
      email,
      websiteUrl,
      openingHoursLines,
      googleMapsUrl,
      parking,
      accessibility,
      instagramUrl,
      facebookUrl,
      tiktokUrl,
    })
  ) {
    return null;
  }

  const showHeader =
    (display.showEyebrow && Boolean(copy.eyebrow?.trim())) ||
    (display.showSectionTitle && Boolean(copy.title?.trim()));

  const hasGrid =
    showAddress ||
    showPhone ||
    showEmail ||
    showWebsite ||
    showHours ||
    showParking ||
    showAccessibility;

  return (
    <section
      id="infos"
      className="scroll-mt-24 border-t border-[color-mix(in_srgb,var(--body-text)_12%,transparent)]"
      style={{
        backgroundColor: "var(--page-bg)",
      }}
    >
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:px-12 lg:py-28">
        {showHeader ? (
          <div className="max-w-2xl">
            {display.showEyebrow && copy.eyebrow?.trim() ? (
              <div className="flex items-center gap-3">
                <span
                  className="h-px w-10"
                  style={{
                    backgroundColor: "color-mix(in srgb, var(--accent-color) 60%, transparent)",
                  }}
                  aria-hidden
                />
                <p
                  className="text-[10px] font-semibold uppercase tracking-[0.32em]"
                  style={{ color: "var(--accent-color)" }}
                >
                  {copy.eyebrow}
                </p>
              </div>
            ) : null}
            {display.showSectionTitle && copy.title?.trim() ? (
              <h2
                className={cn(
                  "text-4xl font-medium leading-[1.05] sm:text-5xl",
                  display.showEyebrow && copy.eyebrow?.trim() ? "mt-5" : "mt-0",
                )}
                style={{
                  fontFamily: "var(--heading-font)",
                  color: "var(--heading-color)",
                  letterSpacing: "-0.015em",
                }}
              >
                {copy.title}
              </h2>
            ) : null}
          </div>
        ) : null}

        {hasGrid ? (
          <div
            className={cn(
              "grid gap-10 md:grid-cols-2 lg:grid-cols-3 lg:gap-12",
              showHeader ? "mt-10" : "mt-0",
            )}
          >
            {showAddress ? (
              <div id="contact" className="flex flex-col gap-3">
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: "color-mix(in srgb, var(--accent-color) 12%, transparent)",
                    color: "var(--accent-color)",
                  }}
                >
                  <MapPin className="h-5 w-5" />
                </span>
                <p
                  className="text-[11px] font-semibold uppercase tracking-[0.22em] opacity-60"
                  style={{ color: "var(--heading-color)" }}
                >
                  {copy.labelAddress}
                </p>
                <p
                  className="text-base leading-relaxed"
                  style={{ color: "var(--heading-color)", fontFamily: "var(--heading-font)" }}
                >
                  {address}
                </p>
                {showDirections ? (
                  <a
                    href={googleMapsUrl!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-semibold uppercase tracking-[0.18em] underline-offset-4 hover:underline"
                    style={{ color: "var(--accent-color)" }}
                  >
                    {copy.directionsLabel}
                    <ChevronRight className="h-4 w-4" />
                  </a>
                ) : null}
              </div>
            ) : null}
            {showPhone ? (
              <div className="flex flex-col gap-3">
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: "color-mix(in srgb, var(--accent-color) 12%, transparent)",
                    color: "var(--accent-color)",
                  }}
                >
                  <Phone className="h-5 w-5" />
                </span>
                <p
                  className="text-[11px] font-semibold uppercase tracking-[0.22em] opacity-60"
                  style={{ color: "var(--heading-color)" }}
                >
                  {copy.labelPhone}
                </p>
                <a
                  href={`tel:${phone!.replace(/\s/g, "")}`}
                  className="text-base font-medium"
                  style={{ color: "var(--heading-color)", fontFamily: "var(--heading-font)" }}
                >
                  {phone}
                </a>
              </div>
            ) : null}
            {showEmail ? (
              <div className="flex flex-col gap-3">
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: "color-mix(in srgb, var(--accent-color) 12%, transparent)",
                    color: "var(--accent-color)",
                  }}
                >
                  <Mail className="h-5 w-5" />
                </span>
                <p
                  className="text-[11px] font-semibold uppercase tracking-[0.22em] opacity-60"
                  style={{ color: "var(--heading-color)" }}
                >
                  E-mail
                </p>
                <a
                  href={`mailto:${email!.trim()}`}
                  className="break-all text-base font-medium"
                  style={{ color: "var(--heading-color)", fontFamily: "var(--heading-font)" }}
                >
                  {email}
                </a>
              </div>
            ) : null}
            {showWebsite ? (
              <div className="flex flex-col gap-3">
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: "color-mix(in srgb, var(--accent-color) 12%, transparent)",
                    color: "var(--accent-color)",
                  }}
                >
                  <Globe className="h-5 w-5" />
                </span>
                <p
                  className="text-[11px] font-semibold uppercase tracking-[0.22em] opacity-60"
                  style={{ color: "var(--heading-color)" }}
                >
                  Site web
                </p>
                <a
                  href={websiteUrl!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all text-base font-medium underline-offset-4 hover:underline"
                  style={{ color: "var(--accent-color)" }}
                >
                  {websiteUrl}
                </a>
              </div>
            ) : null}
            {showHours ? (
              <div className="flex flex-col gap-3">
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: "color-mix(in srgb, var(--accent-color) 12%, transparent)",
                    color: "var(--accent-color)",
                  }}
                >
                  <Clock className="h-5 w-5" />
                </span>
                <p
                  className="text-[11px] font-semibold uppercase tracking-[0.22em] opacity-60"
                  style={{ color: "var(--heading-color)" }}
                >
                  {copy.labelHours}
                </p>
                <ul className="space-y-1 text-sm leading-relaxed" style={{ color: "var(--body-text)" }}>
                  {openingHoursLines.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {showParking ? (
              <div className="flex flex-col gap-3">
                <p
                  className="text-[11px] font-semibold uppercase tracking-[0.22em] opacity-60"
                  style={{ color: "var(--heading-color)" }}
                >
                  {copy.labelParking}
                </p>
                <p className="text-sm leading-relaxed" style={{ color: "var(--body-text)" }}>
                  {parking}
                </p>
              </div>
            ) : null}
            {showAccessibility ? (
              <div className="flex flex-col gap-3">
                <p
                  className="text-[11px] font-semibold uppercase tracking-[0.22em] opacity-60"
                  style={{ color: "var(--heading-color)" }}
                >
                  {copy.labelAccessibility}
                </p>
                <p className="text-sm leading-relaxed" style={{ color: "var(--body-text)" }}>
                  {accessibility}
                </p>
              </div>
            ) : null}
          </div>
        ) : null}

        {showSocialBar ? (
          <div className={cn("flex justify-center gap-4", showHeader || hasGrid ? "mt-12" : "mt-0")}>
            {showInstagram ? (
              <a
                href={instagramUrl!}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="opacity-70 transition hover:opacity-100"
              >
                <Instagram className="h-6 w-6" />
              </a>
            ) : null}
            {showFacebook ? (
              <a
                href={facebookUrl!}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="opacity-70 transition hover:opacity-100"
              >
                <Facebook className="h-6 w-6" />
              </a>
            ) : null}
            {showTiktok ? (
              <a
                href={tiktokUrl!}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="text-sm font-semibold uppercase tracking-wider opacity-70 transition hover:opacity-100"
                style={{ color: "var(--heading-color)" }}
              >
                TikTok
              </a>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
