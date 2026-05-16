import type { DesignTokens } from "@/src/lib/themes/types";
import { contrastButtonText, parseHex, relativeLuminance } from "@/src/lib/themes/colors/contrast";

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

export { contrastButtonText };
