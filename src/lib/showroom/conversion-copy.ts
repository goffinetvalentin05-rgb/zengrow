import type { OpeningHours } from "@/src/lib/utils";
import {
  resolveShowroomAvailability,
  type ShowroomAvailability,
} from "@/src/lib/public-page/showroom-availability";

const DEFAULT_CTA_REASSURANCE = "Réservation en moins de 30 secondes";

/** Phrase émotionnelle — vend un moment, pas une fiche descriptive */
export function resolveShowroomHook(input: {
  description?: string | null;
  tagline?: string | null;
  heroSubtitle?: string | null;
  cuisineType?: string | null;
  city?: string | null;
}): string | null {
  const candidates = [
    input.heroSubtitle?.trim(),
    input.description?.trim(),
    input.tagline?.trim(),
  ].filter(Boolean) as string[];

  for (const text of candidates) {
    if (text.length > 140) continue;
    if (looksAdministrative(text)) continue;
    return text;
  }

  const cuisine = input.cuisineType?.trim();
  const city = input.city?.trim();
  if (cuisine && city) {
    return `Une table, une ambiance, un moment à partager à ${city}.`;
  }
  if (city) {
    return `Réservez votre prochaine soirée en quelques secondes.`;
  }
  return null;
}

/** Sous-titre type « Cuisine italienne à Lausanne » */
export function resolveShowroomMetaLine(cuisineType?: string | null, city?: string | null): string | null {
  const cuisine = cuisineType?.trim();
  const cityName = city?.trim();
  if (cuisine && cityName) {
    const c = cuisine.charAt(0).toUpperCase() + cuisine.slice(1);
    if (/cuisine/i.test(c)) return `${c} à ${cityName}`;
    return `${c} à ${cityName}`;
  }
  return [cuisine, cityName].filter(Boolean).join(" · ") || null;
}

export function resolveCtaReassurance(preBookingMessage?: string | null): string {
  const msg = preBookingMessage?.trim();
  if (msg && msg.length <= 72 && !msg.includes("\n")) {
    return msg;
  }
  return DEFAULT_CTA_REASSURANCE;
}

export function resolveShowroomAvailabilityDisplay(input: {
  openingHours?: OpeningHours | null;
  reservationEnabled?: boolean;
}): ShowroomAvailability | null {
  return resolveShowroomAvailability(input.openingHours, {
    reservationEnabled: input.reservationEnabled,
  });
}

function looksAdministrative(text: string): boolean {
  const lower = text.toLowerCase();
  return (
    lower.includes("lundi") ||
    lower.includes("mardi") ||
    lower.includes("horaires") ||
    lower.includes("©") ||
    text.length > 160
  );
}
