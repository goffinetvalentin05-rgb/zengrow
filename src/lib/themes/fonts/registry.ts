import type { ThemeId } from "@/src/lib/themes/types";
import {
  DEFAULT_THEME_FONT_DEFAULTS,
  DEFAULT_THEME_FONTS,
  type ThemeFontCatalog,
} from "@/src/lib/themes/default/fonts";
import {
  PREMIUM_DARK_FONT_DEFAULTS,
  PREMIUM_DARK_FONTS,
} from "@/src/lib/themes/premium-dark/fonts";
import {
  PREMIUM_ELEGANT_FONT_DEFAULTS,
  PREMIUM_ELEGANT_FONTS,
} from "@/src/lib/themes/premium-elegant/fonts";
import type { FontRole } from "@/src/lib/themes/fonts/catalog";

const CATALOGS: Record<ThemeId, ThemeFontCatalog> = {
  default: DEFAULT_THEME_FONTS,
  "premium-dark": PREMIUM_DARK_FONTS,
  "premium-elegant": PREMIUM_ELEGANT_FONTS,
  "elegant-light": PREMIUM_ELEGANT_FONTS,
  "social-bold": PREMIUM_DARK_FONTS,
  "minimal-chic": DEFAULT_THEME_FONTS,
};

const DEFAULTS: Record<ThemeId, Record<FontRole, string>> = {
  default: DEFAULT_THEME_FONT_DEFAULTS,
  "premium-dark": PREMIUM_DARK_FONT_DEFAULTS,
  "premium-elegant": PREMIUM_ELEGANT_FONT_DEFAULTS,
  "elegant-light": PREMIUM_ELEGANT_FONT_DEFAULTS,
  "social-bold": PREMIUM_DARK_FONT_DEFAULTS,
  "minimal-chic": DEFAULT_THEME_FONT_DEFAULTS,
};

export function getThemeFontCatalog(themeId: ThemeId): ThemeFontCatalog {
  return CATALOGS[themeId];
}

export function getThemeFontDefaults(themeId: ThemeId): Record<FontRole, string> {
  return DEFAULTS[themeId];
}

export function isFontKeyAllowedForTheme(themeId: ThemeId, role: FontRole, key: string): boolean {
  return getThemeFontCatalog(themeId)[role].some((f) => f.key === key);
}
