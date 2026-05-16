import type { PageSectionType } from "@/src/lib/public-page/page-sections";
import type { PageBlockId, PublicPageEditorConfig } from "@/src/lib/public-page/editor-config";
import type { PageSectionLayoutItem } from "@/src/lib/public-page/page-section-structure";

export type SectionRegistryEntry = {
  type: PageSectionType;
  label: string;
  description: string;
  /** Toujours présente sur la page publique. */
  required: boolean;
  /** Affichée dans la liste drag & drop (navigation reste fixe). */
  sortable: boolean;
  /** Peut être ajoutée via « Ajouter une section ». */
  optional: boolean;
  /** Activée par défaut pour un nouveau restaurant. */
  defaultEnabled: boolean;
  /** Bloc legacy `public_page_editor_config` associé (rendu default). */
  blockId?: PageBlockId;
};

export const SECTION_REGISTRY: Record<PageSectionType, SectionRegistryEntry> = {
  navigation: {
    type: "navigation",
    label: "Navigation",
    description: "Liens d’ancrage en haut de page.",
    required: true,
    sortable: false,
    optional: false,
    defaultEnabled: true,
  },
  hero: {
    type: "hero",
    label: "Hero",
    description: "Bannière d’accueil et accroche principale.",
    required: true,
    sortable: true,
    optional: false,
    defaultEnabled: true,
  },
  concept: {
    type: "concept",
    label: "Concept",
    description: "Présentation du restaurant.",
    required: false,
    sortable: true,
    optional: true,
    defaultEnabled: true,
    blockId: "about",
  },
  highlights: {
    type: "highlights",
    label: "Points forts",
    description: "Bandeau de highlights.",
    required: false,
    sortable: true,
    optional: true,
    defaultEnabled: false,
    blockId: "highlights",
  },
  menu_documents: {
    type: "menu_documents",
    label: "Documents menu",
    description: "Liens PDF / cartes téléchargeables.",
    required: false,
    sortable: true,
    optional: true,
    defaultEnabled: false,
    blockId: "menu",
  },
  menu_offers: {
    type: "menu_offers",
    label: "Menu / offres",
    description: "Mise en avant des plats et formules.",
    required: false,
    sortable: true,
    optional: true,
    defaultEnabled: true,
    blockId: "menu",
  },
  reservation_shell: {
    type: "reservation_shell",
    label: "Réservation",
    description: "Formulaire de réservation intégré.",
    required: true,
    sortable: true,
    optional: false,
    defaultEnabled: true,
    blockId: "reservation",
  },
  gallery: {
    type: "gallery",
    label: "Galerie",
    description: "Photos du lieu et des plats.",
    required: false,
    sortable: true,
    optional: true,
    defaultEnabled: true,
    blockId: "gallery",
  },
  reviews: {
    type: "reviews",
    label: "Avis & crédibilité",
    description: "Notes Google et presse.",
    required: false,
    sortable: true,
    optional: true,
    defaultEnabled: true,
    blockId: "reviews",
  },
  gift_vouchers: {
    type: "gift_vouchers",
    label: "Bons cadeaux",
    description: "Demande de bon cadeau.",
    required: false,
    sortable: true,
    optional: true,
    defaultEnabled: false,
    blockId: "gift_vouchers",
  },
  final_cta: {
    type: "final_cta",
    label: "Rappel final",
    description: "Bandeau de conversion en bas de page.",
    required: false,
    sortable: true,
    optional: true,
    defaultEnabled: true,
    blockId: "final_cta",
  },
  practical: {
    type: "practical",
    label: "Infos pratiques",
    description: "Adresse, horaires, contact.",
    required: false,
    sortable: true,
    optional: true,
    defaultEnabled: true,
    blockId: "location",
  },
};

const BLOCK_TO_SECTION: Partial<Record<PageBlockId, PageSectionType>> = {
  about: "concept",
  highlights: "highlights",
  menu: "menu_offers",
  reservation: "reservation_shell",
  gallery: "gallery",
  reviews: "reviews",
  gift_vouchers: "gift_vouchers",
  final_cta: "final_cta",
  hours: "practical",
  location: "practical",
};

const SECTION_TO_BLOCK: Partial<Record<PageSectionType, PageBlockId>> = {
  concept: "about",
  highlights: "highlights",
  menu_offers: "menu",
  menu_documents: "menu",
  reservation_shell: "reservation",
  gallery: "gallery",
  reviews: "reviews",
  gift_vouchers: "gift_vouchers",
  final_cta: "final_cta",
  practical: "location",
};

export function sectionTypeToBlockId(type: PageSectionType): PageBlockId | undefined {
  return SECTION_TO_BLOCK[type];
}

export function blockIdToSectionType(id: PageBlockId): PageSectionType | undefined {
  return BLOCK_TO_SECTION[id];
}

export function getSectionMeta(type: PageSectionType): SectionRegistryEntry {
  return SECTION_REGISTRY[type];
}

export function listSortableSectionTypes(): PageSectionType[] {
  return (Object.values(SECTION_REGISTRY) as SectionRegistryEntry[])
    .filter((e) => e.sortable)
    .map((e) => e.type);
}

export function listAddableSectionTypes(activeTypes: PageSectionType[]): PageSectionType[] {
  const active = new Set(activeTypes);
  return (Object.values(SECTION_REGISTRY) as SectionRegistryEntry[])
    .filter((e) => e.optional && e.sortable && !active.has(e.type))
    .map((e) => e.type);
}

/** État activé d’un bloc legacy dérivé de `restaurant_page_sections` (prioritaire). */
export function isBlockEnabledInStructure(
  structure: PageSectionLayoutItem[],
  blockId: PageBlockId,
  fallbackConfig: PublicPageEditorConfig,
): boolean {
  const type = blockIdToSectionType(blockId);
  if (type) {
    const item = structure.find((i) => i.sectionType === type);
    if (item) return item.enabled;
  }
  if (blockId === "hours" || blockId === "location") {
    const practical = structure.find((i) => i.sectionType === "practical");
    if (practical) return practical.enabled;
  }
  return fallbackConfig.blocks[blockId]?.enabled !== false;
}
