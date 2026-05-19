import type { StructureTemplate } from "@/src/lib/public-page/conversion";
import {
  mergePageSectionContent,
  type PageSectionContentV1,
} from "@/src/lib/public-page/page-sections";
import {
  type LegacyContactDisplay,
  resolveConceptDisplay,
  resolveFinalCtaDisplay,
  resolveGalleryDisplay,
  resolveGiftVouchersDisplay,
  resolveHeroDisplay,
  resolveHighlightsDisplay,
  resolveMenuDocumentsDisplay,
  resolveMenuOffersDisplay,
  resolveNavigationDisplay,
  resolvePracticalDisplay,
  resolveReservationShellDisplay,
  resolveReviewsDisplay,
} from "@/src/lib/public-page/section-display";
import type { ThemeId } from "@/src/lib/themes/types";
import { defaultPageSectionsContent as defaultThemeContent } from "@/src/lib/themes/default/defaults";
import { defaultPageSectionsContent as premiumThemeContent } from "@/src/lib/themes/premium-dark/defaults";

export type SectionDisplayLegacyHints = {
  contact?: LegacyContactDisplay;
  hero?: { showPhone?: boolean; showSecondaryCta?: boolean };
  reservation?: { showHoursBlock?: boolean; showPhoneAlt?: boolean };
  gallery?: { showInstagramLink?: boolean };
  finalCta?: { showPhone?: boolean };
};

export function themeBasePageSections(themeId: ThemeId): PageSectionContentV1 {
  return themeId === "default" ? defaultThemeContent() : premiumThemeContent();
}

function templateLayer(structureTemplate: StructureTemplate): PageSectionContentV1 {
  const conceptEyebrow =
    structureTemplate === "social_showroom"
      ? "L'expérience"
      : structureTemplate === "event_venue"
        ? "Notre maison"
        : "Le concept";

  let menu: PageSectionContentV1["menu_offers"] = { eyebrow: "Carte & offres", title: "Notre menu" };
  if (structureTemplate === "event_venue") {
    menu = { eyebrow: "Formules & menus", title: "Nos formules" };
  } else if (structureTemplate === "modern_brasserie") {
    menu = { eyebrow: "À la carte", title: "Notre menu" };
  } else if (structureTemplate === "minimal_conversion") {
    menu = { eyebrow: "Carte & offres", title: "Le menu" };
  }

  let galleryEyebrow = "En images";
  if (structureTemplate === "social_showroom") galleryEyebrow = "L'ambiance";
  else if (structureTemplate === "premium_experience") galleryEyebrow = "Galerie";
  else if (structureTemplate === "warm_restaurant") galleryEyebrow = "Ambiance";
  else if (structureTemplate === "event_venue") galleryEyebrow = "Nos espaces";

  return {
    concept: { eyebrow: conceptEyebrow },
    menu_offers: menu,
    gallery: { eyebrow: galleryEyebrow },
  };
}

/**
 * Applique les toggles `display` résolus (défaut true + surcouche BDD + legacy settings).
 */
export function applyResolvedSectionDisplays(
  content: PageSectionContentV1,
  legacy?: SectionDisplayLegacyHints,
): PageSectionContentV1 {
  const out: PageSectionContentV1 = { ...content };
  if (content.navigation) {
    out.navigation = {
      ...content.navigation,
      display: resolveNavigationDisplay(content.navigation.display),
    };
  }
  if (content.hero) {
    out.hero = {
      ...content.hero,
      display: resolveHeroDisplay(content.hero.display, legacy?.hero),
    };
  }
  if (content.highlights) {
    out.highlights = {
      ...content.highlights,
      display: resolveHighlightsDisplay(content.highlights.display),
    };
  }
  if (content.concept) {
    out.concept = {
      ...content.concept,
      display: resolveConceptDisplay(content.concept.display),
    };
  }
  if (content.menu_documents) {
    out.menu_documents = {
      ...content.menu_documents,
      display: resolveMenuDocumentsDisplay(content.menu_documents.display),
    };
  }
  if (content.menu_offers) {
    out.menu_offers = {
      ...content.menu_offers,
      display: resolveMenuOffersDisplay(content.menu_offers.display),
    };
  }
  if (content.reservation_shell) {
    out.reservation_shell = {
      ...content.reservation_shell,
      display: resolveReservationShellDisplay(content.reservation_shell.display, legacy?.reservation),
    };
  }
  if (content.gallery) {
    out.gallery = {
      ...content.gallery,
      display: resolveGalleryDisplay(content.gallery.display, legacy?.gallery),
    };
  }
  if (content.reviews) {
    out.reviews = {
      ...content.reviews,
      display: resolveReviewsDisplay(content.reviews.display),
    };
  }
  if (content.gift_vouchers) {
    out.gift_vouchers = {
      ...content.gift_vouchers,
      display: resolveGiftVouchersDisplay(content.gift_vouchers.display),
    };
  }
  if (content.final_cta) {
    out.final_cta = {
      ...content.final_cta,
      display: resolveFinalCtaDisplay(content.final_cta.display, legacy?.finalCta),
    };
  }
  if (content.practical) {
    out.practical = {
      ...content.practical,
      display: resolvePracticalDisplay(content.practical.display, legacy?.contact),
    };
  }
  return out;
}

/**
 * Contenu éditorial final page publique : défauts thème + preset structure + surcouche BDD restaurant.
 */
export function resolvePublicPageSectionContent(
  visualThemeId: ThemeId,
  structureTemplate: StructureTemplate,
  dbBundle: PageSectionContentV1 | undefined,
  legacy?: SectionDisplayLegacyHints,
): PageSectionContentV1 {
  let merged = themeBasePageSections(visualThemeId);
  merged = mergePageSectionContent(merged, templateLayer(structureTemplate));
  if (dbBundle) merged = mergePageSectionContent(merged, dbBundle);
  return applyResolvedSectionDisplays(merged, legacy);
}

/**
 * Ne garde que les champs qui diffèrent du contenu résolu par défaut (thème + gabarit),
 * pour ne pas persister toute la couche thème dans `restaurant_page_sections`.
 */
export function pageSectionsOverlayForPersistence(
  full: PageSectionContentV1,
  visualThemeId: ThemeId,
  structureTemplate: StructureTemplate,
): PageSectionContentV1 {
  const base = resolvePublicPageSectionContent(visualThemeId, structureTemplate, undefined);
  const out: PageSectionContentV1 = {};
  (Object.keys(full) as (keyof PageSectionContentV1)[]).forEach((k) => {
    const fv = full[k];
    if (fv === undefined) return;
    const bv = base[k];
    if (bv !== undefined && JSON.stringify(fv) === JSON.stringify(bv)) return;
    (out as Record<string, unknown>)[k] = fv;
  });
  return out;
}
