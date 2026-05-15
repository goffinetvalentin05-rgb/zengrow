import type { PublicAmbiance, PublicStylePreset } from "@/src/lib/public-page/constants";
import { DEFAULT_PRIMARY, DEFAULT_SECONDARY, normalizeHexColor } from "@/src/lib/public-page/colors";
import type { PublicPagePreviewDraft } from "@/src/components/dashboard/public-page-live-preview";
import type { OpeningHours } from "@/src/lib/utils";

export const EDITOR_CONFIG_VERSION = 2;

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
  "final_cta",
] as const;

export type PageBlockId = (typeof PAGE_BLOCK_IDS)[number];

export type HeroLayout = "left" | "center" | "overlay";
export type HeroHeightPreset = "compact" | "normal" | "immersive";
export type HeroAlign = "left" | "center" | "right";
export type BorderRadiusPreset = "soft" | "medium" | "premium";
export type ShadowPreset = "none" | "soft" | "medium";
export type ThemeMode = "light" | "dark" | "auto";

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
    backgroundColor: string;
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
  };
  blocks: Record<
    PageBlockId,
    {
      enabled: boolean;
    }
  >;
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
  };
};

export const DEFAULT_SECTION_ORDER: PageBlockId[] = [
  "trust",
  "reservation",
  "gallery",
  "about",
  "highlights",
  "menu",
  "hours",
  "location",
  "reviews",
  "social",
  "final_cta",
];

export function defaultEditorConfig(): PublicPageEditorConfig {
  return {
    version: EDITOR_CONFIG_VERSION,
    hero: {
      enabled: true,
      layout: "center",
      height: "normal",
      align: "center",
      badgeText: "Réservation en ligne",
      title: "",
      subtitle: "",
      primaryCta: "Réserver une table",
      secondaryCta: "Voir le menu",
      secondaryCtaEnabled: true,
      overlayEnabled: true,
      overlayOpacity: 45,
    },
    appearance: {
      primaryColor: DEFAULT_PRIMARY,
      secondaryColor: DEFAULT_SECONDARY,
      accentColor: DEFAULT_PRIMARY,
      textColor: "#0f172a",
      backgroundColor: "#f8fafc",
      footerBgColor: "#0f172a",
      footerTextColor: "#e2e8f0",
      stylePreset: null,
      ambiance: null,
      borderRadius: "medium",
      shadow: "soft",
      themeMode: "light",
      headingFont: "Playfair Display",
      bodyFont: "Inter",
      buttonTextColor: "#ffffff",
    },
    blocks: Object.fromEntries(PAGE_BLOCK_IDS.map((id) => [id, { enabled: true }])) as PublicPageEditorConfig["blocks"],
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
    },
  };
}

export function parseEditorConfig(raw: unknown): PublicPageEditorConfig {
  const base = defaultEditorConfig();
  if (!raw || typeof raw !== "object") return base;
  const o = raw as Partial<PublicPageEditorConfig>;
  if (o.version !== EDITOR_CONFIG_VERSION) return mergeEditorConfig(base, o);

  return mergeEditorConfig(base, o);
}

function mergeEditorConfig(base: PublicPageEditorConfig, patch: Partial<PublicPageEditorConfig>): PublicPageEditorConfig {
  const blocks = { ...base.blocks };
  if (patch.blocks) {
    for (const id of PAGE_BLOCK_IDS) {
      if (patch.blocks[id]) blocks[id] = { ...blocks[id], ...patch.blocks[id] };
    }
  }
  const order = Array.isArray(patch.sectionOrder)
    ? patch.sectionOrder.filter((id): id is PageBlockId => PAGE_BLOCK_IDS.includes(id as PageBlockId))
    : base.sectionOrder;

  return {
    ...base,
    ...patch,
    hero: { ...base.hero, ...patch.hero },
    appearance: { ...base.appearance, ...patch.appearance },
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
  };
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
    headingTextColor: normalizeHexColor(a.textColor),
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
    buttonStyle: "filled",
    cardStyle: a.shadow === "none" ? "flat" : "elevated",
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
