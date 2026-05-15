import type { DesignTokens, ThemeDefinition } from "@/src/lib/themes/types";

export const premiumDarkDesignTokens: DesignTokens = {
  colors: {
    bg: "#0A0A0A",
    bgElevated: "#141414",
    surface: "#1C1C1C",
    accent: "#D4AF7A",
    accentMuted: "#8B7355",
    text: "#F5F1EA",
    textMuted: "#A8A29E",
    border: "rgba(245, 241, 234, 0.08)",
  },
  fonts: {
    display: "var(--font-cormorant)",
    script: "var(--font-dancing)",
    body: "var(--font-inter)",
  },
  spacing: {
    sectionY: "clamp(6rem, 12vw, 12rem)",
    containerX: "clamp(1.5rem, 5vw, 6rem)",
  },
  radius: {
    sm: "4px",
    md: "8px",
    pill: "999px",
  },
  effects: {
    grain: true,
    vignette: true,
    imageOverlay: "linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.75) 100%)",
  },
};

export const premiumDarkTheme: ThemeDefinition = {
  id: "premium-dark",
  name: "Premium Dark",
  description: "Ambiance gastronomique cinématographique — sombre, or, typographie éditoriale.",
  previewImage: "/themes/premium-dark/preview.svg",
  tokens: premiumDarkDesignTokens,
};
