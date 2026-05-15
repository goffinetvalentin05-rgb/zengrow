import type { DesignTokens } from "@/src/lib/themes/types";

/**
 * Mappe les tokens vers les variables CSS consommées par la page publique existante
 * (`PublicReservationForm`, `public-page-premium`) + extensions `--zg-*`.
 */
export function designTokensToCssVars(tokens: DesignTokens): Record<string, string> {
  const { colors, fonts, spacing, radius, effects } = tokens;
  return {
    "--page-bg": colors.bg,
    "--surface-muted": colors.surface,
    "--hero-primary": colors.bgElevated,
    "--accent-color": colors.accent,
    "--button-bg": colors.accent,
    "--button-text": contrastButtonText(colors.accent),
    "--heading-color": colors.text,
    "--body-text": colors.text,
    "--zg-text-muted": colors.textMuted,
    "--footer-bg": colors.bg,
    "--footer-text": colors.textMuted,
    "--heading-font": `${fonts.display}, ui-serif, Georgia, "Times New Roman", serif`,
    "--body-font": `${fonts.body}, system-ui, sans-serif`,
    "--radius": radius.md,
    "--zg-font-display": fonts.display,
    "--zg-font-script": fonts.script,
    "--zg-font-body": fonts.body,
    "--zg-border": colors.border,
    "--zg-section-y": spacing.sectionY,
    "--zg-container-x": spacing.containerX,
    "--zg-radius-sm": radius.sm,
    "--zg-radius-md": radius.md,
    "--zg-radius-pill": radius.pill,
    "--zg-image-overlay": effects.imageOverlay,
    "--zg-accent-muted": colors.accentMuted,
  };
}

/** Texte lisible sur bouton doré / accent (WCAG). */
function contrastButtonText(accentHex: string): string {
  const rgb = parseHex(accentHex);
  if (!rgb) return "#0A0A0A";
  const luminance = relativeLuminance(rgb);
  return luminance > 0.55 ? "#1a1208" : "#faf7f2";
}

function parseHex(hex: string): { r: number; g: number; b: number } | null {
  const n = hex.trim().replace("#", "");
  if (n.length === 6) {
    const r = Number.parseInt(n.slice(0, 2), 16);
    const g = Number.parseInt(n.slice(2, 4), 16);
    const b = Number.parseInt(n.slice(4, 6), 16);
    if ([r, g, b].some((x) => Number.isNaN(x))) return null;
    return { r, g, b };
  }
  return null;
}

function relativeLuminance(c: { r: number; g: number; b: number }): number {
  const srgb = [c.r, c.g, c.b].map((v) => {
    const x = v / 255;
    return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * srgb[0]! + 0.7152 * srgb[1]! + 0.0722 * srgb[2]!;
}
