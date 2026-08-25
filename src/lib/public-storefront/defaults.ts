import {
  STOREFRONT_SCHEMA_VERSION,
  STOREFRONT_SECTION_IDS,
  type StorefrontConfig,
  type StorefrontSectionId,
  type StorefrontTemplateId,
} from "@/src/lib/public-storefront/schema";
import type { StorefrontIdentity } from "@/src/lib/public-storefront/identity";

function defaultSections(enabled: Partial<Record<StorefrontSectionId, boolean>> = {}): StorefrontConfig["sections"] {
  return STOREFRONT_SECTION_IDS.map((id) => ({
    id,
    enabled: enabled[id] ?? true,
  }));
}

export function defaultStorefrontConfig(identity?: StorefrontIdentity | null): StorefrontConfig {
  const name = identity?.displayName?.trim() || identity?.name?.trim() || "";
  return {
    schemaVersion: STOREFRONT_SCHEMA_VERSION,
    templateId: null,
    style: {
      primaryColor: identity?.primaryColor ?? "#1F7A6C",
      secondaryColor: null,
      backgroundColor: "#FAF7F2",
      textColor: "#1C1917",
      themeMode: "light",
      font: "Inter",
      buttonStyle: "rounded",
      cardStyle: "shadow",
      contentWidth: "normal",
      spacing: "normal",
    },
    hero: {
      showLogo: true,
      coverImageUrl: identity?.coverUrl ?? "",
      title: name,
      subtitle: identity?.tagline ?? "",
      align: "left",
      coverHeight: "normal",
      overlayEnabled: true,
      overlayOpacity: 45,
      ctaText: "Offrir un bon cadeau",
      ctaVisible: true,
      ctaTarget: "offers",
      showAddress: true,
      showCategory: true,
    },
    offers: {
      title: "Bons cadeaux",
      subtitle: "Offrez une expérience à utiliser sur place.",
      columns: 2,
      layout: "grid",
      cardOrientation: "vertical",
      imageRatio: "16/10",
      showDescription: true,
      showPrice: true,
      buttonPreset: "choisir",
      customButtonText: "",
    },
    about: {
      title: "À propos",
      body: identity?.description ?? "",
      imageUrl: "",
      imagePlacement: identity?.coverUrl ? "left" : "none",
    },
    gallery: {
      images: identity?.galleryUrls?.slice(0, 8) ?? [],
    },
    practical: {
      showAddress: true,
      showPhone: true,
      showEmail: true,
      showWebsite: true,
      showHours: true,
      showInstagram: true,
      showFacebook: true,
    },
    footer: {
      showLogo: true,
      text: "",
      showContact: true,
      showSocial: true,
      showPoweredBy: true,
    },
    sections: defaultSections(),
  };
}

function mergePreservedContent(base: StorefrontConfig, current: StorefrontConfig): StorefrontConfig {
  return {
    ...base,
    hero: {
      ...base.hero,
      title: current.hero.title,
      subtitle: current.hero.subtitle,
      coverImageUrl: current.hero.coverImageUrl,
      showLogo: current.hero.showLogo,
      ctaText: current.hero.ctaText,
    },
    offers: {
      ...base.offers,
      title: current.offers.title,
      subtitle: current.offers.subtitle,
      customButtonText: current.offers.customButtonText,
      buttonPreset: current.offers.buttonPreset,
    },
    about: {
      ...base.about,
      title: current.about.title,
      body: current.about.body,
      imageUrl: current.about.imageUrl,
    },
    gallery: current.gallery,
    practical: current.practical,
    footer: {
      ...base.footer,
      text: current.footer.text,
      showLogo: current.footer.showLogo,
      showContact: current.footer.showContact,
      showSocial: current.footer.showSocial,
    },
  };
}

export function applyStorefrontTemplate(
  current: StorefrontConfig,
  templateId: StorefrontTemplateId,
  identity?: StorefrontIdentity | null,
): StorefrontConfig {
  const seeded = defaultStorefrontConfig(identity);
  const styled = templateConfig(templateId, seeded);
  return mergePreservedContent(styled, current);
}

function templateConfig(templateId: StorefrontTemplateId, seeded: StorefrontConfig): StorefrontConfig {
  if (templateId === "elegant") {
    return {
      ...seeded,
      templateId,
      style: {
        ...seeded.style,
        backgroundColor: "#F6F1EA",
        textColor: "#1A1612",
        font: "Cormorant Garamond",
        buttonStyle: "soft",
        cardStyle: "minimal",
        contentWidth: "normal",
        spacing: "relaxed",
        themeMode: "light",
      },
      hero: {
        ...seeded.hero,
        align: "center",
        coverHeight: "tall",
        overlayEnabled: true,
        overlayOpacity: 50,
      },
      offers: {
        ...seeded.offers,
        columns: 2,
        layout: "grid",
        cardOrientation: "vertical",
        imageRatio: "16/10",
      },
      about: {
        ...seeded.about,
        imagePlacement: seeded.about.imageUrl || seeded.hero.coverImageUrl ? "right" : "none",
      },
      sections: orderedSections(["hero", "about", "offers", "gallery", "hours", "contact", "map", "practical", "social", "footer"]),
    };
  }

  if (templateId === "modern") {
    return {
      ...seeded,
      templateId,
      style: {
        ...seeded.style,
        backgroundColor: "#F8FAFC",
        textColor: "#0F172A",
        font: "Manrope",
        buttonStyle: "rounded",
        cardStyle: "shadow",
        contentWidth: "wide",
        spacing: "normal",
        themeMode: "light",
      },
      hero: {
        ...seeded.hero,
        align: "left",
        coverHeight: "normal",
        overlayEnabled: true,
        overlayOpacity: 40,
      },
      offers: {
        ...seeded.offers,
        columns: 3,
        layout: "grid",
        cardOrientation: "vertical",
        imageRatio: "4/3",
      },
      about: {
        ...seeded.about,
        imagePlacement: "left",
      },
      sections: orderedSections(["hero", "offers", "about", "gallery", "practical", "hours", "contact", "social", "map", "footer"]),
    };
  }

  return {
    ...seeded,
    templateId: "minimal",
    style: {
      ...seeded.style,
      backgroundColor: "#FFFFFF",
      textColor: "#171717",
      font: "Inter",
      buttonStyle: "pill",
      cardStyle: "border",
      contentWidth: "narrow",
      spacing: "compact",
      themeMode: "light",
    },
    hero: {
      ...seeded.hero,
      align: "left",
      coverHeight: "compact",
      overlayEnabled: false,
      overlayOpacity: 30,
    },
    offers: {
      ...seeded.offers,
      columns: 2,
      layout: "grid",
      cardOrientation: "vertical",
      imageRatio: "16/10",
    },
    about: {
      ...seeded.about,
      imagePlacement: "none",
    },
    sections: orderedSections(
      ["hero", "offers", "about", "hours", "contact", "practical", "gallery", "social", "map", "footer"],
      { gallery: false, social: false, map: false },
    ),
  };
}

function orderedSections(
  order: StorefrontSectionId[],
  enabled: Partial<Record<StorefrontSectionId, boolean>> = {},
): StorefrontConfig["sections"] {
  const rest = STOREFRONT_SECTION_IDS.filter((id) => !order.includes(id));
  return [...order, ...rest].map((id) => ({
    id,
    enabled: enabled[id] ?? true,
  }));
}
