import type { DesignTokens, ThemeDefinition } from "@/src/lib/themes/types";

export const premiumElegantDesignTokens: DesignTokens = {
  colors: {
    bg: "#FAF7F2",
    bgElevated: "#FFFFFF",
    surface: "#F3EEE6",
    accent: "#B8956C",
    accentMuted: "#8B7355",
    text: "#1C1917",
    textMuted: "#57534E",
    border: "rgba(28, 25, 23, 0.08)",
  },
  fonts: {
    display: "var(--font-cormorant)",
    script: "var(--font-dancing)",
    body: "var(--font-inter)",
  },
  spacing: {
    sectionY: "clamp(5rem, 11vw, 10rem)",
    containerX: "clamp(1.5rem, 5vw, 5rem)",
  },
  radius: {
    sm: "4px",
    md: "10px",
    pill: "999px",
  },
  effects: {
    grain: false,
    vignette: true,
    imageOverlay: "linear-gradient(180deg, rgba(0,0,0,0.06) 0%, rgba(28,25,23,0.28) 100%)",
  },
};

export const premiumElegantTheme: ThemeDefinition = {
  id: "premium-elegant",
  name: "Premium Elegant",
  description: "Luxe clair — ivoire chaud, accents dorés, mise en page aérée.",
  previewImage: "/themes/premium-elegant/preview.webp",
  tokens: premiumElegantDesignTokens,
};
