import { z } from "zod";

export const STOREFRONT_SCHEMA_VERSION = 2 as const;

export const STOREFRONT_PRESETS = ["gastronomie", "spa", "cave", "hotel", "minimal"] as const;
export type StorefrontPresetId = (typeof STOREFRONT_PRESETS)[number];

export const FONT_PAIRING_IDS = ["gastronomie", "spa", "cave", "hotel", "modern"] as const;
export type FontPairingId = (typeof FONT_PAIRING_IDS)[number];

export const THEME_MODES = ["light", "dark"] as const;
export const BUTTON_FILLS = ["filled", "outline"] as const;
export const RADIUS_LEVELS = ["soft", "rounded", "pill"] as const;
export const SPACINGS = ["compact", "normal", "relaxed"] as const;
export const CONTENT_WIDTHS = ["narrow", "normal", "wide"] as const;
export const HERO_LAYOUTS = ["fullbleed", "split", "minimal", "immersive"] as const;
export const HERO_ALIGNS = ["left", "center"] as const;
export const COVER_HEIGHTS = ["compact", "normal", "immersive"] as const;
export const LOGO_SIZES = ["sm", "md", "lg"] as const;
export const HERO_BACKGROUNDS = ["image", "solid", "gradient"] as const;
export const HERO_FRAMES = ["fullscreen", "rounded"] as const;
export const HERO_CTA_STYLES = ["filled", "outline", "soft"] as const;
export const OFFER_CARD_STYLES = ["classic", "immersive", "horizontal", "minimal", "premium"] as const;
export const OFFER_IMAGE_RATIOS = ["16/10", "4/3", "1/1"] as const;
export const TITLE_SIZES = ["sm", "md", "lg"] as const;
export const OFFER_BUTTON_PRESETS = ["offrir", "decouvrir", "choisir", "custom"] as const;
export const OFFER_BUTTON_STYLES = ["filled", "outline", "subtle"] as const;
export const FOOTER_THEMES = ["light", "dark"] as const;
export const ICON_STYLES = ["plain", "circle", "rounded"] as const;
export const FOOTER_SPACINGS = ["compact", "comfortable"] as const;

export const MAX_CUSTOM_BUTTON_CHARS = 40;
export const MAX_TITLE = 120;
export const MAX_SUBTITLE = 280;

const hexColor = z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Couleur invalide.");
const optionalHex = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/)
  .or(z.literal(""))
  .transform((value) => value || "");

const unit = z.number().min(0).max(1);

const httpUrl = z
  .string()
  .max(2000)
  .refine((value) => value.length === 0 || isSafeHttpUrl(value), "URL non autorisée.")
  .transform((value) => (value.trim() ? value.trim() : ""));

export function isSafeHttpUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return true;
  try {
    const url = new URL(trimmed);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export const storefrontConfigSchema = z.object({
  schemaVersion: z.literal(STOREFRONT_SCHEMA_VERSION),
  presetId: z.enum(STOREFRONT_PRESETS).nullable(),
  style: z.object({
    primaryColor: hexColor,
    accentColor: hexColor,
    backgroundColor: hexColor,
    textColor: hexColor,
    mutedTextColor: hexColor,
    themeMode: z.enum(THEME_MODES),
    fontPairing: z.enum(FONT_PAIRING_IDS),
    buttonFill: z.enum(BUTTON_FILLS),
    radius: z.enum(RADIUS_LEVELS),
    spacing: z.enum(SPACINGS),
    contentWidth: z.enum(CONTENT_WIDTHS),
  }),
  hero: z.object({
    layout: z.enum(HERO_LAYOUTS),
    showLogo: z.boolean(),
    logoSize: z.enum(LOGO_SIZES),
    coverImageUrl: httpUrl,
    focalX: unit,
    focalY: unit,
    height: z.enum(COVER_HEIGHTS),
    title: z.string().max(MAX_TITLE),
    subtitle: z.string().max(MAX_SUBTITLE),
    align: z.enum(HERO_ALIGNS),
    textColor: optionalHex,
    overlayOpacity: z.number().int().min(0).max(80),
    ctaVisible: z.boolean(),
    ctaText: z.string().max(MAX_CUSTOM_BUTTON_CHARS),
    ctaStyle: z.enum(HERO_CTA_STYLES),
    background: z.enum(HERO_BACKGROUNDS),
    frame: z.enum(HERO_FRAMES),
    padding: z.enum(SPACINGS),
  }),
  offers: z.object({
    title: z.string().max(MAX_TITLE),
    subtitle: z.string().max(MAX_SUBTITLE),
    align: z.enum(HERO_ALIGNS),
    backgroundColor: optionalHex,
    paddingY: z.enum(SPACINGS),
    maxWidth: z.enum(CONTENT_WIDTHS),
    columns: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    cardStyle: z.enum(OFFER_CARD_STYLES),
    imageRatio: z.enum(OFFER_IMAGE_RATIOS),
    titleSize: z.enum(TITLE_SIZES),
    showDescription: z.boolean(),
    showPrice: z.boolean(),
    buttonStyle: z.enum(OFFER_BUTTON_STYLES),
    buttonPreset: z.enum(OFFER_BUTTON_PRESETS),
    customButtonText: z.string().max(MAX_CUSTOM_BUTTON_CHARS),
  }),
  footer: z.object({
    theme: z.enum(FOOTER_THEMES),
    align: z.enum(HERO_ALIGNS),
    showLogo: z.boolean(),
    showContact: z.boolean(),
    showSocial: z.boolean(),
    showAddress: z.boolean(),
    showPhone: z.boolean(),
    showEmail: z.boolean(),
    showWebsite: z.boolean(),
    iconStyle: z.enum(ICON_STYLES),
    backgroundColor: optionalHex,
    textColor: optionalHex,
    spacing: z.enum(FOOTER_SPACINGS),
    showPoweredBy: z.literal(true),
  }),
});

export type StorefrontConfig = z.infer<typeof storefrontConfigSchema>;

export function parseStorefrontConfig(value: unknown): StorefrontConfig {
  return storefrontConfigSchema.parse(value);
}

export function hydrateStorefrontConfig(value: unknown, fallback: StorefrontConfig): StorefrontConfig {
  const normalized = normalizeLegacyStorefront(value, fallback);
  const parsed = storefrontConfigSchema.safeParse(normalized);
  if (parsed.success) return parsed.data;
  const merged = storefrontConfigSchema.safeParse(mergeDeep(fallback, normalized));
  if (merged.success) return merged.data;
  return fallback;
}

export function configsAreEqual(a: StorefrontConfig, b: StorefrontConfig): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function normalizeLegacyStorefront(value: unknown, fallback: StorefrontConfig): unknown {
  if (value == null || typeof value !== "object") return fallback;
  const raw = value as Record<string, unknown>;
  if (raw.schemaVersion === STOREFRONT_SCHEMA_VERSION && isRecord(raw.hero) && "layout" in raw.hero) {
    return stripRemovedKeys(raw);
  }

  const oldStyle = isRecord(raw.style) ? raw.style : {};
  const oldHero = isRecord(raw.hero) ? raw.hero : {};
  const oldOffers = isRecord(raw.offers) ? raw.offers : {};
  const oldFooter = isRecord(raw.footer) ? raw.footer : {};
  const oldPractical = isRecord(raw.practical) ? raw.practical : {};

  const coverHeight = oldHero.coverHeight === "tall" || oldHero.height === "immersive" ? "immersive" : oldHero.coverHeight === "compact" || oldHero.height === "compact" ? "compact" : "normal";
  const overlayEnabled = oldHero.overlayEnabled !== false;
  const overlayOpacity =
    typeof oldHero.overlayOpacity === "number" ? Math.min(80, Math.max(0, Math.round(oldHero.overlayOpacity))) : overlayEnabled ? 45 : 35;

  return {
    schemaVersion: STOREFRONT_SCHEMA_VERSION,
    presetId: mapLegacyPreset(raw.presetId ?? raw.templateId),
    style: {
      ...fallback.style,
      primaryColor: pickHex(oldStyle.primaryColor, fallback.style.primaryColor),
      accentColor: pickHex(oldStyle.accentColor ?? oldStyle.secondaryColor, fallback.style.accentColor),
      backgroundColor: pickHex(oldStyle.backgroundColor, fallback.style.backgroundColor),
      textColor: pickHex(oldStyle.textColor, fallback.style.textColor),
      mutedTextColor: pickHex(oldStyle.mutedTextColor, fallback.style.mutedTextColor),
      themeMode: oldStyle.themeMode === "dark" ? "dark" : "light",
      fontPairing: mapLegacyFont(oldStyle.fontPairing ?? oldStyle.font),
      buttonFill: oldStyle.buttonFill === "outline" || oldStyle.buttonStyle === "ghost" ? "outline" : "filled",
      radius: oldStyle.radius === "soft" || oldStyle.buttonStyle === "soft" ? "soft" : oldStyle.radius === "pill" || oldStyle.buttonStyle === "pill" ? "pill" : "rounded",
      spacing: oldStyle.spacing === "compact" || oldStyle.spacing === "relaxed" ? oldStyle.spacing : "normal",
      contentWidth: oldStyle.contentWidth === "narrow" || oldStyle.contentWidth === "wide" ? oldStyle.contentWidth : "normal",
    },
    hero: {
      ...fallback.hero,
      layout: isHeroLayout(oldHero.layout) ? oldHero.layout : coverHeight === "immersive" ? "immersive" : "fullbleed",
      showLogo: oldHero.showLogo !== false,
      logoSize: oldHero.logoSize === "sm" || oldHero.logoSize === "lg" ? oldHero.logoSize : "md",
      coverImageUrl: typeof oldHero.coverImageUrl === "string" ? oldHero.coverImageUrl : fallback.hero.coverImageUrl,
      focalX: typeof oldHero.focalX === "number" ? clamp01(oldHero.focalX) : 0.5,
      focalY: typeof oldHero.focalY === "number" ? clamp01(oldHero.focalY) : 0.5,
      height: coverHeight,
      title: typeof oldHero.title === "string" ? oldHero.title : fallback.hero.title,
      subtitle: typeof oldHero.subtitle === "string" ? oldHero.subtitle : fallback.hero.subtitle,
      align: oldHero.align === "center" ? "center" : "left",
      textColor: typeof oldHero.textColor === "string" ? oldHero.textColor : "",
      overlayOpacity,
      ctaVisible: oldHero.ctaVisible !== false,
      ctaText: typeof oldHero.ctaText === "string" ? oldHero.ctaText : fallback.hero.ctaText,
      ctaStyle: oldHero.ctaStyle === "outline" || oldHero.ctaStyle === "soft" ? oldHero.ctaStyle : "filled",
      background: oldHero.background === "solid" || oldHero.background === "gradient" ? oldHero.background : "image",
      frame: oldHero.frame === "rounded" ? "rounded" : "fullscreen",
      padding: oldHero.padding === "compact" || oldHero.padding === "relaxed" ? oldHero.padding : "normal",
    },
    offers: {
      ...fallback.offers,
      title: typeof oldOffers.title === "string" ? oldOffers.title : fallback.offers.title,
      subtitle: typeof oldOffers.subtitle === "string" ? oldOffers.subtitle : fallback.offers.subtitle,
      align: oldOffers.align === "center" ? "center" : "left",
      backgroundColor: typeof oldOffers.backgroundColor === "string" ? oldOffers.backgroundColor : "",
      paddingY: oldOffers.paddingY === "compact" || oldOffers.paddingY === "relaxed" ? oldOffers.paddingY : "normal",
      maxWidth: oldOffers.maxWidth === "narrow" || oldOffers.maxWidth === "wide" ? oldOffers.maxWidth : "normal",
      columns: oldOffers.columns === 1 || oldOffers.columns === 3 ? oldOffers.columns : 2,
      cardStyle: mapLegacyCardStyle(oldOffers.cardStyle, oldOffers.cardOrientation),
      imageRatio: oldOffers.imageRatio === "4/3" || oldOffers.imageRatio === "1/1" ? oldOffers.imageRatio : "16/10",
      titleSize: oldOffers.titleSize === "sm" || oldOffers.titleSize === "lg" ? oldOffers.titleSize : "md",
      showDescription: oldOffers.showDescription !== false,
      showPrice: oldOffers.showPrice !== false,
      buttonStyle: oldOffers.buttonStyle === "outline" || oldOffers.buttonStyle === "subtle" ? oldOffers.buttonStyle : "filled",
      buttonPreset:
        oldOffers.buttonPreset === "offrir" || oldOffers.buttonPreset === "decouvrir" || oldOffers.buttonPreset === "custom"
          ? oldOffers.buttonPreset
          : "choisir",
      customButtonText: typeof oldOffers.customButtonText === "string" ? oldOffers.customButtonText : "",
    },
    footer: {
      ...fallback.footer,
      theme: oldFooter.theme === "dark" ? "dark" : "light",
      align: oldFooter.align === "center" ? "center" : "left",
      showLogo: oldFooter.showLogo !== false,
      showContact: oldFooter.showContact !== false,
      showSocial: oldFooter.showSocial !== false,
      showAddress: oldPractical.showAddress !== false && oldFooter.showAddress !== false,
      showPhone: oldPractical.showPhone !== false && oldFooter.showPhone !== false,
      showEmail: oldPractical.showEmail !== false && oldFooter.showEmail !== false,
      showWebsite: oldPractical.showWebsite !== false && oldFooter.showWebsite !== false,
      iconStyle: oldFooter.iconStyle === "circle" || oldFooter.iconStyle === "rounded" ? oldFooter.iconStyle : "circle",
      backgroundColor: typeof oldFooter.backgroundColor === "string" ? oldFooter.backgroundColor : "",
      textColor: typeof oldFooter.textColor === "string" ? oldFooter.textColor : "",
      spacing: oldFooter.spacing === "compact" ? "compact" : "comfortable",
      showPoweredBy: true,
    },
  };
}

function stripRemovedKeys(raw: Record<string, unknown>): Record<string, unknown> {
  const rest = { ...raw };
  delete rest.about;
  delete rest.gallery;
  delete rest.practical;
  delete rest.sections;
  delete rest.templateId;
  return rest;
}

function mapLegacyPreset(value: unknown): StorefrontPresetId | null {
  if (value === "gastronomie" || value === "elegant") return "gastronomie";
  if (value === "spa") return "spa";
  if (value === "cave") return "cave";
  if (value === "hotel" || value === "modern") return "hotel";
  if (value === "minimal") return "minimal";
  return null;
}

function mapLegacyFont(value: unknown): FontPairingId {
  if (value === "spa" || value === "Italiana") return "spa";
  if (value === "cave" || value === "Playfair Display" || value === "Lora") return "cave";
  if (value === "hotel" || value === "Marcellus" || value === "DM Sans") return "hotel";
  if (value === "gastronomie" || value === "Cormorant Garamond" || value === "Playfair Display") return "gastronomie";
  if (value === "modern" || value === "Manrope" || value === "Inter") return "modern";
  if (typeof value === "string" && FONT_PAIRING_IDS.includes(value as FontPairingId)) return value as FontPairingId;
  return "modern";
}

function mapLegacyCardStyle(style: unknown, orientation: unknown) {
  if (style === "classic" || style === "immersive" || style === "horizontal" || style === "minimal" || style === "premium") {
    return style;
  }
  if (orientation === "horizontal") return "horizontal";
  if (style === "border") return "classic";
  if (style === "minimal") return "minimal";
  return "premium";
}

function isHeroLayout(value: unknown): value is (typeof HERO_LAYOUTS)[number] {
  return value === "fullbleed" || value === "split" || value === "minimal" || value === "immersive";
}

function pickHex(value: unknown, fallback: string): string {
  return typeof value === "string" && /^#[0-9A-Fa-f]{6}$/.test(value) ? value : fallback;
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

function mergeDeep(base: unknown, overlay: unknown): unknown {
  if (overlay == null) return base;
  if (Array.isArray(overlay)) return overlay;
  if (typeof overlay !== "object" || typeof base !== "object" || base == null || Array.isArray(base)) {
    return overlay;
  }
  const result: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [key, next] of Object.entries(overlay as Record<string, unknown>)) {
    result[key] = key in result ? mergeDeep(result[key], next) : next;
  }
  return result;
}
