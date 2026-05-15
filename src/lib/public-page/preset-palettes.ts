import type { PublicStylePreset } from "@/src/lib/public-page/constants";
import type { ThemeMode } from "@/src/lib/public-page/editor-config";
import { DEFAULT_PRIMARY, DEFAULT_SECONDARY, normalizeHexColor, contrastingTextColor } from "@/src/lib/public-page/colors";

export type PresetPalette = {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  headingColor: string;
  footerBgColor: string;
  footerTextColor: string;
  buttonTextColor: string;
  headingFont: string;
  bodyFont: string;
  themeMode: ThemeMode;
  heroHeight: "compact" | "normal" | "tall";
};

export function applyStylePresetPalette(
  preset: PublicStylePreset | null,
  primary: string,
  secondary: string,
): PresetPalette {
  const p = normalizeHexColor(primary);
  const s = normalizeHexColor(secondary, p);

  if (preset === "premium_dark") {
    const bg = "#0c0f14";
    const surface = "#151a22";
    const footer = "#11151c";
    return {
      primaryColor: p,
      secondaryColor: s,
      accentColor: s,
      backgroundColor: bg,
      surfaceColor: surface,
      textColor: "#cbd5e1",
      headingColor: "#f8fafc",
      footerBgColor: footer,
      footerTextColor: "#e2e8f0",
      buttonTextColor: contrastingTextColor(s),
      headingFont: "Playfair Display",
      bodyFont: "Inter",
      themeMode: "dark",
      heroHeight: "tall",
    };
  }

  if (preset === "minimal") {
    return {
      primaryColor: p,
      secondaryColor: s,
      accentColor: p,
      backgroundColor: "#ffffff",
      surfaceColor: "#f4f4f5",
      textColor: "#27272a",
      headingColor: "#09090b",
      footerBgColor: "#fafafa",
      footerTextColor: "#3f3f46",
      buttonTextColor: contrastingTextColor(p),
      headingFont: "Inter",
      bodyFont: "Inter",
      themeMode: "light",
      heroHeight: "compact",
    };
  }

  if (preset === "elegant") {
    return {
      primaryColor: p,
      secondaryColor: s,
      accentColor: p,
      backgroundColor: "#faf9f7",
      surfaceColor: "#f3f1ed",
      textColor: "#334155",
      headingColor: "#1e293b",
      footerBgColor: "#1e293b",
      footerTextColor: "#f1f5f9",
      buttonTextColor: contrastingTextColor(p),
      headingFont: "Playfair Display",
      bodyFont: "Inter",
      themeMode: "light",
      heroHeight: "normal",
    };
  }

  if (preset === "warm") {
    return {
      primaryColor: p,
      secondaryColor: s,
      accentColor: s,
      backgroundColor: "#fffaf5",
      surfaceColor: "#fff1e6",
      textColor: "#44403c",
      headingColor: "#292524",
      footerBgColor: "#292524",
      footerTextColor: "#fafaf9",
      buttonTextColor: contrastingTextColor(s),
      headingFont: "DM Serif Display",
      bodyFont: "Source Sans 3",
      themeMode: "light",
      heroHeight: "compact",
    };
  }

  if (preset === "modern") {
    return {
      primaryColor: p,
      secondaryColor: s,
      accentColor: p,
      backgroundColor: "#f8fafc",
      surfaceColor: "#f1f5f9",
      textColor: "#334155",
      headingColor: "#0f172a",
      footerBgColor: "#0f172a",
      footerTextColor: "#e2e8f0",
      buttonTextColor: contrastingTextColor(p),
      headingFont: "Inter",
      bodyFont: "Inter",
      themeMode: "light",
      heroHeight: "compact",
    };
  }

  return {
    primaryColor: p,
    secondaryColor: s,
    accentColor: p,
    backgroundColor: "#f8fafc",
    surfaceColor: "#f1f5f9",
    textColor: "#334155",
    headingColor: "#0f172a",
    footerBgColor: "#1e293b",
    footerTextColor: "#e2e8f0",
    buttonTextColor: contrastingTextColor(p),
    headingFont: "Playfair Display",
    bodyFont: "Inter",
    themeMode: "light",
    heroHeight: "normal",
  };
}
