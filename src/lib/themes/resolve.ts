import { mergeDesignTokens } from "@/src/lib/themes/merge-overrides";
import { designTokensToCssVars } from "@/src/lib/themes/css-vars";
import { resolveThemeFonts } from "@/src/lib/themes/fonts/resolve";
import { getThemeDefinition, normalizeThemeId } from "@/src/lib/themes/registry";
import type { FontRole } from "@/src/lib/themes/fonts/catalog";
import type { ThemeId, ThemeOverrides } from "@/src/lib/themes/types";

function isHexLike(v: unknown): v is string {
  return typeof v === "string" && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v.trim());
}

const FONT_ROLES: FontRole[] = ["display", "body", "script"];

function parseFontOverrides(raw: unknown): ThemeOverrides["fonts"] {
  if (!raw || typeof raw !== "object") return undefined;
  const o = raw as Record<string, unknown>;
  const fonts: NonNullable<ThemeOverrides["fonts"]> = {};
  for (const role of FONT_ROLES) {
    const v = o[role];
    if (typeof v === "string" && v.trim()) fonts[role] = v.trim();
  }
  return Object.keys(fonts).length ? fonts : undefined;
}

export function parseThemeOverrides(raw: unknown): ThemeOverrides {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;

  const colorsRaw = o.colors;
  let colors: ThemeOverrides["colors"];
  if (colorsRaw && typeof colorsRaw === "object") {
    const c = colorsRaw as Record<string, unknown>;
    colors = {};
    if (isHexLike(c.accent)) colors.accent = c.accent.trim();
    if (isHexLike(c.bg)) colors.bg = c.bg.trim();
    if (isHexLike(c.bgElevated)) colors.bgElevated = c.bgElevated.trim();
    if (isHexLike(c.text)) colors.text = c.text.trim();
    if (isHexLike(c.textMuted)) colors.textMuted = c.textMuted.trim();
    if (!Object.keys(colors).length) colors = undefined;
  }

  const fonts = parseFontOverrides(o.fonts);

  const out: ThemeOverrides = {};
  if (colors) out.colors = colors;
  if (fonts) out.fonts = fonts;
  return out;
}

export type ResolvedPublicTheme = {
  id: ThemeId;
  cssVarOverrides: Record<string, string> | undefined;
  /** URL Google Fonts pour polices non préchargées dans le layout. */
  googleFontsUrl: string | null;
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
  const resolvedFonts = resolveThemeFonts(id, overrides.fonts);
  const mergedTokens = mergeDesignTokens(base.tokens, overrides, resolvedFonts);

  const isShowroomTheme =
    id !== "default" &&
    (id === "premium-dark" ||
      id === "premium-elegant" ||
      id === "elegant-light" ||
      id === "social-bold" ||
      id === "minimal-chic");

  if (id === "default" && !overrides.colors && !overrides.fonts) {
    return {
      id: "default",
      cssVarOverrides: undefined,
      googleFontsUrl: resolvedFonts.googleFontsUrl,
      showGrain: false,
      showVignette: false,
      isPremiumLayout: false,
    };
  }

  const cssVarOverrides = {
    ...designTokensToCssVars(mergedTokens),
    ...resolvedFonts.cssVarDefinitions,
  };

  return {
    id,
    cssVarOverrides,
    googleFontsUrl: resolvedFonts.googleFontsUrl,
    showGrain: mergedTokens.effects.grain,
    showVignette: mergedTokens.effects.vignette,
    isPremiumLayout: isShowroomTheme || id !== "default",
  };
}
