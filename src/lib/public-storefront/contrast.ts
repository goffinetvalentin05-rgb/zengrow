import { contrastButtonText, contrastRatio, meetsContrastAA } from "@/src/lib/themes/colors/contrast";
import type { StorefrontConfig } from "@/src/lib/public-storefront/schema";

export type StorefrontContrastWarning = {
  id: string;
  message: string;
};

export function storefrontContrastWarnings(config: StorefrontConfig): StorefrontContrastWarning[] {
  const warnings: StorefrontContrastWarning[] = [];
  const { textColor, backgroundColor, primaryColor } = config.style;
  const textRatio = contrastRatio(textColor, backgroundColor);

  if (!meetsContrastAA(textColor, backgroundColor, 4.5)) {
    warnings.push({
      id: "text-on-bg",
      message: `Le texte et le fond contrastent trop peu${textRatio ? ` (${textRatio.toFixed(1)}:1)` : ""}. Visez au moins 4,5:1.`,
    });
  }

  const buttonText = contrastButtonText(primaryColor);
  if (!meetsContrastAA(buttonText, primaryColor, 4.5)) {
    warnings.push({
      id: "button-label",
      message: "Le texte des boutons risque d’être illisible sur la couleur principale.",
    });
  }

  const accentRatio = contrastRatio(primaryColor, backgroundColor);
  if (accentRatio != null && accentRatio < 3) {
    warnings.push({
      id: "accent-on-bg",
      message: "La couleur principale se distingue peu du fond. Les boutons et liens seront difficiles à voir.",
    });
  }

  return warnings;
}

export function storefrontButtonTextColor(primaryColor: string): string {
  return contrastButtonText(primaryColor);
}
