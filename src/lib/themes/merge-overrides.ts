import type { DesignTokens, ThemeColorOverrides } from "@/src/lib/themes/types";

export function mergeDesignTokens(base: DesignTokens, overrides: ThemeColorOverrides): DesignTokens {
  const nextColors = { ...base.colors };
  const oc = overrides.colors;
  if (oc?.bg) nextColors.bg = oc.bg;
  if (oc?.bgElevated) nextColors.bgElevated = oc.bgElevated;
  if (oc?.accent) nextColors.accent = oc.accent;
  if (oc?.text) nextColors.text = oc.text;
  if (oc?.textMuted) nextColors.textMuted = oc.textMuted;
  return { ...base, colors: nextColors };
}
