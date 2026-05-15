/** Relative luminance (sRGB) for contrast decisions. */
function luminance(hex: string): number {
  const h = hex.replace("#", "");
  if (h.length !== 6) return 0.5;
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

export function normalizeHexColor(input: string, fallback = "#1F7A6C"): string {
  const t = input.trim();
  if (/^#[0-9A-Fa-f]{6}$/.test(t)) return t;
  if (/^#[0-9A-Fa-f]{3}$/.test(t)) {
    const r = t[1];
    const g = t[2];
    const b = t[3];
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return fallback;
}

export function contrastingTextColor(bgHex: string): string {
  return luminance(normalizeHexColor(bgHex)) > 0.55 ? "#0f172a" : "#ffffff";
}

import type { PublicStylePreset } from "@/src/lib/public-page/constants";
import { applyStylePresetPalette } from "@/src/lib/public-page/preset-palettes";

export function applyStylePresetColors(
  preset: PublicStylePreset | null,
  primary: string,
  secondary: string,
): {
  heroPrimary: string;
  accent: string;
  buttonBg: string;
  pageBg: string;
  headingFont: string;
  bodyFont: string;
  heroHeight: "compact" | "normal" | "tall";
  headingColor: string;
  bodyColor: string;
  surfaceColor: string;
  footerBg: string;
  footerText: string;
  buttonText: string;
  themeMode: "light" | "dark" | "auto";
} {
  const palette = applyStylePresetPalette(preset, primary, secondary);
  return {
    heroPrimary: palette.primaryColor,
    accent: palette.accentColor,
    buttonBg: palette.accentColor,
    pageBg: palette.backgroundColor,
    headingFont: palette.headingFont,
    bodyFont: palette.bodyFont,
    heroHeight: palette.heroHeight,
    headingColor: palette.headingColor,
    bodyColor: palette.textColor,
    surfaceColor: palette.surfaceColor,
    footerBg: palette.footerBgColor,
    footerText: palette.footerTextColor,
    buttonText: palette.buttonTextColor,
    themeMode: palette.themeMode,
  };
}

export const DEFAULT_PRIMARY = "#1F7A6C";
export const DEFAULT_SECONDARY = "#E85D2C";
