/**
 * Toggles d'affichage granulaires par section (`restaurant_page_sections.data.display`).
 * Défaut : tout visible (`true`) pour migration douce.
 */

export type LegacyContactDisplay = {
  showAddress?: boolean;
  showPhone?: boolean;
  showEmail?: boolean;
  showWebsite?: boolean;
  showOpeningHours?: boolean;
  showInstagram?: boolean;
  showFacebook?: boolean;
  showGoogleMaps?: boolean;
};

export type NavigationSectionDisplay = {
  showBar: boolean;
  showRestaurantName: boolean;
  showNavLinks: boolean;
  showReserveCta: boolean;
};

export type HeroSectionDisplay = {
  showCoverImage: boolean;
  showBadge: boolean;
  showLogo: boolean;
  showTitle: boolean;
  showTagline: boolean;
  showOpenStatus: boolean;
  showPhone: boolean;
  showPrimaryCta: boolean;
  showSecondaryCta: boolean;
  showScrollHint: boolean;
};

export type HighlightsSectionDisplay = {
  showEyebrow: boolean;
  showItems: boolean;
};

export type ConceptSectionDisplay = {
  showEyebrow: boolean;
  showTitle: boolean;
  showBody: boolean;
  showImage: boolean;
  showImageStamp: boolean;
  showPillars: boolean;
};

export type MenuDocumentsSectionDisplay = {
  showEyebrow: boolean;
  showTitle: boolean;
  showDocuments: boolean;
};

export type MenuOffersSectionDisplay = {
  showEyebrow: boolean;
  showTitle: boolean;
  showOffers: boolean;
  showOfferDescriptions: boolean;
  showOfferPrices: boolean;
  showOfferImages: boolean;
  showMenuPdfButton: boolean;
};

export type ReservationShellSectionDisplay = {
  showEyebrow: boolean;
  showTitle: boolean;
  showIntro: boolean;
  showGroupMessage: boolean;
  showHoursBlock: boolean;
  showPhoneAlt: boolean;
};

export type GallerySectionDisplay = {
  showEyebrow: boolean;
  showTitle: boolean;
  showPhotos: boolean;
  showInstagramLink: boolean;
};

export type ReviewsSectionDisplay = {
  showGoogleRating: boolean;
  showGoogleCta: boolean;
  showQuote: boolean;
  showPress: boolean;
  showTripAdvisor: boolean;
};

export type GiftVouchersSectionDisplay = {
  showEyebrow: boolean;
  showTitle: boolean;
  showBody: boolean;
  showImage: boolean;
  showCta: boolean;
};

export type FinalCtaSectionDisplay = {
  showEyebrow: boolean;
  showTitle: boolean;
  showSubtitle: boolean;
  showButton: boolean;
  showPhone: boolean;
};

export type PracticalSectionDisplay = {
  showEyebrow: boolean;
  showSectionTitle: boolean;
  showAddress: boolean;
  showDirections: boolean;
  showPhone: boolean;
  showEmail: boolean;
  showWebsite: boolean;
  showHours: boolean;
  showParking: boolean;
  showAccessibility: boolean;
  showInstagram: boolean;
  showFacebook: boolean;
  showTiktok: boolean;
  showSocialBar: boolean;
};

function mergeBooleanRecord<T extends Record<string, boolean>>(
  defaults: T,
  stored?: Partial<T>,
  legacy?: Partial<T>,
): T {
  const out = { ...defaults };
  (Object.keys(defaults) as (keyof T)[]).forEach((key) => {
    const sk = stored?.[key];
    if (typeof sk === "boolean") {
      (out as Record<keyof T, boolean>)[key] = sk;
      return;
    }
    const lk = legacy?.[key];
    if (typeof lk === "boolean") {
      (out as Record<keyof T, boolean>)[key] = lk;
    }
  });
  return out;
}

export const DEFAULT_NAVIGATION_DISPLAY: NavigationSectionDisplay = {
  showBar: true,
  showRestaurantName: true,
  showNavLinks: true,
  showReserveCta: true,
};

export const DEFAULT_HERO_DISPLAY: HeroSectionDisplay = {
  showCoverImage: true,
  showBadge: true,
  showLogo: true,
  showTitle: true,
  showTagline: true,
  showOpenStatus: true,
  showPhone: true,
  showPrimaryCta: true,
  showSecondaryCta: true,
  showScrollHint: true,
};

export const DEFAULT_HIGHLIGHTS_DISPLAY: HighlightsSectionDisplay = {
  showEyebrow: true,
  showItems: true,
};

export const DEFAULT_CONCEPT_DISPLAY: ConceptSectionDisplay = {
  showEyebrow: true,
  showTitle: true,
  showBody: true,
  showImage: true,
  showImageStamp: true,
  showPillars: true,
};

export const DEFAULT_MENU_DOCUMENTS_DISPLAY: MenuDocumentsSectionDisplay = {
  showEyebrow: true,
  showTitle: true,
  showDocuments: true,
};

export const DEFAULT_MENU_OFFERS_DISPLAY: MenuOffersSectionDisplay = {
  showEyebrow: true,
  showTitle: true,
  showOffers: true,
  showOfferDescriptions: true,
  showOfferPrices: true,
  showOfferImages: true,
  showMenuPdfButton: true,
};

export const DEFAULT_RESERVATION_SHELL_DISPLAY: ReservationShellSectionDisplay = {
  showEyebrow: true,
  showTitle: true,
  showIntro: true,
  showGroupMessage: true,
  showHoursBlock: true,
  showPhoneAlt: true,
};

export const DEFAULT_GALLERY_DISPLAY: GallerySectionDisplay = {
  showEyebrow: true,
  showTitle: true,
  showPhotos: true,
  showInstagramLink: true,
};

export const DEFAULT_REVIEWS_DISPLAY: ReviewsSectionDisplay = {
  showGoogleRating: true,
  showGoogleCta: true,
  showQuote: true,
  showPress: true,
  showTripAdvisor: true,
};

export const DEFAULT_GIFT_VOUCHERS_DISPLAY: GiftVouchersSectionDisplay = {
  showEyebrow: true,
  showTitle: true,
  showBody: true,
  showImage: true,
  showCta: true,
};

export const DEFAULT_FINAL_CTA_DISPLAY: FinalCtaSectionDisplay = {
  showEyebrow: true,
  showTitle: true,
  showSubtitle: true,
  showButton: true,
  showPhone: true,
};

export const DEFAULT_PRACTICAL_DISPLAY: PracticalSectionDisplay = {
  showEyebrow: true,
  showSectionTitle: true,
  showAddress: true,
  showDirections: true,
  showPhone: true,
  showEmail: true,
  showWebsite: true,
  showHours: true,
  showParking: true,
  showAccessibility: true,
  showInstagram: true,
  showFacebook: true,
  showTiktok: true,
  showSocialBar: true,
};

export function resolveNavigationDisplay(
  stored?: Partial<NavigationSectionDisplay>,
): NavigationSectionDisplay {
  return mergeBooleanRecord(DEFAULT_NAVIGATION_DISPLAY, stored);
}

export function resolveHeroDisplay(
  stored?: Partial<HeroSectionDisplay>,
  legacy?: { showPhone?: boolean; showSecondaryCta?: boolean },
): HeroSectionDisplay {
  return mergeBooleanRecord(DEFAULT_HERO_DISPLAY, stored, {
    showPhone: legacy?.showPhone,
    showSecondaryCta: legacy?.showSecondaryCta,
  });
}

export function resolveHighlightsDisplay(
  stored?: Partial<HighlightsSectionDisplay>,
): HighlightsSectionDisplay {
  return mergeBooleanRecord(DEFAULT_HIGHLIGHTS_DISPLAY, stored);
}

export function resolveConceptDisplay(
  stored?: Partial<ConceptSectionDisplay>,
): ConceptSectionDisplay {
  return mergeBooleanRecord(DEFAULT_CONCEPT_DISPLAY, stored);
}

export function resolveMenuDocumentsDisplay(
  stored?: Partial<MenuDocumentsSectionDisplay>,
): MenuDocumentsSectionDisplay {
  return mergeBooleanRecord(DEFAULT_MENU_DOCUMENTS_DISPLAY, stored);
}

export function resolveMenuOffersDisplay(
  stored?: Partial<MenuOffersSectionDisplay>,
): MenuOffersSectionDisplay {
  return mergeBooleanRecord(DEFAULT_MENU_OFFERS_DISPLAY, stored);
}

export function resolveReservationShellDisplay(
  stored?: Partial<ReservationShellSectionDisplay>,
  legacy?: { showHoursBlock?: boolean; showPhoneAlt?: boolean },
): ReservationShellSectionDisplay {
  return mergeBooleanRecord(DEFAULT_RESERVATION_SHELL_DISPLAY, stored, {
    showHoursBlock: legacy?.showHoursBlock,
    showPhoneAlt: legacy?.showPhoneAlt,
  });
}

export function resolveGalleryDisplay(
  stored?: Partial<GallerySectionDisplay>,
  legacy?: { showInstagramLink?: boolean },
): GallerySectionDisplay {
  return mergeBooleanRecord(DEFAULT_GALLERY_DISPLAY, stored, {
    showInstagramLink: legacy?.showInstagramLink,
  });
}

export function resolveReviewsDisplay(
  stored?: Partial<ReviewsSectionDisplay>,
): ReviewsSectionDisplay {
  return mergeBooleanRecord(DEFAULT_REVIEWS_DISPLAY, stored);
}

export function resolveGiftVouchersDisplay(
  stored?: Partial<GiftVouchersSectionDisplay>,
): GiftVouchersSectionDisplay {
  return mergeBooleanRecord(DEFAULT_GIFT_VOUCHERS_DISPLAY, stored);
}

export function resolveFinalCtaDisplay(
  stored?: Partial<FinalCtaSectionDisplay>,
  legacy?: { showPhone?: boolean },
): FinalCtaSectionDisplay {
  return mergeBooleanRecord(DEFAULT_FINAL_CTA_DISPLAY, stored, {
    showPhone: legacy?.showPhone,
  });
}

export function resolvePracticalDisplay(
  stored?: Partial<PracticalSectionDisplay>,
  legacy?: LegacyContactDisplay,
): PracticalSectionDisplay {
  return mergeBooleanRecord(DEFAULT_PRACTICAL_DISPLAY, stored, {
    showAddress: legacy?.showAddress,
    showPhone: legacy?.showPhone,
    showEmail: legacy?.showEmail,
    showWebsite: legacy?.showWebsite,
    showHours: legacy?.showOpeningHours,
    showDirections: legacy?.showGoogleMaps,
    showInstagram: legacy?.showInstagram,
    showFacebook: legacy?.showFacebook,
  });
}

/** Mappe `practical.display` vers les colonnes `restaurant_settings` / `restaurants`. */
export function practicalDisplayToLegacySettings(display: PracticalSectionDisplay): {
  public_page_show_address: boolean;
  public_page_show_phone: boolean;
  public_page_show_email: boolean;
  public_page_show_website: boolean;
  public_page_show_opening_hours: boolean;
  show_public_instagram: boolean;
  show_public_facebook: boolean;
  show_public_google_maps: boolean;
} {
  return {
    public_page_show_address: display.showAddress,
    public_page_show_phone: display.showPhone,
    public_page_show_email: display.showEmail,
    public_page_show_website: display.showWebsite,
    public_page_show_opening_hours: display.showHours,
    show_public_instagram: display.showInstagram,
    show_public_facebook: display.showFacebook,
    show_public_google_maps: display.showDirections,
  };
}

export function legacyContactToDisplayInput(legacy: LegacyContactDisplay): Partial<PracticalSectionDisplay> {
  return {
    showAddress: legacy.showAddress,
    showPhone: legacy.showPhone,
    showEmail: legacy.showEmail,
    showWebsite: legacy.showWebsite,
    showHours: legacy.showOpeningHours,
    showDirections: legacy.showGoogleMaps,
    showInstagram: legacy.showInstagram,
    showFacebook: legacy.showFacebook,
  };
}

export type DisplayToggleOption = {
  key: string;
  label: string;
  /** Masquer si la valeur source est vide (ex. réseau sans URL). */
  hideWhenEmpty?: boolean;
};

export const PRACTICAL_DISPLAY_TOGGLE_OPTIONS: DisplayToggleOption[] = [
  { key: "showSectionTitle", label: "Titre de section" },
  { key: "showEyebrow", label: "Surtitre" },
  { key: "showAddress", label: "Adresse" },
  { key: "showDirections", label: "Lien itinéraire (Google Maps)", hideWhenEmpty: true },
  { key: "showPhone", label: "Téléphone" },
  { key: "showEmail", label: "E-mail", hideWhenEmpty: true },
  { key: "showWebsite", label: "Site web", hideWhenEmpty: true },
  { key: "showHours", label: "Horaires" },
  { key: "showParking", label: "Parking", hideWhenEmpty: true },
  { key: "showAccessibility", label: "Accessibilité", hideWhenEmpty: true },
  { key: "showInstagram", label: "Instagram", hideWhenEmpty: true },
  { key: "showFacebook", label: "Facebook", hideWhenEmpty: true },
  { key: "showTiktok", label: "TikTok", hideWhenEmpty: true },
  { key: "showSocialBar", label: "Bandeau réseaux sociaux" },
];

export const HERO_DISPLAY_TOGGLE_OPTIONS: DisplayToggleOption[] = [
  { key: "showCoverImage", label: "Image de couverture", hideWhenEmpty: true },
  { key: "showBadge", label: "Badge / accroche" },
  { key: "showLogo", label: "Logo", hideWhenEmpty: true },
  { key: "showTitle", label: "Titre" },
  { key: "showTagline", label: "Sous-titre" },
  { key: "showOpenStatus", label: "Statut d'ouverture" },
  { key: "showPhone", label: "Téléphone" },
  { key: "showPrimaryCta", label: "Bouton « Réserver »" },
  { key: "showSecondaryCta", label: "Bouton secondaire (menu)" },
  { key: "showScrollHint", label: "Indication de défilement" },
];

export const CONCEPT_DISPLAY_TOGGLE_OPTIONS: DisplayToggleOption[] = [
  { key: "showEyebrow", label: "Surtitre" },
  { key: "showTitle", label: "Titre" },
  { key: "showBody", label: "Texte principal" },
  { key: "showImage", label: "Image", hideWhenEmpty: true },
  { key: "showImageStamp", label: "Cachet sous l'image" },
  { key: "showPillars", label: "Piliers / points clés" },
];

export const HIGHLIGHTS_DISPLAY_TOGGLE_OPTIONS: DisplayToggleOption[] = [
  { key: "showEyebrow", label: "Surtitre" },
  { key: "showItems", label: "Liste des points forts" },
];

export const MENU_OFFERS_DISPLAY_TOGGLE_OPTIONS: DisplayToggleOption[] = [
  { key: "showEyebrow", label: "Surtitre" },
  { key: "showTitle", label: "Titre de section" },
  { key: "showOffers", label: "Plats / offres" },
  { key: "showOfferImages", label: "Photos des plats" },
  { key: "showOfferDescriptions", label: "Descriptions" },
  { key: "showOfferPrices", label: "Prix" },
  { key: "showMenuPdfButton", label: "Bouton carte PDF", hideWhenEmpty: true },
];

export const GALLERY_DISPLAY_TOGGLE_OPTIONS: DisplayToggleOption[] = [
  { key: "showEyebrow", label: "Surtitre" },
  { key: "showTitle", label: "Titre" },
  { key: "showPhotos", label: "Photos" },
  { key: "showInstagramLink", label: "Lien Instagram", hideWhenEmpty: true },
];

export const REVIEWS_DISPLAY_TOGGLE_OPTIONS: DisplayToggleOption[] = [
  { key: "showGoogleRating", label: "Note Google" },
  { key: "showGoogleCta", label: "Lien avis Google" },
  { key: "showQuote", label: "Citation" },
  { key: "showPress", label: "Mentions presse" },
  { key: "showTripAdvisor", label: "TripAdvisor" },
];

export const RESERVATION_SHELL_DISPLAY_TOGGLE_OPTIONS: DisplayToggleOption[] = [
  { key: "showEyebrow", label: "Surtitre" },
  { key: "showTitle", label: "Titre" },
  { key: "showIntro", label: "Introduction" },
  { key: "showGroupMessage", label: "Message groupes" },
  { key: "showHoursBlock", label: "Encart horaires" },
  { key: "showPhoneAlt", label: "Lien téléphone sous le formulaire" },
];

export const FINAL_CTA_DISPLAY_TOGGLE_OPTIONS: DisplayToggleOption[] = [
  { key: "showEyebrow", label: "Surtitre" },
  { key: "showTitle", label: "Titre" },
  { key: "showSubtitle", label: "Sous-titre" },
  { key: "showButton", label: "Bouton réserver" },
  { key: "showPhone", label: "Téléphone" },
];

export const GIFT_VOUCHERS_DISPLAY_TOGGLE_OPTIONS: DisplayToggleOption[] = [
  { key: "showEyebrow", label: "Surtitre" },
  { key: "showTitle", label: "Titre" },
  { key: "showBody", label: "Texte" },
  { key: "showImage", label: "Image", hideWhenEmpty: true },
  { key: "showCta", label: "Bouton demande" },
];

export const MENU_DOCUMENTS_DISPLAY_TOGGLE_OPTIONS: DisplayToggleOption[] = [
  { key: "showEyebrow", label: "Surtitre" },
  { key: "showTitle", label: "Titre" },
  { key: "showDocuments", label: "Liens documents" },
];

export function practicalSectionHasVisibleContent(input: {
  display: PracticalSectionDisplay;
  eyebrow?: string;
  title?: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  websiteUrl?: string | null;
  openingHoursLines: string[];
  googleMapsUrl?: string | null;
  parking?: string;
  accessibility?: string;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  tiktokUrl?: string | null;
}): boolean {
  const d = input.display;
  const hasHeader =
    (d.showEyebrow && Boolean(input.eyebrow?.trim())) ||
    (d.showSectionTitle && Boolean(input.title?.trim()));
  const hasGrid =
    (d.showAddress && Boolean(input.address?.trim())) ||
    (d.showPhone && Boolean(input.phone?.trim())) ||
    (d.showEmail && Boolean(input.email?.trim())) ||
    (d.showWebsite && Boolean(input.websiteUrl?.trim())) ||
    (d.showHours && input.openingHoursLines.length > 0) ||
    (d.showParking && Boolean(input.parking?.trim())) ||
    (d.showAccessibility && Boolean(input.accessibility?.trim()));
  const hasSocial =
    d.showSocialBar &&
    ((d.showInstagram && Boolean(input.instagramUrl?.trim())) ||
      (d.showFacebook && Boolean(input.facebookUrl?.trim())) ||
      (d.showTiktok && Boolean(input.tiktokUrl?.trim())));
  return hasHeader || hasGrid || hasSocial;
}
