import type { DesignTokens, ThemeOverrides } from "@/src/lib/themes/types";
import type { ResolvedThemeFonts } from "@/src/lib/themes/fonts/resolve";

export function mergeDesignTokens(
  base: DesignTokens,
  overrides: ThemeOverrides,
  resolvedFonts?: ResolvedThemeFonts,
): DesignTokens {
  const nextColors = { ...base.colors };
  const oc = overrides.colors;
  if (oc?.bg) nextColors.bg = oc.bg;
  if (oc?.bgElevated) nextColors.bgElevated = oc.bgElevated;
  if (oc?.accent) nextColors.accent = oc.accent;
  if (oc?.text) nextColors.text = oc.text;
  if (oc?.textMuted) nextColors.textMuted = oc.textMuted;

  const fonts = resolvedFonts?.fontTokens ?? base.fonts;

  return { ...base, colors: nextColors, fonts };
}
