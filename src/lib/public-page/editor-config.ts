import type { PublicAmbiance, PublicStylePreset } from "@/src/lib/public-page/constants";
import { DEFAULT_PRIMARY, DEFAULT_SECONDARY, normalizeHexColor } from "@/src/lib/public-page/colors";
import { applyStylePresetPalette } from "@/src/lib/public-page/preset-palettes";
import type { PublicPagePreviewDraft } from "@/src/components/dashboard/public-page-live-preview";
import type { OpeningHours } from "@/src/lib/utils";
import {
  applyStructureTemplate,
  defaultConversionSettings,
  normalizeConversionSettings,
  type ConversionSettings,
} from "@/src/lib/public-page/conversion";
import {
  defaultPremiumContent,
  normalizePremiumContent,
  type PremiumPageContent,
} from "@/src/lib/public-page/premium-content";
import {
  mergePageSectionContent,
  type PageSectionContentV1,
} from "@/src/lib/public-page/page-sections";

export const EDITOR_CONFIG_VERSION = 5;

export type { PremiumPageContent };

export type { ConversionSettings };

export const PAGE_BLOCK_IDS = [
  "trust",
  "reservation",
  "gallery",
  "about",
  "highlights",
  "menu",
  "hours",
  "reviews",
  "location",
  "social",
  "gift_vouchers",
  "final_cta",
] as const;

export type PageBlockId = (typeof PAGE_BLOCK_IDS)[number];

export type HeroLayout = "left" | "center" | "overlay" | "split";
export type HeroHeightPreset = "compact" | "normal" | "immersive";
export type HeroAlign = "left" | "center" | "right";
export type BorderRadiusPreset = "soft" | "medium" | "premium";
export type ShadowPreset = "none" | "soft" | "medium";
export type ThemeMode = "light" | "dark" | "auto";
export type SectionVariant =
  | "inherit"
  | "light"
  | "dark"
  | "muted"
  | "accent"
  | "transparent"
  | "elevated"
  | "primary";
export type SectionWidth = "full" | "contained";
export type ButtonStylePreset = "filled" | "outlined" | "ghost";
export type CardStylePreset = "flat" | "elevated" | "bordered";

export type BlockConfig = {
  enabled: boolean;
  variant: SectionVariant;
  width: SectionWidth;
};

export type PublicPageEditorConfig = {
  version: typeof EDITOR_CONFIG_VERSION;
  hero: {
    enabled: boolean;
    layout: HeroLayout;
    height: HeroHeightPreset;
    align: HeroAlign;
    badgeText: string;
    title: string;
    subtitle: string;
    primaryCta: string;
    secondaryCta: string;
    secondaryCtaEnabled: boolean;
    overlayEnabled: boolean;
    overlayOpacity: number;
  };
  appearance: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    textColor: string;
    headingColor: string;
    backgroundColor: string;
    surfaceColor: string;
    footerBgColor: string;
    footerTextColor: string;
    stylePreset: PublicStylePreset | null;
    ambiance: PublicAmbiance | null;
    borderRadius: BorderRadiusPreset;
    shadow: ShadowPreset;
    themeMode: ThemeMode;
    headingFont: string;
    bodyFont: string;
    buttonTextColor: string;
    buttonStyle: ButtonStylePreset;
    cardStyle: CardStylePreset;
  };
  blocks: Record<PageBlockId, BlockConfig>;
  blockContent: {
    about: { title: string; body: string };
    highlights: { items: string[] };
    menu: { mode: "url" | "pdf" | null; url: string };
    hours: { showInReservation: boolean };
    reviews: { showRating: boolean };
    finalCta: { title: string; subtitle: string; button: string };
  };
  sectionOrder: PageBlockId[];
  reservation: {
    enabled: boolean;
    intro: string;
    showPhoneCta: boolean;
    showHoursBeforeForm: boolean;
    noSlotsMessage: string;
    minLeadMinutes: number;
    position: "default" | "after_hero" | "prominent";
  };
  conversion: ConversionSettings;
  premium: PremiumPageContent;
  /**
   * Textes de section (persisté via `restaurant_page_sections`, pas dans ce JSON à l’enregistrement).
   * Présent en mémoire dans l’éditeur et sur l’aperçu.
   */
  pageSections?: PageSectionContentV1;
};

export const DEFAULT_SECTION_ORDER: PageBlockId[] = [
  "about",
  "gallery",
  "menu",
  "reservation",
  "reviews",
  "hours",
  "location",
  "gift_vouchers",
  "final_cta",
  "social",
];

function defaultBlocks(): PublicPageEditorConfig["blocks"] {
  const blocks = Object.fromEntries(
    PAGE_BLOCK_IDS.map((id) => [id, { enabled: true, variant: "inherit" as SectionVariant, width: "contained" as SectionWidth }]),
  ) as PublicPageEditorConfig["blocks"];
  blocks.trust = { enabled: false, variant: "inherit", width: "full" };
  blocks.highlights = { enabled: false, variant: "inherit", width: "contained" };
  blocks.gift_vouchers = { enabled: false, variant: "inherit", width: "contained" };
  return blocks;
}

export function defaultEditorConfig(): PublicPageEditorConfig {
  const palette = applyStylePresetPalette(null, DEFAULT_PRIMARY, DEFAULT_SECONDARY);
  return {
    version: EDITOR_CONFIG_VERSION,
    hero: {
      enabled: true,
      layout: "overlay",
      height: "immersive",
      align: "left",
      badgeText: "",
      title: "",
      subtitle: "",
      primaryCta: "Réserver une table",
      secondaryCta: "Voir le menu",
      secondaryCtaEnabled: true,
      overlayEnabled: true,
      overlayOpacity: 50,
    },
    appearance: {
      primaryColor: palette.primaryColor,
      secondaryColor: palette.secondaryColor,
      accentColor: palette.accentColor,
      textColor: palette.textColor,
      headingColor: palette.headingColor,
      backgroundColor: palette.backgroundColor,
      surfaceColor: palette.surfaceColor,
      footerBgColor: palette.footerBgColor,
      footerTextColor: palette.footerTextColor,
      stylePreset: null,
      ambiance: null,
      borderRadius: "medium",
      shadow: "soft",
      themeMode: "light",
      headingFont: palette.headingFont,
      bodyFont: palette.bodyFont,
      buttonTextColor: palette.buttonTextColor,
      buttonStyle: "filled",
      cardStyle: "elevated",
    },
    blocks: defaultBlocks(),
    blockContent: {
      about: { title: "Notre restaurant", body: "" },
      highlights: { items: [] },
      menu: { mode: null, url: "" },
      hours: { showInReservation: true },
      reviews: { showRating: true },
      finalCta: {
        title: "Prêt à réserver ?",
        subtitle: "Réservez votre table en quelques clics.",
        button: "Réserver une table",
      },
    },
    sectionOrder: [...DEFAULT_SECTION_ORDER],
    reservation: {
      enabled: true,
      intro: "Choisissez votre date, votre heure et le nombre de personnes.",
      showPhoneCta: true,
      showHoursBeforeForm: true,
      noSlotsMessage: "Aucun créneau disponible pour cette date. Essayez un autre jour.",
      minLeadMinutes: 0,
      position: "prominent",
    },
    conversion: {
      ...defaultConversionSettings(),
      persuasionStyle: "premium",
    },
    premium: defaultPremiumContent(),
    pageSections: undefined,
  };
}

function normalizeBlockConfig(raw: unknown, fallback: BlockConfig): BlockConfig {
  if (!raw || typeof raw !== "object") return fallback;
  const o = raw as Partial<BlockConfig>;
  const variant =
    o.variant === "light" ||
    o.variant === "dark" ||
    o.variant === "muted" ||
    o.variant === "accent" ||
    o.variant === "transparent" ||
    o.variant === "elevated" ||
    o.variant === "primary" ||
    o.variant === "inherit"
      ? o.variant
      : fallback.variant;
  return {
    enabled: o.enabled !== false,
    variant,
    width: o.width === "full" ? "full" : "contained",
  };
}

function upgradeFromV2(raw: Record<string, unknown>): Partial<PublicPageEditorConfig> {
  const blocks: Partial<PublicPageEditorConfig["blocks"]> = {};
  const rawBlocks = raw.blocks as Record<string, { enabled?: boolean }> | undefined;
  if (rawBlocks) {
    const fallbacks = defaultBlocks();
    for (const id of PAGE_BLOCK_IDS) {
      const b = rawBlocks[id];
      blocks[id] = {
        enabled: b !== undefined ? b.enabled !== false : fallbacks[id].enabled,
        variant: "inherit",
        width: id === "trust" || id === "final_cta" ? "full" : "contained",
      };
    }
  }
  const appearance = raw.appearance as Record<string, unknown> | undefined;
  return {
    ...raw,
    version: EDITOR_CONFIG_VERSION,
    blocks: blocks as PublicPageEditorConfig["blocks"],
    appearance: appearance
      ? ({
          ...(appearance as PublicPageEditorConfig["appearance"]),
          headingColor:
            (appearance.headingColor as string) ||
            (appearance.textColor as string) ||
            defaultEditorConfig().appearance.headingColor,
          surfaceColor:
            (appearance.surfaceColor as string) || defaultEditorConfig().appearance.surfaceColor,
          buttonStyle: (appearance.buttonStyle as ButtonStylePreset) || "filled",
          cardStyle: (appearance.cardStyle as CardStylePreset) || "elevated",
        } satisfies Partial<PublicPageEditorConfig["appearance"]>)
      : undefined,
    reservation: raw.reservation
      ? {
          ...(raw.reservation as PublicPageEditorConfig["reservation"]),
          position: "default",
        }
      : undefined,
  };
}

export function parseEditorConfig(raw: unknown): PublicPageEditorConfig {
  const base = defaultEditorConfig();
  if (!raw || typeof raw !== "object") return base;
  const o = raw as Record<string, unknown>;
  const version = o.version as number | undefined;
  let patch: Partial<PublicPageEditorConfig>;
  if (version === EDITOR_CONFIG_VERSION) {
    patch = o as Partial<PublicPageEditorConfig>;
  } else if (version === 4 || version === 3) {
    patch = {
      ...(o as Partial<PublicPageEditorConfig>),
      conversion: normalizeConversionSettings(o.conversion),
      premium: normalizePremiumContent(o.premium),
    };
  } else {
    patch = upgradeFromV2(o);
  }
  return mergeEditorConfig(base, patch);
}

function mergeEditorConfig(base: PublicPageEditorConfig, patch: Partial<PublicPageEditorConfig>): PublicPageEditorConfig {
  const blocks = { ...base.blocks };
  if (patch.blocks) {
    for (const id of PAGE_BLOCK_IDS) {
      if (patch.blocks[id]) blocks[id] = normalizeBlockConfig(patch.blocks[id], blocks[id]);
    }
  }
  const order = Array.isArray(patch.sectionOrder)
    ? patch.sectionOrder.filter((id): id is PageBlockId => PAGE_BLOCK_IDS.includes(id as PageBlockId))
    : base.sectionOrder;

  const appearance = { ...base.appearance, ...patch.appearance };

  return {
    ...base,
    ...patch,
    version: EDITOR_CONFIG_VERSION,
    hero: { ...base.hero, ...patch.hero },
    appearance,
    blocks,
    blockContent: {
      about: { ...base.blockContent.about, ...patch.blockContent?.about },
      highlights: {
        items: Array.isArray(patch.blockContent?.highlights?.items)
          ? patch.blockContent.highlights.items.filter((x) => typeof x === "string").slice(0, 6)
          : base.blockContent.highlights.items,
      },
      menu: { ...base.blockContent.menu, ...patch.blockContent?.menu },
      hours: { ...base.blockContent.hours, ...patch.blockContent?.hours },
      reviews: { ...base.blockContent.reviews, ...patch.blockContent?.reviews },
      finalCta: { ...base.blockContent.finalCta, ...patch.blockContent?.finalCta },
    },
    sectionOrder: order.length > 0 ? order : base.sectionOrder,
    reservation: { ...base.reservation, ...patch.reservation },
    conversion: normalizeConversionSettings(patch.conversion ?? base.conversion),
    premium: normalizePremiumContent(patch.premium ?? base.premium),
    pageSections:
      base.pageSections ?? patch.pageSections
        ? mergePageSectionContent(base.pageSections ?? {}, patch.pageSections ?? {})
        : undefined,
  };
}

export function applyConversionTemplate(
  config: PublicPageEditorConfig,
  template: ConversionSettings["structureTemplate"],
): PublicPageEditorConfig {
  return parseEditorConfig({
    ...config,
    conversion: { ...config.conversion, structureTemplate: template },
    sectionOrder: applyStructureTemplate(template),
  });
}

export function borderRadiusToLegacy(p: BorderRadiusPreset): "sharp" | "rounded" | "pill" {
  if (p === "soft") return "rounded";
  if (p === "premium") return "pill";
  return "rounded";
}

export function heroHeightToLegacy(h: HeroHeightPreset): "compact" | "normal" | "tall" {
  if (h === "compact") return "compact";
  if (h === "immersive") return "tall";
  return "normal";
}

export function legacyHeroHeight(h: string | null | undefined): HeroHeightPreset {
  if (h === "compact") return "compact";
  if (h === "tall") return "immersive";
  return "normal";
}

export type EditorContext = {
  restaurantId: string;
  slug: string;
  name: string;
  city: string;
  cuisineType: string;
  address: string;
  phone: string;
  email: string;
  websiteUrl: string;
  googleMapsUrl: string;
  instagramUrl: string;
  facebookUrl: string;
  tiktokUrl: string;
  logoUrl: string;
  coverImageUrl: string;
  galleryUrls: string[];
  openingHours: OpeningHours;
  menuDocuments: { id: string; label: string; fileUrl: string; position: number }[];
  maxPartySize: number;
  seoTitle: string;
  seoDescription: string;
  pageStatus: "draft" | "published";
  showPublicInstagram: boolean;
  showPublicFacebook: boolean;
  showPublicGoogleMaps: boolean;
  showPublicAddress: boolean;
  showPublicPhone: boolean;
  showPublicEmail: boolean;
  showPublicWebsite: boolean;
  showPublicOpeningHours: boolean;
};

export function editorConfigToPreviewDraft(
  config: PublicPageEditorConfig,
  ctx: EditorContext,
): PublicPagePreviewDraft & { editorConfig: PublicPageEditorConfig } {
  const a = config.appearance;
  return {
    editorConfig: config,
    restaurantId: ctx.restaurantId,
    slug: ctx.slug,
    displayName: ctx.name.trim() || "Restaurant",
    heroTitle: config.hero.title.trim() || undefined,
    tagline: config.hero.subtitle.trim(),
    cuisineType: ctx.cuisineType || null,
    city: ctx.city || null,
    highlights: config.blockContent.highlights.items,
    specialMessage: null,
    menuUrl:
      config.blockContent.menu.mode === "url" ? config.blockContent.menu.url.trim() || null : null,
    reservationEnabled: config.reservation.enabled && config.blocks.reservation.enabled,
    preBookingMessage: config.reservation.intro,
    showHoursBeforeForm: config.reservation.showHoursBeforeForm,
    showPhoneCta: config.reservation.showPhoneCta,
    openingHours: ctx.openingHours,
    publicDescription: config.blockContent.about.body.trim(),
    logoUrl: ctx.logoUrl,
    coverImageUrl: ctx.coverImageUrl,
    pageBackgroundColor: normalizeHexColor(a.backgroundColor),
    heroPrimaryColor: normalizeHexColor(a.primaryColor),
    buttonBgColor: normalizeHexColor(a.accentColor),
    buttonTextColor: normalizeHexColor(a.buttonTextColor),
    headingTextColor: normalizeHexColor(a.headingColor),
    bodyTextColor: normalizeHexColor(a.textColor),
    accentColor: normalizeHexColor(a.accentColor),
    footerBgColor: normalizeHexColor(a.footerBgColor),
    footerTextColor: normalizeHexColor(a.footerTextColor),
    headingFont: a.headingFont,
    bodyFont: a.bodyFont,
    heroTitleSizePx: 48,
    heroHeight: heroHeightToLegacy(config.hero.height),
    heroOverlayEnabled: config.hero.overlayEnabled,
    heroOverlayOpacity: config.hero.overlayOpacity,
    ctaLabel: config.hero.primaryCta,
    secondaryCtaLabel: config.hero.secondaryCta,
    heroBadgeText: config.hero.badgeText,
    heroLayout: config.hero.layout,
    heroAlign: config.hero.align,
    borderRadius: borderRadiusToLegacy(a.borderRadius),
    buttonStyle: a.buttonStyle,
    cardStyle: a.cardStyle,
    fontSizeScale: "medium",
    phone: ctx.phone,
    address: ctx.address,
    email: ctx.email,
    websiteUrl: ctx.websiteUrl,
    instagramUrl: ctx.instagramUrl,
    facebookUrl: ctx.facebookUrl,
    googleMapsUrl: ctx.googleMapsUrl,
    showPublicAddress: ctx.showPublicAddress,
    showPublicPhone: ctx.showPublicPhone,
    showPublicEmail: ctx.showPublicEmail,
    showPublicWebsite: ctx.showPublicWebsite,
    showPublicOpeningHours: ctx.showPublicOpeningHours,
    showPublicInstagram: ctx.showPublicInstagram,
    showPublicFacebook: ctx.showPublicFacebook,
    showPublicGoogleMaps: ctx.showPublicGoogleMaps,
    documents: ctx.menuDocuments,
    galleryImageUrls: ctx.galleryUrls,
    maxPartySize: ctx.maxPartySize,
    themeMode: a.themeMode,
    sectionOrder: config.sectionOrder,
    blocksEnabled: config.blocks,
    aboutTitle: config.blockContent.about.title,
    finalCtaTitle: config.blockContent.finalCta.title,
    finalCtaSubtitle: config.blockContent.finalCta.subtitle,
    finalCtaButton: config.blockContent.finalCta.button,
  };
}
