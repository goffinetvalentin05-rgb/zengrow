import { contrastButtonText, contrastRatio, meetsContrastAA } from "@/src/lib/themes/colors/contrast";
import type { StorefrontConfig } from "@/src/lib/public-storefront/schema";

export type StorefrontContrastWarning = {
  id: string;
  message: string;
};

export function storefrontContrastWarnings(config: StorefrontConfig): StorefrontContrastWarning[] {
  const warnings: StorefrontContrastWarning[] = [];
  const { textColor, mutedTextColor, backgroundColor, primaryColor, accentColor } = config.style;

  if (!meetsContrastAA(textColor, backgroundColor, 4.5)) {
    warnings.push({
      id: "text-on-bg",
      message: "Le texte principal et le fond contrastent trop peu. Visez au moins 4,5:1.",
    });
  }
  if (!meetsContrastAA(mutedTextColor, backgroundColor, 3)) {
    warnings.push({
      id: "muted-on-bg",
      message: "Le texte secondaire risque d’être difficile à lire.",
    });
  }

  const buttonText = contrastButtonText(primaryColor);
  if (!meetsContrastAA(buttonText, primaryColor, 4.5)) {
    warnings.push({
      id: "button-label",
      message: "Le texte des boutons risque d’être illisible sur la couleur principale.",
    });
  }

  const accentRatio = contrastRatio(accentColor, backgroundColor);
  if (accentRatio != null && accentRatio < 3) {
    warnings.push({
      id: "accent-on-bg",
      message: "La couleur d’accent se distingue peu du fond.",
    });
  }

  return warnings;
}

export function storefrontButtonTextColor(primaryColor: string): string {
  return contrastButtonText(primaryColor);
}
