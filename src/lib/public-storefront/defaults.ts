import {
  STOREFRONT_SCHEMA_VERSION,
  type FontPairingId,
  type StorefrontConfig,
  type StorefrontPresetId,
} from "@/src/lib/public-storefront/schema";
import type { StorefrontIdentity } from "@/src/lib/public-storefront/identity";
import type { PublicPageFontOption } from "@/src/lib/public-page-fonts";

export const FONT_PAIRINGS: Record<
  FontPairingId,
  { id: FontPairingId; label: string; heading: PublicPageFontOption; body: PublicPageFontOption }
> = {
  gastronomie: { id: "gastronomie", label: "Gastronomie", heading: "Cormorant Garamond", body: "Inter" },
  spa: { id: "spa", label: "Spa", heading: "Italiana", body: "Manrope" },
  cave: { id: "cave", label: "Cave", heading: "Playfair Display", body: "Lora" },
  hotel: { id: "hotel", label: "Hôtel", heading: "Marcellus", body: "DM Sans" },
  modern: { id: "modern", label: "Moderne", heading: "Manrope", body: "Inter" },
};

export const STOREFRONT_PRESET_META: Record<StorefrontPresetId, { label: string; hint: string }> = {
  gastronomie: { label: "Gastronomie élégante", hint: "Serif raffinée, beaucoup d’air" },
  spa: { label: "Spa & bien-être", hint: "Doux, lumineux, typographie couture" },
  cave: { label: "Cave & terroir", hint: "Chaleureux, photographique" },
  hotel: { label: "Hôtel premium", hint: "Calme, grands formats, détails fins" },
  minimal: { label: "Moderne minimal", hint: "Épuré, priorité aux offres" },
};

export function defaultStorefrontConfig(identity?: StorefrontIdentity | null): StorefrontConfig {
  const name = identity?.displayName?.trim() || identity?.name?.trim() || "";
  return {
    schemaVersion: STOREFRONT_SCHEMA_VERSION,
    presetId: null,
    style: {
      primaryColor: identity?.primaryColor ?? "#1F7A6C",
      accentColor: "#C45C26",
      backgroundColor: "#FAF7F2",
      textColor: "#1C1917",
      mutedTextColor: "#57534E",
      themeMode: "light",
      fontPairing: "modern",
      buttonFill: "filled",
      radius: "rounded",
      spacing: "normal",
      contentWidth: "normal",
    },
    hero: {
      layout: "fullbleed",
      showLogo: true,
      logoSize: "md",
      coverImageUrl: identity?.coverUrl ?? "",
      focalX: 0.5,
      focalY: 0.5,
      height: "normal",
      title: name,
      subtitle: identity?.tagline ?? "",
      align: "left",
      textColor: "",
      overlayOpacity: 42,
      ctaVisible: true,
      ctaText: "Offrir un bon cadeau",
      ctaStyle: "filled",
      background: "image",
      frame: "fullscreen",
      padding: "normal",
    },
    offers: {
      title: "Bons cadeaux",
      subtitle: "Offrez une expérience à utiliser sur place.",
      align: "left",
      backgroundColor: "",
      paddingY: "normal",
      maxWidth: "normal",
      columns: 2,
      cardStyle: "premium",
      imageRatio: "16/10",
      titleSize: "md",
      showDescription: true,
      showPrice: true,
      buttonStyle: "filled",
      buttonPreset: "choisir",
      customButtonText: "",
    },
    footer: {
      theme: "light",
      align: "left",
      showLogo: true,
      showContact: true,
      showSocial: true,
      showAddress: true,
      showPhone: true,
      showEmail: true,
      showWebsite: true,
      iconStyle: "circle",
      backgroundColor: "",
      textColor: "",
      spacing: "comfortable",
      showPoweredBy: true,
    },
  };
}

export function applyStorefrontPreset(
  current: StorefrontConfig,
  presetId: StorefrontPresetId,
  identity?: StorefrontIdentity | null,
): StorefrontConfig {
  const seeded = presetConfig(presetId, defaultStorefrontConfig(identity));
  return {
    ...seeded,
    hero: {
      ...seeded.hero,
      title: current.hero.title,
      subtitle: current.hero.subtitle,
      coverImageUrl: current.hero.coverImageUrl,
      showLogo: current.hero.showLogo,
      ctaText: current.hero.ctaText,
      focalX: current.hero.focalX,
      focalY: current.hero.focalY,
    },
    offers: {
      ...seeded.offers,
      title: current.offers.title,
      subtitle: current.offers.subtitle,
      customButtonText: current.offers.customButtonText,
      buttonPreset: current.offers.buttonPreset,
    },
    footer: {
      ...seeded.footer,
      showLogo: current.footer.showLogo,
      showContact: current.footer.showContact,
      showSocial: current.footer.showSocial,
      showAddress: current.footer.showAddress,
      showPhone: current.footer.showPhone,
      showEmail: current.footer.showEmail,
      showWebsite: current.footer.showWebsite,
    },
  };
}

/** @deprecated use applyStorefrontPreset */
export function applyStorefrontTemplate(
  current: StorefrontConfig,
  templateId: "elegant" | "modern" | "minimal" | StorefrontPresetId,
  identity?: StorefrontIdentity | null,
): StorefrontConfig {
  const preset: StorefrontPresetId =
    templateId === "elegant" ? "gastronomie" : templateId === "modern" ? "hotel" : templateId === "minimal" ? "minimal" : templateId;
  return applyStorefrontPreset(current, preset, identity);
}

function presetConfig(presetId: StorefrontPresetId, seeded: StorefrontConfig): StorefrontConfig {
  if (presetId === "gastronomie") {
    return {
      ...seeded,
      presetId,
      style: {
        ...seeded.style,
        backgroundColor: "#F4EFE6",
        textColor: "#1A1612",
        mutedTextColor: "#6B6258",
        accentColor: "#9A3412",
        fontPairing: "gastronomie",
        buttonFill: "filled",
        radius: "soft",
        spacing: "relaxed",
        contentWidth: "normal",
        themeMode: "light",
      },
      hero: {
        ...seeded.hero,
        layout: "immersive",
        height: "immersive",
        align: "center",
        overlayOpacity: 48,
        background: "image",
        frame: "fullscreen",
        padding: "relaxed",
        ctaStyle: "filled",
      },
      offers: {
        ...seeded.offers,
        cardStyle: "premium",
        columns: 2,
        imageRatio: "16/10",
        paddingY: "relaxed",
        titleSize: "lg",
        buttonStyle: "filled",
      },
      footer: { ...seeded.footer, theme: "light", align: "center", iconStyle: "plain", spacing: "comfortable" },
    };
  }

  if (presetId === "spa") {
    return {
      ...seeded,
      presetId,
      style: {
        ...seeded.style,
        backgroundColor: "#F7F5F2",
        textColor: "#2A2420",
        mutedTextColor: "#7A726A",
        primaryColor: seeded.style.primaryColor,
        accentColor: "#0F766E",
        fontPairing: "spa",
        buttonFill: "filled",
        radius: "pill",
        spacing: "relaxed",
        contentWidth: "narrow",
        themeMode: "light",
      },
      hero: {
        ...seeded.hero,
        layout: "minimal",
        height: "compact",
        align: "center",
        background: "gradient",
        overlayOpacity: 0,
        frame: "rounded",
        padding: "relaxed",
        ctaStyle: "soft",
      },
      offers: {
        ...seeded.offers,
        cardStyle: "minimal",
        columns: 2,
        imageRatio: "4/3",
        paddingY: "relaxed",
        align: "center",
        buttonStyle: "subtle",
      },
      footer: { ...seeded.footer, theme: "light", align: "center", iconStyle: "circle", spacing: "comfortable" },
    };
  }

  if (presetId === "cave") {
    return {
      ...seeded,
      presetId,
      style: {
        ...seeded.style,
        backgroundColor: "#1C1410",
        textColor: "#F4EDE4",
        mutedTextColor: "#C4B5A5",
        accentColor: "#B45309",
        fontPairing: "cave",
        buttonFill: "filled",
        radius: "soft",
        spacing: "normal",
        contentWidth: "normal",
        themeMode: "dark",
      },
      hero: {
        ...seeded.hero,
        layout: "fullbleed",
        height: "immersive",
        align: "left",
        overlayOpacity: 55,
        background: "image",
        frame: "fullscreen",
        ctaStyle: "filled",
      },
      offers: {
        ...seeded.offers,
        cardStyle: "immersive",
        columns: 2,
        imageRatio: "16/10",
        buttonStyle: "filled",
      },
      footer: { ...seeded.footer, theme: "dark", align: "left", iconStyle: "rounded", spacing: "compact" },
    };
  }

  if (presetId === "hotel") {
    return {
      ...seeded,
      presetId,
      style: {
        ...seeded.style,
        backgroundColor: "#F8F6F3",
        textColor: "#1C1917",
        mutedTextColor: "#78716C",
        accentColor: "#44403C",
        fontPairing: "hotel",
        buttonFill: "outline",
        radius: "rounded",
        spacing: "relaxed",
        contentWidth: "wide",
        themeMode: "light",
      },
      hero: {
        ...seeded.hero,
        layout: "split",
        height: "normal",
        align: "left",
        overlayOpacity: 0,
        background: "image",
        frame: "rounded",
        padding: "relaxed",
        ctaStyle: "outline",
      },
      offers: {
        ...seeded.offers,
        cardStyle: "premium",
        columns: 3,
        imageRatio: "4/3",
        titleSize: "sm",
        buttonStyle: "outline",
      },
      footer: { ...seeded.footer, theme: "light", align: "left", iconStyle: "plain", spacing: "comfortable" },
    };
  }

  return {
    ...seeded,
    presetId: "minimal",
    style: {
      ...seeded.style,
      backgroundColor: "#FFFFFF",
      textColor: "#171717",
      mutedTextColor: "#737373",
      accentColor: "#171717",
      fontPairing: "modern",
      buttonFill: "filled",
      radius: "pill",
      spacing: "compact",
      contentWidth: "narrow",
      themeMode: "light",
    },
    hero: {
      ...seeded.hero,
      layout: "minimal",
      height: "compact",
      align: "left",
      background: "solid",
      overlayOpacity: 0,
      frame: "fullscreen",
      padding: "compact",
      ctaStyle: "filled",
    },
    offers: {
      ...seeded.offers,
      cardStyle: "classic",
      columns: 2,
      imageRatio: "16/10",
      paddingY: "compact",
      buttonStyle: "filled",
    },
    footer: { ...seeded.footer, theme: "light", align: "left", iconStyle: "plain", spacing: "compact" },
  };
}
