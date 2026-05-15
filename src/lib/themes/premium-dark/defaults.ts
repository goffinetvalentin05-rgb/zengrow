import type { PageSectionContentV1 } from "@/src/lib/public-page/page-sections";
import { mergePageSectionContent } from "@/src/lib/public-page/page-sections";
import { defaultPageSectionsContent as defaultBase } from "@/src/lib/themes/default/defaults";

/**
 * Thèmes premium (dark / elegant partagent la même couche contenu par défaut).
 * Seules les variations de libellés par rapport au thème default sont définies ici.
 */
export function defaultPageSectionsContent(): PageSectionContentV1 {
  return mergePageSectionContent(defaultBase(), {
    navigation: {
      items: [
        { anchorId: "accueil", label: "Accueil" },
        { anchorId: "concept", label: "Concept" },
        { anchorId: "menu", label: "Menu" },
        { anchorId: "reservation", label: "Réserver" },
        { anchorId: "infos", label: "Infos" },
        { anchorId: "contact", label: "Contact" },
      ],
      giftNavLabel: "Cadeaux",
    },
    hero: {
      scriptLineFallback: "Une expérience",
      scrollHintLabel: "scroll",
      discoverConceptLabel: "Découvrir le concept",
    },
    gallery: {
      eyebrow: "Galerie",
      title: "L’expérience",
      instagramLinkLabel: "Instagram",
    },
    menu_offers: {
      eyebrow: "Carte & offres",
      title: "Notre menu",
      pdfButtonLabel: "Voir la carte complète",
    },
  });
}
