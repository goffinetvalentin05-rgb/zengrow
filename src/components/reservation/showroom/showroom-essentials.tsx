"use client";

import { Clock, MapPin } from "lucide-react";

export function ShowroomEssentials({
  address,
  openingHoursLines,
  googleMapsUrl,
  menuHref,
  menuLabel,
}: {
  address?: string | null;
  openingHoursLines: string[];
  googleMapsUrl?: string | null;
  menuHref?: string | null;
  menuLabel?: string;
}) {
  const hasAddress = Boolean(address?.trim());
  const hasHours = openingHoursLines.length > 0;
  const hasMap = Boolean(googleMapsUrl?.trim());
  const hasMenu = Boolean(menuHref?.trim());

  if (!hasAddress && !hasHours && !hasMap && !hasMenu) return null;

  return (
    <section
      id="infos"
      className="scroll-mt-20 py-20 sm:py-28"
    >
      <div className="mx-auto max-w-md space-y-8 px-4 sm:px-6">
        <p
          className="text-center text-[10px] font-semibold uppercase tracking-[0.32em]"
          style={{ color: "var(--accent-color)" }}
        >
          Infos pratiques
        </p>

        {hasAddress ? (
          <div className="flex gap-3 text-center sm:text-left">
            <MapPin className="mx-auto h-4 w-4 shrink-0 opacity-50 sm:mx-0" style={{ color: "var(--accent-color)" }} />
            <p className="flex-1 text-sm leading-relaxed opacity-85" style={{ color: "var(--body-text)" }}>
              {address!.trim()}
            </p>
          </div>
        ) : null}

        {hasHours ? (
          <div className="flex gap-3">
            <Clock className="mx-auto h-4 w-4 shrink-0 opacity-50 sm:mx-0" style={{ color: "var(--accent-color)" }} />
            <ul className="flex-1 space-y-0.5 text-center text-sm opacity-85 sm:text-left" style={{ color: "var(--body-text)" }}>
              {openingHoursLines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-center gap-6 pt-2 text-sm font-medium">
          {hasMap ? (
            <a
              href={googleMapsUrl!}
              target="_blank"
              rel="noopener noreferrer"
              className="underline-offset-4 hover:underline"
              style={{ color: "var(--accent-color)" }}
            >
              Itinéraire
            </a>
          ) : null}
          {hasMenu ? (
            <a
              href={menuHref!}
              target="_blank"
              rel="noopener noreferrer"
              className="underline-offset-4 hover:underline"
              style={{ color: "var(--accent-color)" }}
            >
              {menuLabel?.trim() || "Carte"}
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}
