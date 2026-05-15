import { createClient } from "@/src/lib/supabase/server";
import { getDefaultOpeningHours, type OpeningHours } from "@/src/lib/utils";
import { buildPublicPageSettingsInitial } from "@/src/lib/public-page/build-initial";
import { rowsToPageSectionBundle } from "@/src/lib/public-page/page-sections";
import type { PublicPageSettingsInitial } from "@/src/components/dashboard/public-page/public-page-settings-panel";

export type DashboardPublicPageData = {
  publicLink: string;
  initial: PublicPageSettingsInitial;
};

export async function loadDashboardPublicPage(
  restaurantId: string,
  restaurant: {
    id: string;
    name: string;
    slug: string;
    phone: string | null;
    email: string | null;
    address: string | null;
  },
  publicLink: string,
): Promise<DashboardPublicPageData> {
  const supabase = await createClient();

  const { data: settings } = await supabase
    .from("restaurant_settings")
    .select(
      "opening_hours, max_party_size, website_url, logo_url, cover_image_url, instagram_url, facebook_url, pre_booking_message, public_page_description, gallery_image_urls, featured_gallery_index, public_highlights, special_message, public_menu_mode, public_menu_url, public_reservation_enabled, min_booking_lead_minutes, no_slots_message, show_hours_before_form, show_phone_cta, public_page_show_address, public_page_show_phone, public_page_show_email, public_page_show_website, public_page_show_opening_hours, accent_color, button_color, text_color, heading_font, body_font, font_size_scale, border_radius, button_style, card_style, terrace_enabled, public_page_editor_config",
    )
    .eq("restaurant_id", restaurantId)
    .single();

  const { data: restaurantConfigRaw } = await supabase
    .from("restaurants")
    .select(
      [
        "primary_color",
        "logo_url",
        "banner_url",
        "page_background_color",
        "hero_primary_color",
        "public_button_bg_color",
        "public_button_text_color",
        "public_heading_text_color",
        "public_body_text_color",
        "public_accent_color",
        "public_footer_bg_color",
        "public_footer_text_color",
        "public_heading_font",
        "public_body_font",
        "public_hero_title_size_px",
        "public_tagline",
        "public_description",
        "public_cta_label",
        "public_hero_height",
        "public_hero_overlay_enabled",
        "public_hero_overlay_opacity",
        "google_maps_url",
        "tiktok_url",
        "city",
        "cuisine_type",
        "public_secondary_color",
        "public_style_preset",
        "public_ambiance",
        "public_hero_title",
        "public_seo_title",
        "public_seo_description",
        "public_page_status",
        "public_page_published_at",
        "public_page_draft_updated_at",
        "show_public_instagram",
        "show_public_facebook",
        "show_public_google_maps",
        "theme_id",
        "theme_overrides",
      ].join(", "),
    )
    .eq("id", restaurantId)
    .single();

  const rc = restaurantConfigRaw as Record<string, unknown> | null;

  const { data: documents } = await supabase
    .from("restaurant_documents")
    .select("id, label, file_url, position")
    .eq("restaurant_id", restaurantId)
    .order("position", { ascending: true });

  const openingHours =
    (settings?.opening_hours as OpeningHours | undefined) ?? getDefaultOpeningHours();

  const safeSettings = settings ?? {
    website_url: "",
    logo_url: "",
    cover_image_url: "",
    instagram_url: "",
    facebook_url: "",
    pre_booking_message: "",
    public_page_description: "",
    gallery_image_urls: [] as string[],
    featured_gallery_index: 0,
    public_highlights: [] as string[],
    special_message: "",
    public_menu_mode: null,
    public_menu_url: "",
    public_reservation_enabled: true,
    min_booking_lead_minutes: 0,
    no_slots_message: "",
    show_hours_before_form: true,
    show_phone_cta: true,
    public_page_show_address: true,
    public_page_show_phone: true,
    public_page_show_email: true,
    public_page_show_website: true,
    public_page_show_opening_hours: true,
    max_party_size: 8,
    accent_color: "#1A6B50",
    button_color: "#1A6B50",
    text_color: "#334155",
    heading_font: "Playfair Display",
    body_font: "Inter",
    font_size_scale: "medium",
    border_radius: "rounded",
    button_style: "filled",
    card_style: "elevated",
    terrace_enabled: false,
    public_page_editor_config: null,
  };

  const { data: sectionRows } = await supabase
    .from("restaurant_page_sections")
    .select("section_type, enabled, data")
    .eq("restaurant_id", restaurantId);

  const pageSectionsFromDb = rowsToPageSectionBundle(sectionRows ?? []);

  const initial = buildPublicPageSettingsInitial(
    {
      id: restaurant.id,
      name: restaurant.name,
      slug: restaurant.slug,
      city: (rc?.city as string | null) ?? null,
      cuisine_type: (rc?.cuisine_type as string | null) ?? null,
      phone: restaurant.phone,
      email: restaurant.email,
      address: restaurant.address,
      primary_color: (rc?.primary_color as string | null) ?? null,
      logo_url: (rc?.logo_url as string | null) ?? null,
      banner_url: (rc?.banner_url as string | null) ?? null,
      page_background_color: (rc?.page_background_color as string | null) ?? null,
      hero_primary_color: (rc?.hero_primary_color as string | null) ?? null,
      public_secondary_color: (rc?.public_secondary_color as string | null) ?? null,
      public_style_preset: (rc?.public_style_preset as string | null) ?? null,
      public_ambiance: (rc?.public_ambiance as string | null) ?? null,
      public_hero_title: (rc?.public_hero_title as string | null) ?? null,
      public_tagline: (rc?.public_tagline as string | null) ?? null,
      public_description: (rc?.public_description as string | null) ?? null,
      public_cta_label: (rc?.public_cta_label as string | null) ?? null,
      public_button_bg_color: (rc?.public_button_bg_color as string | null) ?? null,
      public_button_text_color: (rc?.public_button_text_color as string | null) ?? null,
      public_heading_text_color: (rc?.public_heading_text_color as string | null) ?? null,
      public_body_text_color: (rc?.public_body_text_color as string | null) ?? null,
      public_accent_color: (rc?.public_accent_color as string | null) ?? null,
      public_footer_bg_color: (rc?.public_footer_bg_color as string | null) ?? null,
      public_footer_text_color: (rc?.public_footer_text_color as string | null) ?? null,
      public_heading_font: (rc?.public_heading_font as string | null) ?? null,
      public_body_font: (rc?.public_body_font as string | null) ?? null,
      public_hero_title_size_px: (rc?.public_hero_title_size_px as number | null) ?? null,
      public_hero_height: (rc?.public_hero_height as string | null) ?? null,
      public_hero_overlay_enabled: (rc?.public_hero_overlay_enabled as boolean | null) ?? null,
      public_hero_overlay_opacity: (rc?.public_hero_overlay_opacity as number | null) ?? null,
      google_maps_url: (rc?.google_maps_url as string | null) ?? null,
      tiktok_url: (rc?.tiktok_url as string | null) ?? null,
      public_seo_title: (rc?.public_seo_title as string | null) ?? null,
      public_seo_description: (rc?.public_seo_description as string | null) ?? null,
      public_page_status: (rc?.public_page_status as string | null) ?? null,
      public_page_published_at: (rc?.public_page_published_at as string | null) ?? null,
      public_page_draft_updated_at: (rc?.public_page_draft_updated_at as string | null) ?? null,
      show_public_instagram: (rc?.show_public_instagram as boolean | null) ?? null,
      show_public_facebook: (rc?.show_public_facebook as boolean | null) ?? null,
      show_public_google_maps: (rc?.show_public_google_maps as boolean | null) ?? null,
      theme_id: (rc?.theme_id as string | null) ?? null,
      theme_overrides: (rc?.theme_overrides as unknown) ?? null,
    },
    safeSettings,
    openingHours,
    (documents ?? []).map((d) => ({
      id: d.id,
      label: d.label,
      fileUrl: d.file_url,
      position: d.position ?? 0,
    })),
    pageSectionsFromDb,
  );

  return { publicLink, initial };
}
