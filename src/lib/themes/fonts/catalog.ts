/** Rôle typographique sur la page publique premium. */
export type FontRole = "display" | "body" | "script";

export type FontCatalogEntry = {
  key: string;
  name: string;
  cssVar: string;
  googleFamily: string;
  stack: string;
  /** Déjà chargée via next/font dans `app/layout.tsx`. */
  preloaded?: boolean;
};

const entries: FontCatalogEntry[] = [
  {
    key: "cormorant",
    name: "Cormorant Garamond",
    cssVar: "--font-cormorant",
    googleFamily: "Cormorant Garamond",
    stack: "Georgia, serif",
    preloaded: true,
  },
  {
    key: "instrument-serif",
    name: "Instrument Serif",
    cssVar: "--font-instrument-serif",
    googleFamily: "Instrument Serif",
    stack: "Georgia, serif",
    preloaded: true,
  },
  {
    key: "playfair",
    name: "Playfair Display",
    cssVar: "--font-playfair",
    googleFamily: "Playfair Display",
    stack: "Georgia, serif",
  },
  {
    key: "lora",
    name: "Lora",
    cssVar: "--font-lora",
    googleFamily: "Lora",
    stack: "Georgia, serif",
  },
  {
    key: "dm-serif",
    name: "DM Serif Display",
    cssVar: "--font-dm-serif",
    googleFamily: "DM Serif Display",
    stack: "Georgia, serif",
  },
  {
    key: "inter",
    name: "Inter",
    cssVar: "--font-inter",
    googleFamily: "Inter",
    stack: "system-ui, sans-serif",
    preloaded: true,
  },
  {
    key: "manrope",
    name: "Manrope",
    cssVar: "--font-manrope",
    googleFamily: "Manrope",
    stack: "system-ui, sans-serif",
  },
  {
    key: "work-sans",
    name: "Work Sans",
    cssVar: "--font-work-sans",
    googleFamily: "Work Sans",
    stack: "system-ui, sans-serif",
  },
  {
    key: "dancing",
    name: "Dancing Script",
    cssVar: "--font-dancing",
    googleFamily: "Dancing Script",
    stack: "cursive",
    preloaded: true,
  },
  {
    key: "allura",
    name: "Allura",
    cssVar: "--font-allura",
    googleFamily: "Allura",
    stack: "cursive",
  },
  {
    key: "great-vibes",
    name: "Great Vibes",
    cssVar: "--font-great-vibes",
    googleFamily: "Great Vibes",
    stack: "cursive",
  },
];

export const FONT_CATALOG: Record<string, FontCatalogEntry> = Object.fromEntries(
  entries.map((e) => [e.key, e]),
);

export function getFontCatalogEntry(key: string): FontCatalogEntry | undefined {
  return FONT_CATALOG[key];
}

/** Définit la pile CSS pour une entrée (var + fallbacks). */
export function fontFamilyValue(entry: FontCatalogEntry): string {
  return `var(${entry.cssVar}, ${entry.googleFamily}, ${entry.stack})`;
}
