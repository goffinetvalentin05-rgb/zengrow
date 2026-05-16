import type { FontRole } from "@/src/lib/themes/fonts/catalog";
import type { FontCatalogEntry } from "@/src/lib/themes/fonts/catalog";
import { getFontCatalogEntry } from "@/src/lib/themes/fonts/catalog";

export type ThemeFontCatalog = Record<FontRole, FontCatalogEntry[]>;

export const PREMIUM_ELEGANT_FONT_DEFAULTS: Record<FontRole, string> = {
  display: "cormorant",
  body: "inter",
  script: "dancing",
};

function pick(keys: string[]): FontCatalogEntry[] {
  return keys.map((k) => getFontCatalogEntry(k)).filter((e): e is FontCatalogEntry => Boolean(e));
}

export const PREMIUM_ELEGANT_FONTS: ThemeFontCatalog = {
  display: pick(["cormorant", "playfair", "dm-serif", "lora"]),
  body: pick(["inter", "manrope", "work-sans"]),
  script: pick(["dancing", "allura", "great-vibes"]),
};
