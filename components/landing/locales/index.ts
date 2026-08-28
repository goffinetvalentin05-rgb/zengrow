import { en } from "./en";
import { fr } from "./fr";
import type { LandingDictionary, Locale } from "./types";

export type { LandingDictionary, Locale };

export const DEFAULT_LOCALE: Locale = "fr";

export const dictionaries: Record<Locale, LandingDictionary> = {
  fr,
  en,
};

export function getDictionary(locale: Locale): LandingDictionary {
  return dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];
}
