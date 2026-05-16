import type { ThemeSectionVariantCatalog } from "@/src/lib/themes/sections/types";

export const PREMIUM_DARK_SECTION_VARIANTS: ThemeSectionVariantCatalog = {
  concept: {
    defaultVariant: "image-right",
    variants: [
      { id: "image-right", label: "Image à droite", description: "Texte à gauche, visuel à droite." },
      { id: "image-left", label: "Image à gauche", description: "Visuel en premier, texte à droite." },
      { id: "stacked", label: "Empilé", description: "Titre et texte centrés, sans colonne image." },
    ],
  },
  menu_offers: {
    defaultVariant: "editorial-list",
    variants: [
      {
        id: "editorial-list",
        label: "Liste éditoriale",
        description: "Plats en alternance texte / photo avec pointillés.",
      },
      {
        id: "grid-photos",
        label: "Grille photos",
        description: "Cartes en grille avec photo de chaque plat.",
      },
      {
        id: "split-categories",
        label: "Split catégories",
        description: "Titre à gauche, liste des plats à droite.",
      },
    ],
  },
  gallery: {
    defaultVariant: "masonry",
    variants: [
      { id: "masonry", label: "Mosaïque", description: "Disposition type Pinterest." },
      { id: "grid-uniform", label: "Grille uniforme", description: "Grille régulière 2–3 colonnes." },
      { id: "showcase-row", label: "Bandeau", description: "Grandes images en bandeau horizontal." },
    ],
  },
};
