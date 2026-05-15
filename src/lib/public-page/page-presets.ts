import type {
  PublicPageEditorConfig,
  HeroLayout,
  HeroHeightPreset,
  HeroAlign,
  PageBlockId,
} from "@/src/lib/public-page/editor-config";
import { parseEditorConfig } from "@/src/lib/public-page/editor-config";
import type {
  CtaPlacement,
  PageGoal,
  PersuasionStyle,
  StructureTemplate,
} from "@/src/lib/public-page/conversion";
import { applyStylePresetPalette } from "@/src/lib/public-page/preset-palettes";
import type { PublicStylePreset } from "@/src/lib/public-page/constants";

/**
 * Un "preset de page" est un modèle complet (style + structure + persuasion).
 * Cliquer sur une carte applique TOUS ces réglages d'un coup.
 * Les textes saisis par l'utilisateur (titre, sous-titre, concept, offres, etc.)
 * sont préservés autant que possible.
 */
export type PagePresetId = StructureTemplate;

export type PagePresetBlueprint = {
  id: PagePresetId;
  label: string;
  description: string;
  /** Style visuel par défaut (peut être changé ensuite par le restaurateur). */
  stylePreset: PublicStylePreset;
  pageGoal: PageGoal;
  persuasionStyle: PersuasionStyle;
  ctaPlacement: CtaPlacement;
  stickyMobile: boolean;
  hero: {
    height: HeroHeightPreset;
    layout: HeroLayout;
    align: HeroAlign;
    secondaryCtaEnabled: boolean;
    overlayEnabled: boolean;
    overlayOpacity: number;
  };
  reservationPosition: "default" | "after_hero" | "prominent";
  /** Texte de bouton hero par défaut (utilisé seulement si l'utilisateur n'a rien saisi). */
  defaultPrimaryCta: string;
  defaultSecondaryCta: string;
  defaultConceptTitle: string;
  defaultFinalCta: {
    title: string;
    subtitle: string;
    button: string;
  };
  /** Bloc -> activé/désactivé par défaut. Seuls les blocs explicitement listés sont touchés. */
  blocks: Partial<Record<PageBlockId, boolean>>;
  /** Ordre des sections (utilisé pour positionner about, gallery, menu, reservation, reviews, final_cta, etc.). */
  sectionOrder: PageBlockId[];
  /** Style galerie par défaut. */
  galleryStyle: "grid" | "showcase" | "instagram";
};

export const PAGE_PRESETS: PagePresetBlueprint[] = [
  {
    id: "premium_experience",
    label: "Expérience premium",
    description: "Immersive et éditoriale — storytelling avant la réservation.",
    stylePreset: "elegant",
    pageGoal: "ambiance",
    persuasionStyle: "premium",
    ctaPlacement: "full",
    stickyMobile: true,
    hero: {
      height: "immersive",
      layout: "overlay",
      align: "left",
      secondaryCtaEnabled: true,
      overlayEnabled: true,
      overlayOpacity: 45,
    },
    reservationPosition: "default",
    defaultPrimaryCta: "Réserver une table",
    defaultSecondaryCta: "Découvrir la carte",
    defaultConceptTitle: "Notre expérience",
    defaultFinalCta: {
      title: "Vivez l'expérience",
      subtitle: "Réservez votre table pour découvrir notre cuisine et notre ambiance.",
      button: "Réserver une table",
    },
    blocks: {
      about: true,
      gallery: true,
      menu: true,
      reservation: true,
      reviews: true,
      location: true,
      social: true,
      final_cta: true,
      hours: true,
      highlights: false,
      trust: false,
    },
    sectionOrder: [
      "about",
      "gallery",
      "menu",
      "reservation",
      "reviews",
      "hours",
      "location",
      "social",
      "final_cta",
    ],
    galleryStyle: "showcase",
  },
  {
    id: "warm_restaurant",
    label: "Restaurant chaleureux",
    description: "Convivial et accueillant — photos et points forts en avant.",
    stylePreset: "warm",
    pageGoal: "reservations",
    persuasionStyle: "warm",
    ctaPlacement: "top_middle",
    stickyMobile: true,
    hero: {
      height: "normal",
      layout: "overlay",
      align: "center",
      secondaryCtaEnabled: true,
      overlayEnabled: true,
      overlayOpacity: 40,
    },
    reservationPosition: "default",
    defaultPrimaryCta: "Réserver une table",
    defaultSecondaryCta: "Voir le menu",
    defaultConceptTitle: "Notre maison",
    defaultFinalCta: {
      title: "À bientôt à table",
      subtitle: "Réservez en quelques clics — nous nous occupons du reste.",
      button: "Réserver une table",
    },
    blocks: {
      about: true,
      gallery: true,
      menu: true,
      reservation: true,
      reviews: true,
      location: true,
      social: true,
      final_cta: true,
      hours: true,
      highlights: true,
      trust: false,
    },
    sectionOrder: [
      "highlights",
      "about",
      "gallery",
      "reservation",
      "menu",
      "reviews",
      "location",
      "hours",
      "final_cta",
      "social",
    ],
    galleryStyle: "showcase",
  },
  {
    id: "modern_brasserie",
    label: "Brasserie moderne",
    description: "Direct et efficace — menu, horaires et réservation accessibles.",
    stylePreset: "modern",
    pageGoal: "reservations",
    persuasionStyle: "direct",
    ctaPlacement: "top_middle",
    stickyMobile: true,
    hero: {
      height: "compact",
      layout: "center",
      align: "center",
      secondaryCtaEnabled: true,
      overlayEnabled: true,
      overlayOpacity: 35,
    },
    reservationPosition: "after_hero",
    defaultPrimaryCta: "Réserver une table",
    defaultSecondaryCta: "Voir le menu",
    defaultConceptTitle: "À propos",
    defaultFinalCta: {
      title: "Une envie de table ?",
      subtitle: "Réservez en ligne en quelques secondes.",
      button: "Réserver maintenant",
    },
    blocks: {
      about: true,
      gallery: true,
      menu: true,
      reservation: true,
      reviews: true,
      location: true,
      social: true,
      final_cta: true,
      hours: true,
      highlights: false,
      trust: false,
    },
    sectionOrder: [
      "reservation",
      "menu",
      "hours",
      "gallery",
      "about",
      "reviews",
      "location",
      "final_cta",
      "social",
    ],
    galleryStyle: "grid",
  },
  {
    id: "event_venue",
    label: "Événementiel & groupes",
    description: "Mise en avant des offres et formules pour groupes et événements.",
    stylePreset: "elegant",
    pageGoal: "terrace_event",
    persuasionStyle: "premium",
    ctaPlacement: "full",
    stickyMobile: true,
    hero: {
      height: "normal",
      layout: "overlay",
      align: "left",
      secondaryCtaEnabled: true,
      overlayEnabled: true,
      overlayOpacity: 45,
    },
    reservationPosition: "default",
    defaultPrimaryCta: "Demander un devis",
    defaultSecondaryCta: "Voir les formules",
    defaultConceptTitle: "Nos formules & événements",
    defaultFinalCta: {
      title: "Organisez votre événement",
      subtitle:
        "Anniversaires, repas d'affaires, mariages : nous adaptons l'expérience à votre demande.",
      button: "Nous contacter",
    },
    blocks: {
      about: true,
      gallery: true,
      menu: true,
      reservation: true,
      reviews: true,
      location: true,
      social: true,
      final_cta: true,
      hours: true,
      highlights: true,
      trust: false,
    },
    sectionOrder: [
      "menu",
      "about",
      "gallery",
      "reservation",
      "reviews",
      "location",
      "hours",
      "final_cta",
      "social",
    ],
    galleryStyle: "showcase",
  },
  {
    id: "minimal_conversion",
    label: "Minimal conversion",
    description: "Page courte et directe pour réserver vite.",
    stylePreset: "minimal",
    pageGoal: "simple_direct",
    persuasionStyle: "fast",
    ctaPlacement: "full",
    stickyMobile: true,
    hero: {
      height: "compact",
      layout: "center",
      align: "center",
      secondaryCtaEnabled: false,
      overlayEnabled: true,
      overlayOpacity: 30,
    },
    reservationPosition: "after_hero",
    defaultPrimaryCta: "Réserver maintenant",
    defaultSecondaryCta: "Voir le menu",
    defaultConceptTitle: "Le restaurant",
    defaultFinalCta: {
      title: "Réservez votre table",
      subtitle: "En quelques secondes.",
      button: "Réserver",
    },
    blocks: {
      about: false,
      gallery: false,
      menu: true,
      reservation: true,
      reviews: false,
      location: true,
      social: false,
      final_cta: true,
      hours: true,
      highlights: false,
      trust: false,
    },
    sectionOrder: [
      "reservation",
      "menu",
      "hours",
      "location",
      "final_cta",
      "about",
      "gallery",
      "reviews",
      "social",
    ],
    galleryStyle: "grid",
  },
];

export function getPagePresetBlueprint(id: PagePresetId | string | null | undefined): PagePresetBlueprint | null {
  if (!id) return null;
  return PAGE_PRESETS.find((p) => p.id === id) ?? null;
}

/**
 * Applique un preset de page de façon non destructive :
 * - structure, style, hero, CTA, persuasion, blocs activés, sectionOrder => écrasés (c'est le rôle du preset)
 * - textes saisis (hero.title, hero.subtitle, concept.title, concept.body, offers, etc.) => préservés
 */
export function applyPagePreset(
  current: PublicPageEditorConfig,
  presetId: PagePresetId,
): PublicPageEditorConfig {
  const preset = getPagePresetBlueprint(presetId);
  if (!preset) return current;

  const palette = applyStylePresetPalette(
    preset.stylePreset,
    current.appearance.primaryColor,
    current.appearance.secondaryColor,
  );

  // On copie les blocs existants, puis on applique les overrides du preset.
  const nextBlocks = { ...current.blocks };
  for (const [blockId, enabled] of Object.entries(preset.blocks) as [PageBlockId, boolean][]) {
    nextBlocks[blockId] = {
      ...(current.blocks[blockId] ?? { variant: "inherit", width: "contained" }),
      enabled,
    };
  }

  // Préservation des textes existants
  const heroTitle = current.hero.title;
  const heroSubtitle = current.hero.subtitle;
  const heroBadge = current.hero.badgeText;
  const heroPrimaryCta = current.hero.primaryCta?.trim() || preset.defaultPrimaryCta;
  const heroSecondaryCta = current.hero.secondaryCta?.trim() || preset.defaultSecondaryCta;

  const conceptTitle = current.premium.concept.title?.trim() || preset.defaultConceptTitle;
  const conceptBody = current.premium.concept.body;
  const conceptImage = current.premium.concept.imageUrl;
  const conceptPillars = current.premium.concept.pillars;

  const finalCtaTitle =
    current.blockContent.finalCta.title?.trim() || preset.defaultFinalCta.title;
  const finalCtaSubtitle =
    current.blockContent.finalCta.subtitle?.trim() || preset.defaultFinalCta.subtitle;
  const finalCtaButton =
    current.blockContent.finalCta.button?.trim() || preset.defaultFinalCta.button;

  return parseEditorConfig({
    ...current,
    hero: {
      ...current.hero,
      title: heroTitle,
      subtitle: heroSubtitle,
      badgeText: heroBadge,
      primaryCta: heroPrimaryCta,
      secondaryCta: heroSecondaryCta,
      secondaryCtaEnabled: preset.hero.secondaryCtaEnabled,
      height: preset.hero.height,
      layout: preset.hero.layout,
      align: preset.hero.align,
      overlayEnabled: preset.hero.overlayEnabled,
      overlayOpacity: preset.hero.overlayOpacity,
    },
    appearance: {
      ...current.appearance,
      stylePreset: preset.stylePreset,
      primaryColor: palette.primaryColor,
      secondaryColor: palette.secondaryColor,
      accentColor: palette.accentColor,
      textColor: palette.textColor,
      headingColor: palette.headingColor,
      backgroundColor: palette.backgroundColor,
      surfaceColor: palette.surfaceColor,
      footerBgColor: palette.footerBgColor,
      footerTextColor: palette.footerTextColor,
      headingFont: palette.headingFont,
      bodyFont: palette.bodyFont,
      buttonTextColor: palette.buttonTextColor,
      themeMode: palette.themeMode,
    },
    blocks: nextBlocks,
    blockContent: {
      ...current.blockContent,
      finalCta: {
        title: finalCtaTitle,
        subtitle: finalCtaSubtitle,
        button: finalCtaButton,
      },
    },
    sectionOrder: preset.sectionOrder,
    reservation: {
      ...current.reservation,
      position: preset.reservationPosition,
    },
    conversion: {
      structureTemplate: preset.id,
      pageGoal: preset.pageGoal,
      persuasionStyle: preset.persuasionStyle,
      ctaPlacement: preset.ctaPlacement,
      stickyMobile: preset.stickyMobile,
    },
    premium: {
      ...current.premium,
      concept: {
        ...current.premium.concept,
        title: conceptTitle,
        body: conceptBody,
        imageUrl: conceptImage,
        pillars: conceptPillars,
      },
      gallery: { style: preset.galleryStyle },
    },
  });
}

/**
 * Indique si l'application d'un preset risque d'écraser du contenu personnalisé.
 * (Utilisé pour décider d'afficher ou non une confirmation.)
 *
 * Le preset n'écrase JAMAIS les textes ; on retourne true uniquement pour signaler
 * que la structure et le style visuel vont vraiment changer.
 */
export function pagePresetHasMeaningfulImpact(
  current: PublicPageEditorConfig,
  presetId: PagePresetId,
): boolean {
  const preset = getPagePresetBlueprint(presetId);
  if (!preset) return false;
  if (current.conversion.structureTemplate !== preset.id) return true;
  if (current.appearance.stylePreset !== preset.stylePreset) return true;
  if (current.hero.height !== preset.hero.height) return true;
  if (current.hero.layout !== preset.hero.layout) return true;
  if (current.conversion.ctaPlacement !== preset.ctaPlacement) return true;
  if (current.conversion.persuasionStyle !== preset.persuasionStyle) return true;
  return false;
}
