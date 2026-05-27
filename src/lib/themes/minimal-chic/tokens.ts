import type { DesignTokens, ThemeDefinition } from "@/src/lib/themes/types";

export const minimalChicDesignTokens: DesignTokens = {
  colors: {
    bg: "#FFFFFF",
    bgElevated: "#FAFAFA",
    surface: "#F5F5F4",
    accent: "#1C1917",
    accentMuted: "#78716C",
    text: "#1C1917",
    textMuted: "#78716C",
    border: "rgba(28, 25, 23, 0.06)",
  },
  fonts: {
    display: "var(--font-inter)",
    script: "var(--font-inter)",
    body: "var(--font-inter)",
  },
  spacing: {
    sectionY: "clamp(3.5rem, 8vw, 7rem)",
    containerX: "clamp(1.25rem, 4vw, 4rem)",
  },
  radius: {
    sm: "6px",
    md: "12px",
    pill: "999px",
  },
  effects: {
    grain: false,
    vignette: false,
    imageOverlay: "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(28,25,23,0.45) 100%)",
  },
};

export const minimalChicTheme: ThemeDefinition = {
  id: "minimal-chic",
  name: "Minimal Chic",
  description: "Épuré et efficace — conversion pure sans fioritures.",
  previewImage: "/themes/minimal-chic/preview.webp",
  tokens: minimalChicDesignTokens,
};
