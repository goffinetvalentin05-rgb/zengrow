import { isGiftCardsEnabled, isGiftVouchersBlockId } from "@/src/lib/config/features";
import type { PageBlockId, PublicPageEditorConfig } from "@/src/lib/public-page/editor-config";
import type { OpeningHours } from "@/src/lib/utils";

export type PageGoal = "reservations" | "menu" | "ambiance" | "terrace_event" | "simple_direct";
export type PersuasionStyle = "direct" | "premium" | "warm" | "fast";
export type StructureTemplate =
  | "social_showroom"
  | "premium_experience"
  | "warm_restaurant"
  | "modern_brasserie"
  | "event_venue"
  | "minimal_conversion"
  | "conversion_direct"
  | "premium"
  | "mobile_fast"
  | "ambiance_experience";
export type CtaPlacement = "top_only" | "top_middle" | "full";

export type ConversionSettings = {
  pageGoal: PageGoal;
  persuasionStyle: PersuasionStyle;
  structureTemplate: StructureTemplate;
  ctaPlacement: CtaPlacement;
  stickyMobile: boolean;
};

export const STRUCTURE_TEMPLATES: {
  id: StructureTemplate;
  label: string;
  description: string;
  order: PageBlockId[];
}[] = [
  {
    id: "social_showroom",
    label: "Showroom social",
    description:
      "Conversion sociale — ambiance et photos d'abord, réservation en fin de parcours avec CTA immédiat.",
    order: [
      "gallery",
      "menu",
      "hours",
      "location",
      "about",
      "reviews",
      "reservation",
      "final_cta",
      "highlights",
      "gift_vouchers",
      "social",
    ],
  },
  {
    id: "premium_experience",
    label: "Expérience premium",
    description: "Immersive et éditoriale — storytelling avant la réservation.",
    order: [
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
    ],
  },
  {
    id: "warm_restaurant",
    label: "Restaurant chaleureux",
    description: "Convivial et accueillant — photos et points forts en avant.",
    order: [
      "highlights",
      "about",
      "gallery",
      "reservation",
      "menu",
      "reviews",
      "location",
      "hours",
      "gift_vouchers",
      "final_cta",
      "social",
    ],
  },
  {
    id: "modern_brasserie",
    label: "Brasserie moderne",
    description: "Direct et efficace — menu et horaires en avant.",
    order: [
      "reservation",
      "menu",
      "hours",
      "gallery",
      "about",
      "reviews",
      "location",
      "gift_vouchers",
      "final_cta",
      "social",
    ],
  },
  {
    id: "event_venue",
    label: "Événementiel & groupes",
    description: "Offres / formules mises en avant pour groupes et événements.",
    order: [
      "menu",
      "about",
      "gallery",
      "reservation",
      "reviews",
      "location",
      "hours",
      "gift_vouchers",
      "final_cta",
      "social",
    ],
  },
  {
    id: "minimal_conversion",
    label: "Minimal conversion",
    description: "Page courte et directe pour réserver vite.",
    order: [
      "reservation",
      "menu",
      "hours",
      "location",
      "gift_vouchers",
      "final_cta",
      "about",
      "gallery",
      "reviews",
      "social",
    ],
  },
];

export const PAGE_GOAL_OPTIONS: { id: PageGoal; label: string }[] = [
  { id: "reservations", label: "Maximiser les réservations" },
  { id: "menu", label: "Mettre en avant le menu" },
  { id: "ambiance", label: "Mettre en avant l'ambiance" },
  { id: "terrace_event", label: "Terrasse / événementiel" },
  { id: "simple_direct", label: "Page simple et directe" },
];

export const PERSUASION_OPTIONS: { id: PersuasionStyle; label: string }[] = [
  { id: "direct", label: "Direct — CTA très présent" },
  { id: "premium", label: "Premium — visuel immersif" },
  { id: "warm", label: "Chaleureux — convivialité" },
  { id: "fast", label: "Rapide — page courte" },
];

export const CTA_PLACEMENT_OPTIONS: { id: CtaPlacement; label: string }[] = [
  { id: "top_only", label: "CTA en haut uniquement" },
  { id: "top_middle", label: "CTA en haut + milieu de page" },
  { id: "full", label: "CTA en haut + sticky mobile + fin de page" },
];

export const RECOMMENDED_BLOCKS: PageBlockId[] = [
  "trust",
  "reservation",
  "highlights",
  "gallery",
  "final_cta",
];

export const SECTION_DISABLE_WARNINGS: Partial<Record<PageBlockId, string>> = {
  trust: "Les points forts et la preuve sociale rassurent vos visiteurs avant de réserver.",
  reservation: "Sans réservation visible, vous perdez l'objectif principal de la page.",
  highlights: "Les points forts aident à convaincre en quelques secondes.",
  gallery: "Des photos immersives donnent envie et réduisent les abandons.",
  final_cta: "Un rappel en fin de page augmente les réservations.",
  menu: "Ajoutez votre menu pour éviter que les visiteurs quittent la page.",
};

const LEGACY_TEMPLATE_MAP: Record<string, StructureTemplate> = {
  conversion_direct: "minimal_conversion",
  premium: "premium_experience",
  mobile_fast: "social_showroom",
  ambiance_experience: "social_showroom",
};

export function defaultConversionSettings(): ConversionSettings {
  return {
    pageGoal: "reservations",
    persuasionStyle: "premium",
    structureTemplate: "social_showroom",
    ctaPlacement: "full",
    stickyMobile: true,
  };
}

export function normalizeConversionSettings(raw: unknown): ConversionSettings {
  const base = defaultConversionSettings();
  if (!raw || typeof raw !== "object") return base;
  const o = raw as Partial<ConversionSettings>;
  return {
    pageGoal:
      o.pageGoal === "menu" ||
      o.pageGoal === "ambiance" ||
      o.pageGoal === "terrace_event" ||
      o.pageGoal === "simple_direct"
        ? o.pageGoal
        : "reservations",
    persuasionStyle:
      o.persuasionStyle === "premium" || o.persuasionStyle === "warm" || o.persuasionStyle === "fast"
        ? o.persuasionStyle
        : "direct",
    structureTemplate:
      STRUCTURE_TEMPLATES.some((t) => t.id === o.structureTemplate)
        ? (o.structureTemplate as StructureTemplate)
        : LEGACY_TEMPLATE_MAP[o.structureTemplate as string] ?? base.structureTemplate,
    ctaPlacement:
      o.ctaPlacement === "top_only" || o.ctaPlacement === "top_middle" ? o.ctaPlacement : "full",
    stickyMobile: o.stickyMobile !== false,
  };
}

export function applyStructureTemplate(template: StructureTemplate): PageBlockId[] {
  const order =
    STRUCTURE_TEMPLATES.find((t) => t.id === template)?.order ?? STRUCTURE_TEMPLATES[0].order;
  // GIFT_CARDS feature flag — réactivable
  if (!isGiftCardsEnabled()) {
    return order.filter((id) => !isGiftVouchersBlockId(id));
  }
  return order;
}

export function resolveEffectiveSectionOrder(config: PublicPageEditorConfig): PageBlockId[] {
  const templateOrder = applyStructureTemplate(config.conversion.structureTemplate);
  const custom = config.sectionOrder.filter((id) => templateOrder.includes(id));
  const missing = templateOrder.filter((id) => !custom.includes(id));
  const merged = [...custom, ...missing];
  // GIFT_CARDS feature flag — réactivable
  if (!isGiftCardsEnabled()) {
    return merged.filter((id) => !isGiftVouchersBlockId(id));
  }
  return merged;
}

export function ctaFlags(conversion: ConversionSettings): {
  showSticky: boolean;
  showMiddle: boolean;
  showFinal: boolean;
} {
  if (conversion.ctaPlacement === "top_only") {
    return { showSticky: false, showMiddle: false, showFinal: true };
  }
  if (conversion.ctaPlacement === "top_middle") {
    return { showSticky: false, showMiddle: true, showFinal: true };
  }
  return {
    showSticky: conversion.stickyMobile,
    showMiddle: true,
    showFinal: true,
  };
}

export type ConversionScoreInput = {
  name: string;
  address: string;
  coverImageUrl: string;
  heroTitle: string;
  shortDescription: string;
  highlights: string[];
  galleryCount: number;
  menuUrl: string | null;
  menuMode: string | null;
  menuDocumentsCount: number;
  reservationEnabled: boolean;
  ctaLabel: string;
  openingHours: OpeningHours | null;
  googleRating?: number | null;
  reviewCount?: number | null;
};

export type ConversionRecommendation = {
  id: string;
  message: string;
  priority: "high" | "medium";
};

export function computeConversionScore(input: ConversionScoreInput): number {
  let score = 0;
  if (input.coverImageUrl.trim()) score += 12;
  if (input.heroTitle.trim() || input.name.trim()) score += 10;
  if (input.shortDescription.trim().length >= 40) score += 10;
  if (input.highlights.filter(Boolean).length >= 3) score += 12;
  else if (input.highlights.filter(Boolean).length >= 1) score += 6;
  if (input.galleryCount >= 3) score += 10;
  else if (input.galleryCount >= 1) score += 4;
  if (input.reservationEnabled && input.ctaLabel.trim()) score += 14;
  if (input.address.trim()) score += 8;
  if (hasConfiguredOpeningHours(input.openingHours)) score += 8;
  const hasMenu =
    Boolean(input.menuUrl?.trim()) || input.menuMode === "pdf" || input.menuDocumentsCount > 0;
  if (hasMenu) score += 8;
  if (input.googleRating && input.googleRating >= 4) score += 8;
  else if (input.reviewCount && input.reviewCount > 0) score += 4;
  return Math.min(100, score);
}

export function conversionRecommendations(
  input: ConversionScoreInput,
  conversion: ConversionSettings,
): ConversionRecommendation[] {
  const recs: ConversionRecommendation[] = [];
  if (!input.coverImageUrl.trim()) {
    recs.push({
      id: "hero_photo",
      message: "Ajoutez une photo principale pour capter l'attention en moins de 3 secondes.",
      priority: "high",
    });
  }
  if (!input.heroTitle.trim() && !input.name.trim()) {
    recs.push({
      id: "title",
      message: "Ajoutez un titre court qui donne envie de réserver.",
      priority: "high",
    });
  }
  if (!input.shortDescription.trim()) {
    recs.push({
      id: "description",
      message: "Une phrase courte sous le titre augmente la confiance et l'envie.",
      priority: "medium",
    });
  }
  if (input.highlights.filter(Boolean).length < 3) {
    recs.push({
      id: "highlights",
      message: "Ajoutez au moins 3 points forts pour rassurer vos visiteurs.",
      priority: "high",
    });
  }
  if (!input.reservationEnabled) {
    recs.push({
      id: "reservation",
      message: "Activez le bouton de réservation — c'est l'objectif de votre page.",
      priority: "high",
    });
  }
  if (
    !input.menuUrl?.trim() &&
    input.menuMode !== "pdf" &&
    input.menuDocumentsCount === 0 &&
    conversion.pageGoal === "menu"
  ) {
    recs.push({
      id: "menu",
      message: "Ajoutez votre menu pour éviter que les visiteurs quittent la page.",
      priority: "high",
    });
  } else if (!input.menuUrl?.trim() && input.menuDocumentsCount === 0 && input.menuMode !== "pdf") {
    recs.push({
      id: "menu_optional",
      message: "Ajoutez votre menu pour éviter que les visiteurs quittent la page.",
      priority: "medium",
    });
  }
  if (input.galleryCount < 3) {
    recs.push({
      id: "gallery",
      message: "Ajoutez 3 photos ou plus pour vendre l'ambiance du restaurant.",
      priority: "medium",
    });
  }
  if (conversion.ctaPlacement !== "full") {
    recs.push({
      id: "cta_full",
      message: "Activez le CTA sticky mobile + fin de page pour augmenter les réservations.",
      priority: "medium",
    });
  }
  if (!input.address.trim()) {
    recs.push({
      id: "address",
      message: "Indiquez votre adresse pour rassurer les visiteurs locaux.",
      priority: "medium",
    });
  }
  return recs.slice(0, 5);
}

export function experienceSectionTitle(city: string, persuasion: PersuasionStyle): string {
  const ville = city.trim() || "votre ville";
  if (persuasion === "premium") return `Une expérience gastronomique au cœur de ${ville}`;
  if (persuasion === "warm") return `Une ambiance chaleureuse à ${ville}`;
  if (persuasion === "fast") return `Votre prochain repas à ${ville}`;
  return `Une ambiance qui donne envie à ${ville}`;
}

export function reservationSectionTitle(): string {
  return "Réservez votre table";
}

export function hasConfiguredOpeningHours(openingHours: OpeningHours | null | undefined): boolean {
  if (!openingHours) return false;
  return Object.values(openingHours).some((ranges) => Array.isArray(ranges) && ranges.length > 0);
}
