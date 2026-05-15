import type { StructureTemplate } from "@/src/lib/public-page/conversion";
import {
  mergePageSectionContent,
  type PageSectionContentV1,
} from "@/src/lib/public-page/page-sections";
import type { ThemeId } from "@/src/lib/themes/types";
import { defaultPageSectionsContent as defaultThemeContent } from "@/src/lib/themes/default/defaults";
import { defaultPageSectionsContent as premiumThemeContent } from "@/src/lib/themes/premium-dark/defaults";

export function themeBasePageSections(themeId: ThemeId): PageSectionContentV1 {
  return themeId === "default" ? defaultThemeContent() : premiumThemeContent();
}

function templateLayer(structureTemplate: StructureTemplate): PageSectionContentV1 {
  const conceptEyebrow =
    structureTemplate === "event_venue"
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
  if (structureTemplate === "premium_experience") galleryEyebrow = "Galerie";
  else if (structureTemplate === "warm_restaurant") galleryEyebrow = "Ambiance";
  else if (structureTemplate === "event_venue") galleryEyebrow = "Nos espaces";

  return {
    concept: { eyebrow: conceptEyebrow },
    menu_offers: menu,
    gallery: { eyebrow: galleryEyebrow },
  };
}

/**
 * Contenu éditorial final page publique : défauts thème + preset structure + surcouche BDD restaurant.
 */
export function resolvePublicPageSectionContent(
  visualThemeId: ThemeId,
  structureTemplate: StructureTemplate,
  dbBundle: PageSectionContentV1 | undefined,
): PageSectionContentV1 {
  let merged = themeBasePageSections(visualThemeId);
  merged = mergePageSectionContent(merged, templateLayer(structureTemplate));
  if (dbBundle) merged = mergePageSectionContent(merged, dbBundle);
  return merged;
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
