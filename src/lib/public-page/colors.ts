/** Relative luminance (sRGB) for contrast decisions. */
function luminance(hex: string): number {
  const h = hex.replace("#", "");
  if (h.length !== 6) return 0.5;
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

export function normalizeHexColor(input: string, fallback = "#1F7A6C"): string {
  const t = input.trim();
  if (/^#[0-9A-Fa-f]{6}$/.test(t)) return t;
  if (/^#[0-9A-Fa-f]{3}$/.test(t)) {
    const r = t[1];
    const g = t[2];
    const b = t[3];
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return fallback;
}

export function contrastingTextColor(bgHex: string): string {
  return luminance(normalizeHexColor(bgHex)) > 0.55 ? "#0f172a" : "#ffffff";
}

export function applyStylePresetColors(
  preset: "elegant" | "modern" | "warm" | null,
  primary: string,
  secondary: string,
): {
  heroPrimary: string;
  accent: string;
  buttonBg: string;
  pageBg: string;
  headingFont: string;
  bodyFont: string;
  heroHeight: "compact" | "normal" | "tall";
} {
  const p = normalizeHexColor(primary);
  const s = normalizeHexColor(secondary, p);

  if (preset === "elegant") {
    return {
      heroPrimary: p,
      accent: s,
      buttonBg: p,
      pageBg: "#faf9f7",
      headingFont: "Playfair Display",
      bodyFont: "Inter",
      heroHeight: "normal",
    };
  }
  if (preset === "warm") {
    return {
      heroPrimary: p,
      accent: s,
      buttonBg: s,
      pageBg: "#fffaf5",
      headingFont: "DM Serif Display",
      bodyFont: "Source Sans 3",
      heroHeight: "compact",
    };
  }
  if (preset === "modern") {
    return {
      heroPrimary: p,
      accent: s,
      buttonBg: p,
      pageBg: "#f8fafc",
      headingFont: "Inter",
      bodyFont: "Inter",
      heroHeight: "compact",
    };
  }

  return {
    heroPrimary: p,
    accent: s,
    buttonBg: p,
    pageBg: "#f8fafc",
    headingFont: "Playfair Display",
    bodyFont: "Inter",
    heroHeight: "normal",
  };
}

export const DEFAULT_PRIMARY = "#1F7A6C";
export const DEFAULT_SECONDARY = "#E85D2C";
