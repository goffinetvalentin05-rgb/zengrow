import type { OpeningHours } from "@/src/lib/utils";
import {
  resolveShowroomAvailability,
  type ShowroomAvailability,
} from "@/src/lib/public-page/showroom-availability";

const DEFAULT_CTA_REASSURANCE = "Confirmation rapide · choix de l'horaire en ligne";
const DEFAULT_ACTION_LINE =
  "Réservez votre table en quelques secondes, sans appel et sans attente.";

/** Promesse — ex. « Votre prochaine soirée italienne à Lausanne » */
export function resolveShowroomPromiseLine(
  cuisineType?: string | null,
  city?: string | null,
): string | null {
  const cuisine = normalizeCuisineAdjective(cuisineType);
  const cityName = city?.trim();

  if (cuisine && cityName) {
    return `Votre prochaine soirée ${cuisine} à ${cityName}`;
  }
  if (cityName) {
    return `Votre prochaine soirée à ${cityName}`;
  }
  if (cuisine) {
    return `Votre prochaine expérience ${cuisine}`;
  }
  return null;
}

/** Ligne d’action — pousse à réserver, pas à décrire le lieu */
export function resolveShowroomActionLine(input: {
  description?: string | null;
  tagline?: string | null;
  heroSubtitle?: string | null;
  city?: string | null;
}): string {
  const candidates = [
    input.heroSubtitle?.trim(),
    input.description?.trim(),
    input.tagline?.trim(),
  ].filter(Boolean) as string[];

  for (const text of candidates) {
    if (text.length > 160) continue;
    if (looksAdministrative(text)) continue;
    if (looksDescriptive(text) && !looksActionOriented(text)) continue;
    if (looksActionOriented(text) || !looksDescriptive(text)) {
      return text;
    }
  }

  const cityName = input.city?.trim();
  if (cityName) {
    return `Réservez votre prochaine soirée à ${cityName}, en quelques secondes.`;
  }
  return DEFAULT_ACTION_LINE;
}

export function resolveCtaReassurance(preBookingMessage?: string | null): string {
  const msg = preBookingMessage?.trim();
  if (msg && msg.length <= 88 && !msg.includes("\n")) {
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

/** @deprecated Utiliser resolveShowroomPromiseLine */
export function resolveShowroomMetaLine(cuisineType?: string | null, city?: string | null): string | null {
  return resolveShowroomPromiseLine(cuisineType, city);
}

/** @deprecated Utiliser resolveShowroomActionLine */
export function resolveShowroomHook(input: {
  description?: string | null;
  tagline?: string | null;
  heroSubtitle?: string | null;
  cuisineType?: string | null;
  city?: string | null;
}): string | null {
  return resolveShowroomActionLine(input);
}

function normalizeCuisineAdjective(raw?: string | null): string | null {
  const t = raw?.trim();
  if (!t) return null;
  let c = t.toLowerCase().replace(/^cuisine\s+/i, "").trim();

  const map: Record<string, string> = {
    italien: "italienne",
    italienne: "italienne",
    italian: "italienne",
    français: "française",
    francais: "française",
    française: "française",
    french: "française",
    japonais: "japonaise",
    japonaise: "japonaise",
    japanese: "japonaise",
    chinois: "chinoise",
    chinoise: "chinoise",
    chinese: "chinoise",
    thaï: "thaï",
    thai: "thaï",
    indien: "indienne",
    indienne: "indienne",
    indian: "indienne",
    mexicain: "mexicaine",
    mexicaine: "mexicaine",
    méditerranéen: "méditerranéenne",
    mediterraneen: "méditerranéenne",
    suisse: "suisse",
    burger: "burger",
    grill: "grill",
    pizza: "pizza",
    sushi: "sushi",
  };

  if (map[c]) return map[c];
  if (c.endsWith("e") || c.endsWith("a")) return c;
  if (/[sxz]$/.test(c)) return c;
  return `${c}e`;
}

function looksActionOriented(text: string): boolean {
  const lower = text.toLowerCase();
  return (
    lower.includes("réservez") ||
    lower.includes("reservez") ||
    lower.includes("réserver") ||
    lower.includes("reserver") ||
    lower.includes("sans appel") ||
    lower.includes("quelques secondes") ||
    lower.includes("confirmez") ||
    lower.includes("choisissez") ||
    lower.includes("votre table") ||
    lower.includes("en ligne")
  );
}

function looksDescriptive(text: string): boolean {
  const lower = text.toLowerCase();
  return (
    lower.includes("ambiance") ||
    lower.includes("bar &") ||
    lower.includes("bar et") ||
    lower.includes("dans une") ||
    lower.includes("au cœur") ||
    lower.includes("au coeur") ||
    lower.includes("nous vous") ||
    lower.includes("notre restaurant") ||
    lower.includes("établissement") ||
    (lower.includes("cuisine") && lower.includes("à ") && !looksActionOriented(text))
  );
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
