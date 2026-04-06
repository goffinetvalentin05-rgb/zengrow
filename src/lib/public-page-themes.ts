export type PublicThemeKey = "moderne" | "classique" | "naturel" | "minimaliste";

export type PublicThemePreset = {
  key: PublicThemeKey;
  label: string;
  background: string;
  accent: string;
  text: string;
  headingFontVar: string;
  bodyFontVar: string;
};

export const PUBLIC_THEMES: Record<PublicThemeKey, PublicThemePreset> = {
  moderne: {
    key: "moderne",
    label: "Moderne",
    background: "#1a1a1a",
    accent: "#00e676",
    text: "#ffffff",
    headingFontVar: "--font-public-playfair",
    bodyFontVar: "--font-public-inter",
  },
  classique: {
    key: "classique",
    label: "Classique",
    background: "#faf6f0",
    accent: "#7b2d3e",
    text: "#2c1a0e",
    headingFontVar: "--font-public-cormorant",
    bodyFontVar: "--font-public-lato",
  },
  naturel: {
    key: "naturel",
    label: "Naturel",
    background: "#f2ede4",
    accent: "#c4613a",
    text: "#2e2a20",
    headingFontVar: "--font-public-merriweather",
    bodyFontVar: "--font-public-source-sans",
  },
  minimaliste: {
    key: "minimaliste",
    label: "Minimaliste",
    background: "#ffffff",
    accent: "#111111",
    text: "#222222",
    headingFontVar: "--font-public-dm-sans",
    bodyFontVar: "--font-public-dm-sans",
  },
};

export function normalizePublicThemeKey(value: string | null | undefined): PublicThemeKey {
  const v = (value ?? "").trim().toLowerCase();
  if (v === "classique" || v === "naturel" || v === "minimaliste") return v;
  return "moderne";
}

