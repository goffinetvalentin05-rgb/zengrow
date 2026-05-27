import type { ThemeDefinition, ThemeId } from "@/src/lib/themes/types";
import { defaultTheme } from "@/src/lib/themes/default/tokens";
import { premiumDarkTheme } from "@/src/lib/themes/premium-dark/tokens";
import { premiumElegantTheme } from "@/src/lib/themes/premium-elegant/tokens";
import { elegantLightTheme } from "@/src/lib/themes/elegant-light/tokens";
import { socialBoldTheme } from "@/src/lib/themes/social-bold/tokens";
import { minimalChicTheme } from "@/src/lib/themes/minimal-chic/tokens";

export const THEME_REGISTRY: Record<ThemeId, ThemeDefinition> = {
  default: defaultTheme,
  "premium-dark": premiumDarkTheme,
  "premium-elegant": premiumElegantTheme,
  "elegant-light": elegantLightTheme,
  "social-bold": socialBoldTheme,
  "minimal-chic": minimalChicTheme,
};

const LEGACY_THEME_ALIASES: Record<string, ThemeId> = {
  "premium-elegant": "elegant-light",
  default: "elegant-light",
};

/** Thèmes proposés dans l’éditeur Showroom (sans legacy). */
export const SHOWROOM_THEME_IDS: ThemeId[] = [
  "premium-dark",
  "elegant-light",
  "social-bold",
  "minimal-chic",
];

export function listShowroomThemes(): ThemeDefinition[] {
  return SHOWROOM_THEME_IDS.map((id) => THEME_REGISTRY[id]);
}

export function normalizeThemeId(raw: string | null | undefined): ThemeId {
  if (!raw || raw === "") return "premium-dark";
  if (raw in THEME_REGISTRY) return raw as ThemeId;
  const aliased = LEGACY_THEME_ALIASES[raw];
  if (aliased) return aliased;
  return "premium-dark";
}

export function listThemes(): ThemeDefinition[] {
  return Object.values(THEME_REGISTRY);
}

export function getThemeDefinition(id: string | null | undefined): ThemeDefinition {
  return THEME_REGISTRY[normalizeThemeId(id)] ?? defaultTheme;
}
