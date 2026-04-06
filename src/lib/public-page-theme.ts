/** ZenGrow brand green — default accent when none configured */
export const DEFAULT_PUBLIC_ACCENT = "#15803d";

/** Default dark charcoal page background */
export const DEFAULT_PUBLIC_BACKGROUND = "#12151c";

type RGB = { r: number; g: number; b: number };

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

function hexToRgb(hex: string): RGB | null {
  const s = hex.trim().replace(/^#/, "");
  if (s.length === 3) {
    const r = parseInt(s[0] + s[0], 16);
    const g = parseInt(s[1] + s[1], 16);
    const b = parseInt(s[2] + s[2], 16);
    if ([r, g, b].some((x) => Number.isNaN(x))) return null;
    return { r, g, b };
  }
  if (s.length === 6) {
    const r = parseInt(s.slice(0, 2), 16);
    const g = parseInt(s.slice(2, 4), 16);
    const b = parseInt(s.slice(4, 6), 16);
    if ([r, g, b].some((x) => Number.isNaN(x))) return null;
    return { r, g, b };
  }
  return null;
}

function rgbToHex({ r, g, b }: RGB): string {
  const toByte = (n: number) =>
    Math.round(Math.min(255, Math.max(0, n)))
      .toString(16)
      .padStart(2, "0");
  return `#${toByte(r)}${toByte(g)}${toByte(b)}`;
}

/** sRGB relative luminance (WCAG), 0–1 */
export function relativeLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0.2;
  const linearize = (c: number) => {
    const cs = c / 255;
    return cs <= 0.03928 ? cs / 12.92 : ((cs + 0.055) / 1.055) ** 2.4;
  };
  const R = linearize(rgb.r);
  const G = linearize(rgb.g);
  const B = linearize(rgb.b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

/** Mix two hex colors (0 = all a, 1 = all b) */
export function mixHex(a: string, b: string, t: number): string {
  const ra = hexToRgb(a);
  const rb = hexToRgb(b);
  if (!ra || !rb) return a;
  const u = clamp01(t);
  return rgbToHex({
    r: ra.r + (rb.r - ra.r) * u,
    g: ra.g + (rb.g - ra.g) * u,
    b: ra.b + (rb.b - ra.b) * u,
  });
}

/**
 * Text color with sufficient contrast on the given background (light text on dark bg, dark on light).
 */
export function contrastTextForBackground(backgroundHex: string): string {
  const L = relativeLuminance(backgroundHex);
  return L > 0.45 ? "#1a1a1a" : "#f5f2eb";
}

/**
 * Text color on top of accent (e.g. CTA label).
 */
export function contrastTextOnAccent(accentHex: string): string {
  return relativeLuminance(accentHex) > 0.45 ? "#1a1a1a" : "#fafaf8";
}

export function normalizeHex(input: string | null | undefined, fallback: string): string {
  const t = input?.trim();
  if (!t) return fallback;
  const rgb = hexToRgb(t.startsWith("#") ? t : `#${t}`);
  return rgb ? (t.startsWith("#") ? t : `#${t}`) : fallback;
}

export type ResolvedPublicTheme = {
  background: string;
  accent: string;
  text: string;
  textMuted: string;
  onAccent: string;
  surface: string;
  surfaceBorder: string;
};

export function resolvePublicTheme(
  backgroundHex: string | null | undefined,
  accentHex: string | null | undefined,
  buttonHex?: string | null,
): ResolvedPublicTheme {
  const background = normalizeHex(backgroundHex, DEFAULT_PUBLIC_BACKGROUND);
  const accent = normalizeHex(buttonHex ?? accentHex, DEFAULT_PUBLIC_ACCENT);
  const text = contrastTextForBackground(background);
  const textMuted = mixHex(text, background, 0.38);
  const onAccent = contrastTextOnAccent(accent);
  const surface = mixHex(background, text, 0.07);
  const surfaceBorder = mixHex(background, text, 0.14);
  return { background, accent, text, textMuted, onAccent, surface, surfaceBorder };
}
