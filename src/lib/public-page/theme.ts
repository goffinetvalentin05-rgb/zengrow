import type { PageBlockId, PublicPageEditorConfig, SectionVariant, ThemeMode } from "@/src/lib/public-page/editor-config";
import { normalizeHexColor, contrastingTextColor } from "@/src/lib/public-page/colors";

export type SectionSurface = {
  backgroundColor: string;
  color: string;
  headingColor: string;
  borderColor: string;
  width: "full" | "contained";
  paddingY: string;
};

export type PublicPageTheme = {
  mode: ThemeMode;
  cssVars: Record<string, string>;
  pageBg: string;
  headingColor: string;
  bodyColor: string;
  accentColor: string;
  footerBg: string;
  footerText: string;
  section: (blockId: PageBlockId) => SectionSurface;
};

function mix(hex: string, pct: number, base = "#ffffff"): string {
  return `color-mix(in srgb, ${hex} ${pct}%, ${base})`;
}

function resolveMode(config: PublicPageEditorConfig): "light" | "dark" {
  const m = config.appearance.themeMode;
  if (m === "dark") return "dark";
  if (m === "light") return "light";
  const bg = normalizeHexColor(config.appearance.backgroundColor);
  const lum =
    parseInt(bg.slice(1, 3), 16) * 0.299 +
    parseInt(bg.slice(3, 5), 16) * 0.587 +
    parseInt(bg.slice(5, 7), 16) * 0.114;
  return lum < 140 ? "dark" : "light";
}

function variantColors(
  variant: SectionVariant,
  pageBg: string,
  heading: string,
  body: string,
  accent: string,
  surface: string,
  footerBg: string,
  footerText: string,
  mode: "light" | "dark",
): Pick<SectionSurface, "backgroundColor" | "color" | "headingColor" | "borderColor"> {
  switch (variant) {
    case "transparent":
      return {
        backgroundColor: "transparent",
        color: body,
        headingColor: heading,
        borderColor: mix(body, 12, pageBg),
      };
    case "light":
      return {
        backgroundColor: mode === "dark" ? mix(body, 8, pageBg) : mix(body, 3, "#ffffff"),
        color: mode === "dark" ? heading : body,
        headingColor: heading,
        borderColor: mix(body, 14, pageBg),
      };
    case "dark":
      return {
        backgroundColor: mode === "dark" ? mix(heading, 6, pageBg) : mix(body, 88, "#0f172a"),
        color: mode === "dark" ? heading : "#f1f5f9",
        headingColor: mode === "dark" ? heading : "#ffffff",
        borderColor: mix(footerText, 18, footerBg),
      };
    case "muted":
      return {
        backgroundColor: surface,
        color: body,
        headingColor: heading,
        borderColor: mix(body, 10, pageBg),
      };
    case "accent":
      return {
        backgroundColor: mix(accent, mode === "dark" ? 18 : 10, pageBg),
        color: body,
        headingColor: heading,
        borderColor: mix(accent, 28, pageBg),
      };
    case "elevated":
      return {
        backgroundColor: mode === "dark" ? mix(heading, 5, pageBg) : mix(body, 2.5, "#ffffff"),
        color: body,
        headingColor: heading,
        borderColor: mix(body, 12, pageBg),
      };
    case "primary":
      return {
        backgroundColor: accent,
        color: contrastingTextColor(accent),
        headingColor: contrastingTextColor(accent),
        borderColor: mix(contrastingTextColor(accent), 20, accent),
      };
    case "inherit":
    default:
      return {
        backgroundColor: pageBg,
        color: body,
        headingColor: heading,
        borderColor: mix(body, 10, pageBg),
      };
  }
}

const DEFAULT_BLOCK_VARIANT: Partial<Record<PageBlockId, SectionVariant>> = {
  trust: "muted",
  reservation: "elevated",
  gallery: "muted",
  about: "inherit",
  highlights: "muted",
  menu: "elevated",
  hours: "muted",
  location: "dark",
  reviews: "elevated",
  social: "muted",
  gift_vouchers: "elevated",
  final_cta: "accent",
};

export function resolvePublicPageTheme(config: PublicPageEditorConfig): PublicPageTheme {
  const a = config.appearance;
  const mode = resolveMode(config);
  const pageBg = normalizeHexColor(a.backgroundColor);
  const heading = normalizeHexColor(a.headingColor || a.textColor);
  const body = normalizeHexColor(a.textColor);
  const accent = normalizeHexColor(a.accentColor);
  const surface = normalizeHexColor(a.surfaceColor || (mode === "dark" ? mix(heading, 6, pageBg) : mix(body, 4, pageBg)));
  const footerBg = normalizeHexColor(a.footerBgColor);
  const footerText = normalizeHexColor(a.footerTextColor);

  const section = (blockId: PageBlockId): SectionSurface => {
    const block = config.blocks[blockId];
    const variant =
      block?.variant && block.variant !== "inherit"
        ? block.variant
        : DEFAULT_BLOCK_VARIANT[blockId] ?? "inherit";
    const width = block?.width ?? (blockId === "trust" || blockId === "final_cta" ? "full" : "contained");
    const colors = variantColors(variant, pageBg, heading, body, accent, surface, footerBg, footerText, mode);
    return {
      ...colors,
      width,
      paddingY:
        blockId === "trust"
          ? "py-7"
          : blockId === "final_cta"
            ? "py-16 sm:py-20"
            : blockId === "gift_vouchers"
              ? "py-20 sm:py-28"
              : "py-14 sm:py-16",
    };
  };

  return {
    mode,
    pageBg,
    headingColor: heading,
    bodyColor: body,
    accentColor: accent,
    footerBg,
    footerText,
    cssVars: {
      "--page-bg": pageBg,
      "--surface-muted": surface,
      "--hero-primary": normalizeHexColor(a.primaryColor),
      "--accent-color": accent,
      "--button-bg": normalizeHexColor(a.accentColor),
      "--button-text": normalizeHexColor(a.buttonTextColor),
      "--heading-color": heading,
      "--body-text": body,
      "--footer-bg": footerBg,
      "--footer-text": footerText,
    },
    section,
  };
}
