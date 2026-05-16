import type { ThemeId } from "@/src/lib/themes/types";
import { getThemeDefinition } from "@/src/lib/themes/registry";
import { evaluateAccentAccessibility, meetsContrastAA, type AccentAccessibilityReport } from "@/src/lib/themes/colors/contrast";

export type AccentPreset = {
  id: string;
  label: string;
  hex: string;
  description?: string;
};

const PREMIUM_DARK_PRESETS: AccentPreset[] = [
  { id: "gold", label: "Or classique", hex: "#D4AF7A", description: "Défaut du thème" },
  { id: "champagne", label: "Champagne", hex: "#E8C89A" },
  { id: "copper", label: "Cuivre", hex: "#C49A6C" },
  { id: "rose-gold", label: "Or rose", hex: "#D9A088" },
  { id: "sage", label: "Sauge", hex: "#9BB896" },
  { id: "pearl", label: "Perle", hex: "#C8B8A8" },
];

const PREMIUM_ELEGANT_PRESETS: AccentPreset[] = [
  { id: "warm-gold", label: "Or chaud", hex: "#B8956C", description: "Défaut du thème" },
  { id: "honey", label: "Miel", hex: "#C9A06E" },
  { id: "terracotta", label: "Terracotta", hex: "#B87D5E" },
  { id: "olive", label: "Olive", hex: "#8A9A6B" },
  { id: "dusty-rose", label: "Rose poudré", hex: "#C4928A" },
  { id: "slate-blue", label: "Bleu ardoise", hex: "#7A8FA3" },
];

const DEFAULT_PRESETS: AccentPreset[] = [
  { id: "teal", label: "Sarcelle", hex: "#1F7A6C", description: "Défaut" },
  { id: "forest", label: "Forêt", hex: "#2D6A4F" },
  { id: "wine", label: "Bordeaux", hex: "#8B3A3A" },
  { id: "navy", label: "Marine", hex: "#2C4A6E" },
  { id: "amber", label: "Ambre", hex: "#B45309" },
  { id: "plum", label: "Prune", hex: "#6B4C7A" },
];

const PRESETS_BY_THEME: Partial<Record<ThemeId, AccentPreset[]>> = {
  default: DEFAULT_PRESETS,
  "premium-dark": PREMIUM_DARK_PRESETS,
  "premium-elegant": PREMIUM_ELEGANT_PRESETS,
};

export function getAccentPresetsForTheme(themeId: ThemeId): AccentPreset[] {
  return PRESETS_BY_THEME[themeId] ?? DEFAULT_PRESETS;
}

export function resolvePageBackgroundHex(themeId: ThemeId, bgOverride?: string | null): string {
  if (bgOverride && /^#[0-9a-fA-F]{6}$/.test(bgOverride.trim())) return bgOverride.trim();
  return getThemeDefinition(themeId).tokens.colors.bg;
}

export function presetsWithAccessibility(
  themeId: ThemeId,
  pageBgHex: string,
): (AccentPreset & { report: AccentAccessibilityReport; recommended: boolean })[] {
  const presets = getAccentPresetsForTheme(themeId);
  return presets.map((preset) => {
    const report = evaluateAccentAccessibility(preset.hex, pageBgHex);
    const recommended = report.accentOnBgPassesUi && report.buttonLabelPasses;
    return { ...preset, report, recommended };
  });
}

export function isCustomAccentAccessible(accentHex: string, pageBgHex: string): boolean {
  const report = evaluateAccentAccessibility(accentHex, pageBgHex);
  return report.accentOnBgPassesUi && report.buttonLabelPasses;
}

export function filterPresetsForBg(themeId: ThemeId, pageBgHex: string): AccentPreset[] {
  return getAccentPresetsForTheme(themeId).filter((p) => meetsContrastAA(p.hex, pageBgHex, 3));
}
