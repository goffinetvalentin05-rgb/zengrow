import { z } from "zod";

export const STOREFRONT_SCHEMA_VERSION = 1 as const;

export const STOREFRONT_SECTION_IDS = [
  "hero",
  "offers",
  "about",
  "gallery",
  "practical",
  "hours",
  "contact",
  "social",
  "map",
  "footer",
] as const;

export type StorefrontSectionId = (typeof STOREFRONT_SECTION_IDS)[number];

export const STOREFRONT_TEMPLATES = ["elegant", "modern", "minimal"] as const;
export type StorefrontTemplateId = (typeof STOREFRONT_TEMPLATES)[number];

export const STOREFRONT_FONTS = [
  "Inter",
  "Manrope",
  "DM Sans",
  "Playfair Display",
  "Cormorant Garamond",
  "Lora",
] as const;
export type StorefrontFont = (typeof STOREFRONT_FONTS)[number];

export const BUTTON_STYLES = ["soft", "rounded", "pill"] as const;
export const CARD_STYLES = ["border", "shadow", "minimal"] as const;
export const THEME_MODES = ["light", "dark"] as const;
export const SPACINGS = ["compact", "normal", "relaxed"] as const;
export const CONTENT_WIDTHS = ["narrow", "normal", "wide"] as const;
export const HERO_ALIGNS = ["left", "center"] as const;
export const COVER_HEIGHTS = ["compact", "normal", "tall"] as const;
export const ABOUT_IMAGE_PLACEMENTS = ["left", "right", "none"] as const;
export const OFFER_LAYOUTS = ["grid", "list"] as const;
export const OFFER_ORIENTATIONS = ["vertical", "horizontal"] as const;
export const OFFER_IMAGE_RATIOS = ["16/10", "4/3", "1/1"] as const;
export const OFFER_BUTTON_PRESETS = ["offrir", "decouvrir", "choisir", "custom"] as const;
export const HERO_CTA_TARGETS = ["offers", "about", "contact", "hours", "map"] as const;

export const MAX_GALLERY_IMAGES = 8;
export const MAX_CUSTOM_BUTTON_CHARS = 40;
export const MAX_PLAIN_TEXT = 4000;
export const MAX_TITLE = 120;
export const MAX_SUBTITLE = 280;

const hexColor = z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Couleur invalide.");
const optionalHex = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/)
  .nullable()
  .optional()
  .transform((value) => value ?? null);

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

const sectionSchema = z.object({
  id: z.enum(STOREFRONT_SECTION_IDS),
  enabled: z.boolean(),
});

export const storefrontConfigSchema = z.object({
  schemaVersion: z.literal(STOREFRONT_SCHEMA_VERSION),
  templateId: z.enum(STOREFRONT_TEMPLATES).nullable(),
  style: z.object({
    primaryColor: hexColor,
    secondaryColor: optionalHex,
    backgroundColor: hexColor,
    textColor: hexColor,
    themeMode: z.enum(THEME_MODES),
    font: z.enum(STOREFRONT_FONTS),
    buttonStyle: z.enum(BUTTON_STYLES),
    cardStyle: z.enum(CARD_STYLES),
    contentWidth: z.enum(CONTENT_WIDTHS),
    spacing: z.enum(SPACINGS),
  }),
  hero: z.object({
    showLogo: z.boolean(),
    coverImageUrl: httpUrl,
    title: z.string().max(MAX_TITLE),
    subtitle: z.string().max(MAX_SUBTITLE),
    align: z.enum(HERO_ALIGNS),
    coverHeight: z.enum(COVER_HEIGHTS),
    overlayEnabled: z.boolean(),
    overlayOpacity: z.number().int().min(20).max(80),
    ctaText: z.string().max(MAX_CUSTOM_BUTTON_CHARS),
    ctaVisible: z.boolean(),
    ctaTarget: z.enum(HERO_CTA_TARGETS),
    showAddress: z.boolean(),
    showCategory: z.boolean(),
  }),
  offers: z.object({
    title: z.string().max(MAX_TITLE),
    subtitle: z.string().max(MAX_SUBTITLE),
    columns: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    layout: z.enum(OFFER_LAYOUTS),
    cardOrientation: z.enum(OFFER_ORIENTATIONS),
    imageRatio: z.enum(OFFER_IMAGE_RATIOS),
    showDescription: z.boolean(),
    showPrice: z.boolean(),
    buttonPreset: z.enum(OFFER_BUTTON_PRESETS),
    customButtonText: z.string().max(MAX_CUSTOM_BUTTON_CHARS),
  }),
  about: z.object({
    title: z.string().max(MAX_TITLE),
    body: z.string().max(MAX_PLAIN_TEXT),
    imageUrl: httpUrl,
    imagePlacement: z.enum(ABOUT_IMAGE_PLACEMENTS),
  }),
  gallery: z.object({
    images: z.array(httpUrl).max(MAX_GALLERY_IMAGES),
  }),
  practical: z.object({
    showAddress: z.boolean(),
    showPhone: z.boolean(),
    showEmail: z.boolean(),
    showWebsite: z.boolean(),
    showHours: z.boolean(),
    showInstagram: z.boolean(),
    showFacebook: z.boolean(),
  }),
  footer: z.object({
    showLogo: z.boolean(),
    text: z.string().max(MAX_SUBTITLE),
    showContact: z.boolean(),
    showSocial: z.boolean(),
    showPoweredBy: z.literal(true),
  }),
  sections: z
    .array(sectionSchema)
    .min(STOREFRONT_SECTION_IDS.length)
    .max(STOREFRONT_SECTION_IDS.length)
    .superRefine((sections, ctx) => {
      const ids = sections.map((section) => section.id);
      const unique = new Set(ids);
      if (unique.size !== STOREFRONT_SECTION_IDS.length) {
        ctx.addIssue({ code: "custom", message: "Chaque section doit apparaître une seule fois." });
      }
      for (const id of STOREFRONT_SECTION_IDS) {
        if (!unique.has(id)) {
          ctx.addIssue({ code: "custom", message: `Section manquante : ${id}.` });
        }
      }
    }),
});

export type StorefrontConfig = z.infer<typeof storefrontConfigSchema>;

export function parseStorefrontConfig(value: unknown): StorefrontConfig {
  return storefrontConfigSchema.parse(value);
}

export function hydrateStorefrontConfig(value: unknown, fallback: StorefrontConfig): StorefrontConfig {
  const parsed = storefrontConfigSchema.safeParse(mergeDeep(fallback, value));
  if (parsed.success) return parsed.data;
  return fallback;
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

export function configsAreEqual(a: StorefrontConfig, b: StorefrontConfig): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}
