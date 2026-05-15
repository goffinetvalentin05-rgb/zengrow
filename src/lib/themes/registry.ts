import type { ThemeDefinition, ThemeId } from "@/src/lib/themes/types";
import { defaultTheme } from "@/src/lib/themes/default/tokens";
import { premiumDarkTheme } from "@/src/lib/themes/premium-dark/tokens";
import { premiumElegantTheme } from "@/src/lib/themes/premium-elegant/tokens";

export const THEME_REGISTRY: Record<ThemeId, ThemeDefinition> = {
  default: defaultTheme,
  "premium-dark": premiumDarkTheme,
  "premium-elegant": premiumElegantTheme,
};

export function normalizeThemeId(raw: string | null | undefined): ThemeId {
  if (!raw || raw === "") return "default";
  if (raw in THEME_REGISTRY) return raw as ThemeId;
  return "default";
}

export function listThemes(): ThemeDefinition[] {
  return Object.values(THEME_REGISTRY);
}

export function getThemeDefinition(id: string | null | undefined): ThemeDefinition {
  return THEME_REGISTRY[normalizeThemeId(id)] ?? defaultTheme;
}
