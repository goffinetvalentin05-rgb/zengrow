import type { PublicPageSettingsInitial } from "@/src/components/dashboard/public-page/public-page-settings-panel";
import type { PublicAmbiance, PublicStylePreset } from "@/src/lib/public-page/constants";
import { DEFAULT_PRIMARY, DEFAULT_SECONDARY } from "@/src/lib/public-page/colors";
import type { OpeningHours } from "@/src/lib/utils";

type RestaurantRow = {
  id: string;
  name: string;
  slug: string;
  city?: string | null;
  cuisine_type?: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  primary_color?: string | null;
  logo_url?: string | null;
  banner_url?: string | null;
  page_background_color?: string | null;
  hero_primary_color?: string | null;
  public_secondary_color?: string | null;
  public_style_preset?: string | null;
  public_ambiance?: string | null;
  public_hero_title?: string | null;
  public_tagline?: string | null;
  public_description?: string | null;
  public_cta_label?: string | null;
  public_button_bg_color?: string | null;
  public_button_text_color?: string | null;
  public_heading_text_color?: string | null;
  public_body_text_color?: string | null;
  public_accent_color?: string | null;
  public_footer_bg_color?: string | null;
  public_footer_text_color?: string | null;
  public_heading_font?: string | null;
  public_body_font?: string | null;
  public_hero_title_size_px?: number | null;
  public_hero_height?: string | null;
  public_hero_overlay_enabled?: boolean | null;
  public_hero_overlay_opacity?: number | null;
  google_maps_url?: string | null;
  tiktok_url?: string | null;
  public_seo_title?: string | null;
  public_seo_description?: string | null;
  public_page_status?: string | null;
  public_page_published_at?: string | null;
  public_page_draft_updated_at?: string | null;
  show_public_instagram?: boolean | null;
  show_public_facebook?: boolean | null;
  show_public_google_maps?: boolean | null;
};

type SettingsRow = {
  logo_url: string | null;
  cover_image_url: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  website_url: string | null;
  pre_booking_message: string | null;
  public_page_description: string | null;
  gallery_image_urls: string[] | null;
  featured_gallery_index?: number | null;
  public_highlights?: unknown;
  special_message?: string | null;
  public_menu_mode?: string | null;
  public_menu_url?: string | null;
  public_reservation_enabled?: boolean | null;
  min_booking_lead_minutes?: number | null;
  no_slots_message?: string | null;
  show_hours_before_form?: boolean | null;
  show_phone_cta?: boolean | null;
  accent_color: string | null;
  button_color: string | null;
  text_color?: string | null;
  heading_font?: string | null;
  body_font?: string | null;
  font_size_scale?: string | null;
  border_radius?: string | null;
  button_style?: string | null;
  card_style?: string | null;
  public_page_show_address?: boolean | null;
  public_page_show_phone?: boolean | null;
  public_page_show_email?: boolean | null;
  public_page_show_website?: boolean | null;
  public_page_show_opening_hours?: boolean | null;
  max_party_size?: number | null;
  terrace_enabled?: boolean | null;
  public_page_editor_config?: unknown;
};

function parseHighlights(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((x): x is string => typeof x === "string").slice(0, 3);
}

function asStylePreset(v: string | null | undefined): PublicStylePreset | null {
  if (
    v === "elegant" ||
    v === "modern" ||
    v === "warm" ||
    v === "minimal" ||
    v === "premium_dark"
  )
    return v;
  return null;
}

function asAmbiance(v: string | null | undefined): PublicAmbiance | null {
  const ids = [
    "gastronomic",
    "family",
    "bistro",
    "italian",
    "asian",
    "cafe_brunch",
    "bar_lounge",
    "other",
  ] as const;
  return ids.includes(v as PublicAmbiance) ? (v as PublicAmbiance) : null;
}

export function buildPublicPageSettingsInitial(
  restaurant: RestaurantRow,
  settings: SettingsRow,
  openingHours: OpeningHours,
  menuDocuments: { id: string; label: string; fileUrl: string; position: number }[],
): PublicPageSettingsInitial {
  const heroHeight = (restaurant.public_hero_height as "compact" | "normal" | "tall") || "compact";

  return {
    restaurantId: restaurant.id,
    name: restaurant.name,
    slug: restaurant.slug,
    city: restaurant.city ?? "",
    cuisineType: restaurant.cuisine_type ?? "",
    address: restaurant.address ?? "",
    phone: restaurant.phone ?? "",
    email: restaurant.email ?? "",
    websiteUrl: settings.website_url ?? "",
    googleMapsUrl: restaurant.google_maps_url ?? "",
    instagramUrl: settings.instagram_url ?? "",
    facebookUrl: settings.facebook_url ?? "",
    tiktokUrl: restaurant.tiktok_url ?? "",
    primaryColor: restaurant.primary_color ?? DEFAULT_PRIMARY,
    secondaryColor: restaurant.public_secondary_color ?? DEFAULT_SECONDARY,
    stylePreset: asStylePreset(restaurant.public_style_preset),
    ambiance: asAmbiance(restaurant.public_ambiance),
    heroTitle: restaurant.public_hero_title ?? "",
    heroSubtitle: restaurant.public_tagline ?? "",
    shortDescription:
      restaurant.public_description?.trim() || settings.public_page_description?.trim() || "",
    highlights: parseHighlights(settings.public_highlights),
    specialMessage: settings.special_message ?? "",
    logoUrl: settings.logo_url ?? restaurant.logo_url ?? "",
    coverImageUrl: settings.cover_image_url ?? restaurant.banner_url ?? "",
    galleryUrls: (settings.gallery_image_urls ?? []).filter(Boolean),
    featuredGalleryIndex: settings.featured_gallery_index ?? 0,
    menuMode: settings.public_menu_mode === "url" || settings.public_menu_mode === "pdf" ? settings.public_menu_mode : null,
    menuUrl: settings.public_menu_url ?? "",
    menuDocuments,
    ctaLabel: restaurant.public_cta_label?.trim() || "Réserver une table",
    reservationEnabled: settings.public_reservation_enabled !== false,
    preBookingMessage: settings.pre_booking_message ?? "",
    maxPartySize: settings.max_party_size ?? 8,
    minBookingLeadMinutes: settings.min_booking_lead_minutes ?? 0,
    noSlotsMessage: settings.no_slots_message ?? "",
    showHoursBeforeForm: settings.show_hours_before_form !== false,
    showPhoneCta: settings.show_phone_cta !== false,
    seoTitle: restaurant.public_seo_title ?? "",
    seoDescription: restaurant.public_seo_description ?? "",
    pageStatus: restaurant.public_page_status === "draft" ? "draft" : "published",
    publishedAt: restaurant.public_page_published_at ?? null,
    draftUpdatedAt: restaurant.public_page_draft_updated_at ?? null,
    showPublicInstagram: restaurant.show_public_instagram !== false,
    showPublicFacebook: restaurant.show_public_facebook !== false,
    showPublicGoogleMaps: restaurant.show_public_google_maps !== false,
    showPublicAddress: settings.public_page_show_address ?? true,
    showPublicPhone: settings.public_page_show_phone ?? true,
    showPublicEmail: settings.public_page_show_email ?? true,
    showPublicWebsite: settings.public_page_show_website ?? true,
    showPublicOpeningHours: settings.public_page_show_opening_hours ?? true,
    openingHours,
    pageBackgroundColor: restaurant.page_background_color ?? "#f8fafc",
    heroPrimaryColor: restaurant.hero_primary_color ?? restaurant.primary_color ?? "#12151c",
    accentColor: restaurant.public_accent_color ?? settings.accent_color ?? DEFAULT_PRIMARY,
    buttonColor: restaurant.public_button_bg_color ?? settings.button_color ?? DEFAULT_PRIMARY,
    buttonTextColor: restaurant.public_button_text_color ?? "#ffffff",
    headingTextColor: restaurant.public_heading_text_color ?? "#0f172a",
    bodyTextColor: restaurant.public_body_text_color ?? settings.text_color ?? "#334155",
    footerBgColor: restaurant.public_footer_bg_color ?? "#0f172a",
    footerTextColor: restaurant.public_footer_text_color ?? "#e2e8f0",
    headingFont: restaurant.public_heading_font ?? settings.heading_font ?? "Playfair Display",
    bodyFont: restaurant.public_body_font ?? settings.body_font ?? "Inter",
    heroTitleSizePx: restaurant.public_hero_title_size_px ?? 44,
    heroHeight,
    heroOverlayEnabled: restaurant.public_hero_overlay_enabled !== false,
    heroOverlayOpacity: restaurant.public_hero_overlay_opacity ?? 45,
    fontSizeScale: (settings.font_size_scale as "small" | "medium" | "large") ?? "medium",
    borderRadius: (settings.border_radius as "sharp" | "rounded" | "pill") ?? "rounded",
    buttonStyle: (settings.button_style as "filled" | "outlined" | "ghost") ?? "filled",
    cardStyle: (settings.card_style as "flat" | "elevated" | "bordered") ?? "elevated",
    terraceEnabled: settings.terrace_enabled === true,
    editorConfigRaw: settings.public_page_editor_config ?? {},
  };
}
