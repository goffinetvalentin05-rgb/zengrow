import type { FontRole } from "@/src/lib/themes/fonts/catalog";
import type { FontCatalogEntry } from "@/src/lib/themes/fonts/catalog";
import { getFontCatalogEntry } from "@/src/lib/themes/fonts/catalog";

export type ThemeFontCatalog = Record<FontRole, FontCatalogEntry[]>;

export const DEFAULT_THEME_FONT_DEFAULTS: Record<FontRole, string> = {
  display: "instrument-serif",
  body: "inter",
  script: "dancing",
};

function pick(keys: string[]): FontCatalogEntry[] {
  return keys.map((k) => getFontCatalogEntry(k)).filter((e): e is FontCatalogEntry => Boolean(e));
}

/** Liste courte : le thème défaut s’appuie aussi sur l’éditeur legacy pour heading/body. */
export const DEFAULT_THEME_FONTS: ThemeFontCatalog = {
  display: pick(["instrument-serif", "cormorant", "playfair", "dm-serif"]),
  body: pick(["inter", "manrope", "work-sans"]),
  script: pick(["dancing"]),
};
