import type { PublicAmbiance } from "@/src/lib/public-page/constants";

const AMBIANCE_LABELS: Record<PublicAmbiance, string> = {
  gastronomic: "gastronomique",
  family: "familiale",
  bistro: "de bistro",
  italian: "italienne",
  asian: "asiatique",
  cafe_brunch: "café & brunch",
  bar_lounge: "bar & lounge",
  other: "chaleureuse",
};

export function defaultHeroTitle(restaurantName: string): string {
  const name = restaurantName.trim() || "votre restaurant";
  return `Réservez votre table chez ${name}`;
}

export function defaultHeroSubtitle(cuisineType: string, city: string, ambiance?: PublicAmbiance | null): string {
  const cuisine = cuisineType.trim() || "soignée";
  const ville = city.trim() || "votre quartier";
  const amb = ambiance ? AMBIANCE_LABELS[ambiance] : "chaleureuse";
  return `Une cuisine ${cuisine} à ${ville}, dans une ambiance ${amb}.`;
}

export function effectiveHeroTitle(custom: string, restaurantName: string): string {
  const t = custom.trim();
  return t || defaultHeroTitle(restaurantName);
}

export function effectiveHeroSubtitle(
  custom: string,
  cuisineType: string,
  city: string,
  ambiance?: PublicAmbiance | null,
): string {
  const t = custom.trim();
  return t || defaultHeroSubtitle(cuisineType, city, ambiance);
}

export type PublicationChecklist = {
  hasName: boolean;
  hasAddress: boolean;
  hasHeroPhoto: boolean;
  hasHours: boolean;
  hasReservation: boolean;
};

export function computeCompletionPercent(check: PublicationChecklist): number {
  const weights = [
    check.hasName ? 25 : 0,
    check.hasAddress ? 25 : 0,
    check.hasHeroPhoto ? 25 : 0,
    (check.hasHours ? 12.5 : 0) + (check.hasReservation ? 12.5 : 0),
  ];
  return Math.round(weights.reduce((a, b) => a + b, 0));
}

export function publicationChecklist(check: PublicationChecklist): { label: string; done: boolean }[] {
  return [
    { label: "Nom du restaurant ajouté", done: check.hasName },
    { label: "Adresse ajoutée", done: check.hasAddress },
    { label: "Photo principale ajoutée", done: check.hasHeroPhoto },
    { label: "Horaires ajoutés", done: check.hasHours },
    { label: "Réservation configurée", done: check.hasReservation },
  ];
}
