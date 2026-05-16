import type { SupabaseClient } from "@supabase/supabase-js";

/** Clés persistées dans `restaurant_page_sections.section_type`. */
export const PAGE_SECTION_TYPES = [
  "navigation",
  "hero",
  "concept",
  "highlights",
  "menu_offers",
  "gallery",
  "reviews",
  "gift_vouchers",
  "final_cta",
  "practical",
  "reservation_shell",
  "menu_documents",
] as const;

export type PageSectionType = (typeof PAGE_SECTION_TYPES)[number];

export type NavLinkContent = {
  anchorId: string;
  label: string;
};

export type NavigationSectionData = {
  items: NavLinkContent[];
  /** Libellé du lien ancrage bons cadeaux (injecté entre menu et le reste). */
  giftNavLabel?: string;
};

export type HeroSectionCopy = {
  scriptLineFallback?: string;
  scrollHintLabel?: string;
  discoverConceptLabel?: string;
};

export type ConceptSectionCopy = {
  eyebrow?: string;
  imageStampLabel?: string;
};

export type HighlightsSectionCopy = {
  eyebrow?: string;
};

export type MenuOffersSectionCopy = {
  eyebrow?: string;
  title?: string;
  pdfButtonLabel?: string;
};

export type GallerySectionCopy = {
  eyebrow?: string;
  /** Galerie premium (mosaïque) — un seul titre. */
  title?: string;
  /** Thème default : titre si lien Instagram affiché. */
  titleIfInstagram?: string;
  /** Thème default : titre sans Instagram. */
  titleIfNoInstagram?: string;
  instagramLinkLabel?: string;
};

export type ReviewsSectionCopy = {
  googleReviewsSuffix?: string;
  googleCtaLabel?: string;
  pressHeading?: string;
  tripAdvisorLabel?: string;
};

export type GiftVouchersSectionCopy = {
  surfaceEyebrow?: string;
  modalEyebrow?: string;
  modalTitle?: string;
  submitLabel?: string;
  submittingLabel?: string;
  successTitle?: string;
  successBody?: string;
  fallbackTitle?: string;
  fallbackBody?: string;
  fallbackCta?: string;
};

export type FinalCtaSectionCopy = {
  eyebrow?: string;
};

export type PracticalSectionCopy = {
  eyebrow?: string;
  title?: string;
  labelAddress?: string;
  labelPhone?: string;
  labelHours?: string;
  labelParking?: string;
  labelAccessibility?: string;
  directionsLabel?: string;
};

export type ReservationShellCopy = {
  eyebrow?: string;
  phonePreferLabel?: string;
};

export type MenuDocumentsSectionCopy = {
  eyebrow?: string;
  title?: string;
  linkPrefix?: string;
  linkOpen?: string;
};

/** Données éditoriales par section (séparées du rendu thème). */
export type PageSectionContentV1 = {
  navigation?: NavigationSectionData;
  hero?: HeroSectionCopy;
  concept?: ConceptSectionCopy;
  highlights?: HighlightsSectionCopy;
  menu_offers?: MenuOffersSectionCopy;
  gallery?: GallerySectionCopy;
  reviews?: ReviewsSectionCopy;
  gift_vouchers?: GiftVouchersSectionCopy;
  final_cta?: FinalCtaSectionCopy;
  practical?: PracticalSectionCopy;
  reservation_shell?: ReservationShellCopy;
  menu_documents?: MenuDocumentsSectionCopy;
};

export type RestaurantPageSectionRow = {
  restaurant_id: string;
  section_type: PageSectionType;
  sort_index: number;
  enabled: boolean;
  layout_variant?: string | null;
  data: Record<string, unknown>;
};

function isNonEmptyObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v) && Object.keys(v as object).length > 0;
}

export function mergePageSectionContent(
  base: PageSectionContentV1,
  patch: PageSectionContentV1 | undefined,
): PageSectionContentV1 {
  if (!patch) return { ...base };
  const out: PageSectionContentV1 = { ...base };
  (Object.keys(patch) as (keyof PageSectionContentV1)[]).forEach((k) => {
    const pv = patch[k];
    if (pv === undefined) return;
    const bv = base[k];
    if (
      bv !== undefined &&
      pv !== undefined &&
      typeof bv === "object" &&
      typeof pv === "object" &&
      !Array.isArray(bv) &&
      !Array.isArray(pv)
    ) {
      (out as Record<string, unknown>)[k] = { ...bv, ...pv };
    } else {
      (out as Record<string, unknown>)[k] = pv;
    }
  });
  return out;
}

const SECTION_SORT: Record<PageSectionType, number> = {
  navigation: 0,
  hero: 1,
  highlights: 5,
  concept: 10,
  menu_documents: 15,
  menu_offers: 20,
  reservation_shell: 25,
  gallery: 30,
  reviews: 35,
  gift_vouchers: 40,
  final_cta: 45,
  practical: 50,
};

/** Sérialise le bundle vers des lignes DB (upsert). */
export function bundleToSectionRows(
  restaurantId: string,
  sections: PageSectionContentV1,
): (Omit<RestaurantPageSectionRow, "restaurant_id"> & { restaurant_id: string })[] {
  const rows: (Omit<RestaurantPageSectionRow, "restaurant_id"> & { restaurant_id: string })[] = [];
  const push = (section_type: PageSectionType, data: Record<string, unknown>) => {
    if (!isNonEmptyObject(data)) return;
    rows.push({
      restaurant_id: restaurantId,
      section_type,
      sort_index: SECTION_SORT[section_type],
      enabled: true,
      data,
    });
  };

  if (sections.navigation?.items?.length) {
    push("navigation", sections.navigation as unknown as Record<string, unknown>);
  }
  if (sections.hero && isNonEmptyObject(sections.hero)) {
    push("hero", sections.hero as unknown as Record<string, unknown>);
  }
  if (sections.concept && isNonEmptyObject(sections.concept)) {
    push("concept", sections.concept as unknown as Record<string, unknown>);
  }
  if (sections.highlights && isNonEmptyObject(sections.highlights)) {
    push("highlights", sections.highlights as unknown as Record<string, unknown>);
  }
  if (sections.menu_offers && isNonEmptyObject(sections.menu_offers)) {
    push("menu_offers", sections.menu_offers as unknown as Record<string, unknown>);
  }
  if (sections.gallery && isNonEmptyObject(sections.gallery)) {
    push("gallery", sections.gallery as unknown as Record<string, unknown>);
  }
  if (sections.reviews && isNonEmptyObject(sections.reviews)) {
    push("reviews", sections.reviews as unknown as Record<string, unknown>);
  }
  if (sections.gift_vouchers && isNonEmptyObject(sections.gift_vouchers)) {
    push("gift_vouchers", sections.gift_vouchers as unknown as Record<string, unknown>);
  }
  if (sections.final_cta && isNonEmptyObject(sections.final_cta)) {
    push("final_cta", sections.final_cta as unknown as Record<string, unknown>);
  }
  if (sections.practical && isNonEmptyObject(sections.practical)) {
    push("practical", sections.practical as unknown as Record<string, unknown>);
  }
  if (sections.reservation_shell && isNonEmptyObject(sections.reservation_shell)) {
    push("reservation_shell", sections.reservation_shell as unknown as Record<string, unknown>);
  }
  if (sections.menu_documents && isNonEmptyObject(sections.menu_documents)) {
    push("menu_documents", sections.menu_documents as unknown as Record<string, unknown>);
  }
  return rows;
}

function asNavigationData(raw: Record<string, unknown>): NavigationSectionData | undefined {
  const items = raw.items;
  if (!Array.isArray(items)) return undefined;
  const out: NavLinkContent[] = [];
  for (const x of items) {
    if (!x || typeof x !== "object") continue;
    const o = x as Record<string, unknown>;
    const anchorId = typeof o.anchorId === "string" ? o.anchorId : "";
    const label = typeof o.label === "string" ? o.label : "";
    if (anchorId && label) out.push({ anchorId, label });
  }
  const giftNavLabel = typeof raw.giftNavLabel === "string" ? raw.giftNavLabel : undefined;
  if (out.length === 0) return undefined;
  return giftNavLabel ? { items: out, giftNavLabel } : { items: out };
}

/** Reconstruit le bundle depuis les lignes Supabase. */
export function rowsToPageSectionBundle(
  rows: { section_type: string; enabled: boolean; data: Record<string, unknown> }[],
): PageSectionContentV1 {
  const bundle: PageSectionContentV1 = {};
  for (const row of rows) {
    if (!row.enabled) continue;
    const t = row.section_type as PageSectionType;
    if (!PAGE_SECTION_TYPES.includes(t)) continue;
    const d = row.data ?? {};
    switch (t) {
      case "navigation": {
        const nav = asNavigationData(d);
        if (nav) bundle.navigation = nav;
        break;
      }
      case "hero":
        bundle.hero = d as unknown as HeroSectionCopy;
        break;
      case "concept":
        bundle.concept = d as unknown as ConceptSectionCopy;
        break;
      case "highlights":
        bundle.highlights = d as unknown as HighlightsSectionCopy;
        break;
      case "menu_offers":
        bundle.menu_offers = d as unknown as MenuOffersSectionCopy;
        break;
      case "gallery":
        bundle.gallery = d as unknown as GallerySectionCopy;
        break;
      case "reviews":
        bundle.reviews = d as unknown as ReviewsSectionCopy;
        break;
      case "gift_vouchers":
        bundle.gift_vouchers = d as unknown as GiftVouchersSectionCopy;
        break;
      case "final_cta":
        bundle.final_cta = d as unknown as FinalCtaSectionCopy;
        break;
      case "practical":
        bundle.practical = d as unknown as PracticalSectionCopy;
        break;
      case "reservation_shell":
        bundle.reservation_shell = d as unknown as ReservationShellCopy;
        break;
      case "menu_documents":
        bundle.menu_documents = d as unknown as MenuDocumentsSectionCopy;
        break;
      default:
        break;
    }
  }
  return bundle;
}

export function buildPublicNavLinks(
  nav: NavigationSectionData | undefined,
  showGiftVouchers: boolean,
): NavLinkContent[] {
  const items = nav?.items ?? [];
  const giftLabel = nav?.giftNavLabel?.trim() || "Cadeaux";
  if (!showGiftVouchers) return [...items];
  const gift: NavLinkContent = { anchorId: "bons-cadeaux", label: giftLabel };
  if (items.length <= 4) return [...items, gift];
  return [...items.slice(0, 4), gift, ...items.slice(4)];
}

export async function syncRestaurantPageSections(
  supabase: SupabaseClient,
  restaurantId: string,
  sections: PageSectionContentV1 | undefined,
): Promise<{ error: string | null }> {
  if (!sections) return { error: null };
  const rows = bundleToSectionRows(restaurantId, sections);
  if (rows.length === 0) return { error: null };
  const { error } = await supabase.from("restaurant_page_sections").upsert(rows, {
    onConflict: "restaurant_id,section_type",
  });
  return { error: error?.message ?? null };
}
