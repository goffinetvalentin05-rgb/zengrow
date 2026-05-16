import type { FontCatalogEntry } from "@/src/lib/themes/fonts/catalog";

/**
 * URL Google Fonts CSS2 pour les familles à charger dynamiquement
 * (hors polices déjà injectées par next/font dans le layout racine).
 */
export function googleFontsUrlFromEntries(entries: FontCatalogEntry[]): string | null {
  const toLoad = entries.filter((e) => !e.preloaded);
  const families = Array.from(new Set(toLoad.map((e) => e.googleFamily)));
  if (families.length === 0) return null;

  const query = families
    .map((fam) => `family=${encodeURIComponent(fam).replace(/%20/g, "+")}:ital,wght@0,400;0,500;0,600;0,700;1,400`)
    .join("&");

  return `https://fonts.googleapis.com/css2?${query}&display=swap`;
}
