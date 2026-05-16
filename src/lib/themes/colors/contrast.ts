export type Rgb = { r: number; g: number; b: number };

export function parseHex(hex: string): Rgb | null {
  const n = hex.trim().replace("#", "");
  if (n.length !== 6) return null;
  const r = Number.parseInt(n.slice(0, 2), 16);
  const g = Number.parseInt(n.slice(2, 4), 16);
  const b = Number.parseInt(n.slice(4, 6), 16);
  if ([r, g, b].some((x) => Number.isNaN(x))) return null;
  return { r, g, b };
}

export function relativeLuminance(c: Rgb): number {
  const srgb = [c.r, c.g, c.b].map((v) => {
    const x = v / 255;
    return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * srgb[0]! + 0.7152 * srgb[1]! + 0.0722 * srgb[2]!;
}

/** Rapport de contraste WCAG entre deux couleurs (1–21). */
export function contrastRatio(foregroundHex: string, backgroundHex: string): number | null {
  const fg = parseHex(foregroundHex);
  const bg = parseHex(backgroundHex);
  if (!fg || !bg) return null;
  const l1 = relativeLuminance(fg);
  const l2 = relativeLuminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function meetsContrastAA(
  foregroundHex: string,
  backgroundHex: string,
  minRatio = 4.5,
): boolean {
  const ratio = contrastRatio(foregroundHex, backgroundHex);
  return ratio !== null && ratio >= minRatio;
}

/** Texte lisible sur bouton rempli accent (même logique que css-vars). */
export function contrastButtonText(accentHex: string): string {
  const rgb = parseHex(accentHex);
  if (!rgb) return "#0A0A0A";
  return relativeLuminance(rgb) > 0.55 ? "#1a1208" : "#faf7f2";
}

export function buttonLabelContrastRatio(accentHex: string): number | null {
  return contrastRatio(contrastButtonText(accentHex), accentHex);
}

export type AccentAccessibilityReport = {
  accentOnBgRatio: number | null;
  accentOnBgPassesUi: boolean;
  buttonLabelRatio: number | null;
  buttonLabelPasses: boolean;
};

export function evaluateAccentAccessibility(accentHex: string, pageBgHex: string): AccentAccessibilityReport {
  const accentOnBgRatio = contrastRatio(accentHex, pageBgHex);
  const buttonLabelRatio = buttonLabelContrastRatio(accentHex);
  return {
    accentOnBgRatio,
    accentOnBgPassesUi: accentOnBgRatio !== null && accentOnBgRatio >= 3,
    buttonLabelRatio,
    buttonLabelPasses: buttonLabelRatio !== null && buttonLabelRatio >= 4.5,
  };
}
