import type { DesignTokens, ThemeDefinition } from "@/src/lib/themes/types";

/**
 * Thème par défaut : valeurs neutres ; la page s’appuie surtout sur l’éditeur
 * (`PublicPageEditorConfig`) et les colonnes legacy du restaurant.
 */
export const defaultDesignTokens: DesignTokens = {
  colors: {
    bg: "#f8fafc",
    bgElevated: "#ffffff",
    surface: "#f1f5f9",
    accent: "#1F7A6C",
    accentMuted: "#64748b",
    text: "#0f172a",
    textMuted: "#475569",
    border: "rgba(15, 23, 42, 0.08)",
  },
  fonts: {
    display: "var(--font-instrument-serif, Georgia, serif)",
    script: "var(--font-dancing, cursive)",
    body: "var(--font-inter, system-ui, sans-serif)",
  },
  spacing: {
    sectionY: "clamp(4rem, 10vw, 8rem)",
    containerX: "clamp(1.25rem, 4vw, 3rem)",
  },
  radius: {
    sm: "4px",
    md: "12px",
    pill: "999px",
  },
  effects: {
    grain: false,
    vignette: false,
    imageOverlay: "linear-gradient(180deg, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.45) 100%)",
  },
};

export const defaultTheme: ThemeDefinition = {
  id: "default",
  name: "ZenGrow (défaut)",
  description: "Style actuel : couleurs et typo pilotés par l’éditeur de page.",
  previewImage: "/themes/default/preview.webp",
  tokens: defaultDesignTokens,
};
