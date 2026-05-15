import type { ThemeColorOverrides, ThemeId } from "@/src/lib/themes/types";
import { mergeDesignTokens } from "@/src/lib/themes/merge-overrides";
import { designTokensToCssVars } from "@/src/lib/themes/css-vars";
import { getThemeDefinition, normalizeThemeId } from "@/src/lib/themes/registry";

function isHexLike(v: unknown): v is string {
  return typeof v === "string" && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v.trim());
}

export function parseThemeOverrides(raw: unknown): ThemeColorOverrides {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  const colorsRaw = o.colors;
  if (!colorsRaw || typeof colorsRaw !== "object") return {};
  const c = colorsRaw as Record<string, unknown>;
  const colors: ThemeColorOverrides["colors"] = {};
  if (isHexLike(c.accent)) colors.accent = c.accent.trim();
  if (isHexLike(c.bg)) colors.bg = c.bg.trim();
  if (isHexLike(c.bgElevated)) colors.bgElevated = c.bgElevated.trim();
  if (isHexLike(c.text)) colors.text = c.text.trim();
  if (isHexLike(c.textMuted)) colors.textMuted = c.textMuted.trim();
  return Object.keys(colors).length ? { colors } : {};
}

export type ResolvedPublicTheme = {
  id: ThemeId;
  cssVarOverrides: Record<string, string> | undefined;
  showGrain: boolean;
  showVignette: boolean;
  isPremiumLayout: boolean;
};

export function resolvePublicTheme(
  themeIdRaw: string | null | undefined,
  overridesRaw: unknown,
): ResolvedPublicTheme {
  const id = normalizeThemeId(themeIdRaw);
  const base = getThemeDefinition(id);
  const overrides = parseThemeOverrides(overridesRaw);
  const mergedTokens = mergeDesignTokens(base.tokens, overrides);

  if (id === "default") {
    return {
      id: "default",
      cssVarOverrides: undefined,
      showGrain: false,
      showVignette: false,
      isPremiumLayout: false,
    };
  }

  const cssVarOverrides = designTokensToCssVars(mergedTokens);
  return {
    id,
    cssVarOverrides,
    showGrain: mergedTokens.effects.grain,
    showVignette: mergedTokens.effects.vignette,
    isPremiumLayout: true,
  };
}
