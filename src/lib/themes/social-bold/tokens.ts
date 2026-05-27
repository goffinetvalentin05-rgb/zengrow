import type { DesignTokens, ThemeDefinition } from "@/src/lib/themes/types";

export const socialBoldDesignTokens: DesignTokens = {
  colors: {
    bg: "#0C0A12",
    bgElevated: "#16131F",
    surface: "#1E1A28",
    accent: "#FF6B4A",
    accentMuted: "#7C5CFF",
    text: "#FAFAFA",
    textMuted: "#A1A1AA",
    border: "rgba(250, 250, 250, 0.1)",
  },
  fonts: {
    display: "var(--font-inter)",
    script: "var(--font-dancing)",
    body: "var(--font-inter)",
  },
  spacing: {
    sectionY: "clamp(4.5rem, 10vw, 9rem)",
    containerX: "clamp(1.25rem, 4vw, 4rem)",
  },
  radius: {
    sm: "8px",
    md: "16px",
    pill: "999px",
  },
  effects: {
    grain: false,
    vignette: true,
    imageOverlay: "linear-gradient(180deg, rgba(12,10,18,0.15) 0%, rgba(12,10,18,0.82) 100%)",
  },
};

export const socialBoldTheme: ThemeDefinition = {
  id: "social-bold",
  name: "Social Bold",
  description: "Moderne et percutant — optimisé pour les réseaux sociaux.",
  previewImage: "/themes/social-bold/preview.webp",
  tokens: socialBoldDesignTokens,
};
