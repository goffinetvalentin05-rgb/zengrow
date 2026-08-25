import { createClient } from "@/src/lib/supabase/server";
import type { OpeningHours } from "@/src/lib/utils";

export type PublicRestaurantRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  phone: string | null;
  address: string | null;
  email: string | null;
  city: string | null;
  cuisine_type: string | null;
  logo_url: string | null;
  banner_url: string | null;
  primary_color: string | null;
  subscription_plan?: string | null;
  subscription_status?: string | null;
  trial_end_date?: string | null;
  stripe_subscription_id?: string | null;
  page_background_color: string | null;
  hero_primary_color: string | null;
  public_button_bg_color: string | null;
  public_button_text_color: string | null;
  public_heading_text_color: string | null;
  public_body_text_color: string | null;
  public_accent_color: string | null;
  public_footer_bg_color: string | null;
  public_footer_text_color: string | null;
  public_heading_font: string | null;
  public_body_font: string | null;
  public_hero_title_size_px: number | null;
  public_display_name: string | null;
  public_tagline: string | null;
  public_description: string | null;
  public_hero_title: string | null;
  public_cta_label: string | null;
  public_hero_height: string | null;
  public_hero_overlay_enabled: boolean | null;
  public_hero_overlay_opacity: number | null;
  public_ambiance: string | null;
  public_page_status: string | null;
  public_seo_title: string | null;
  public_seo_description: string | null;
  google_maps_url: string | null;
  tiktok_url: string | null;
  show_public_instagram: boolean | null;
  show_public_facebook: boolean | null;
  show_public_google_maps: boolean | null;
  theme_id?: string | null;
  theme_overrides?: unknown;
};

export type PublicSettingsRow = {
  opening_hours: OpeningHours;
  reservation_mode?: string | null;
  max_party_size: number;
  time_slots_max_party_size?: number | null;
  reservation_slot_interval: number;
  allow_phone: boolean;
  allow_email: boolean;
  logo_url: string | null;
  cover_image_url: string | null;
  accent_color: string | null;
  button_color: string | null;
  text_color: string | null;
  heading_font: string | null;
  body_font: string | null;
  font_size_scale: string | null;
  border_radius: string | null;
  button_style: string | null;
  card_style: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  website_url: string | null;
  pre_booking_message: string | null;
  closure_start_date: string | null;
  closure_end_date: string | null;
  closure_message: string | null;
  public_page_description: string | null;
  gallery_image_urls: string[];
  featured_gallery_index: number;
  public_highlights: unknown;
  special_message: string | null;
  public_menu_mode: string | null;
  public_menu_url: string | null;
  public_reservation_enabled: boolean;
  min_booking_lead_minutes: number;
  no_slots_message: string | null;
  show_hours_before_form: boolean;
  show_phone_cta: boolean;
  public_page_show_address: boolean;
  public_page_show_phone: boolean;
  public_page_show_email: boolean;
  public_page_show_website: boolean;
  public_page_show_opening_hours: boolean;
  days_in_advance: number;
  terrace_enabled: boolean;
  terrace_capacity: number;
  terrace_label: string;
  public_page_editor_config?: unknown;
  gift_voucher_suggested_amounts?: number[] | null;
};

const RESTAURANT_SELECT = [
  "id",
  "name",
  "slug",
  "description",
  "phone",
  "address",
  "email",
  "city",
  "cuisine_type",
  "logo_url",
  "banner_url",
  "primary_color",
  "subscription_plan",
  "subscription_status",
  "trial_end_date",
  "stripe_subscription_id",
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
  "public_display_name",
  "public_tagline",
  "public_description",
  "public_hero_title",
  "public_cta_label",
  "public_hero_height",
  "public_hero_overlay_enabled",
  "public_hero_overlay_opacity",
  "public_ambiance",
  "public_page_status",
  "public_seo_title",
  "public_seo_description",
  "google_maps_url",
  "tiktok_url",
  "show_public_instagram",
  "show_public_facebook",
  "show_public_google_maps",
  "theme_id",
  "theme_overrides",
].join(", ");

const SETTINGS_SELECT = [
  "opening_hours",
  "reservation_mode",
  "reservation_slot_interval",
  "max_party_size",
  "time_slots_max_party_size",
  "allow_phone",
  "allow_email",
  "logo_url",
  "cover_image_url",
  "accent_color",
  "button_color",
  "text_color",
  "heading_font",
  "body_font",
  "font_size_scale",
  "border_radius",
  "button_style",
  "card_style",
  "instagram_url",
  "facebook_url",
  "website_url",
  "pre_booking_message",
  "closure_start_date",
  "closure_end_date",
  "closure_message",
  "public_page_description",
  "gallery_image_urls",
  "featured_gallery_index",
  "public_highlights",
  "special_message",
  "public_menu_mode",
  "public_menu_url",
  "public_reservation_enabled",
  "min_booking_lead_minutes",
  "no_slots_message",
  "show_hours_before_form",
  "show_phone_cta",
  "public_page_show_address",
  "public_page_show_phone",
  "public_page_show_email",
  "public_page_show_website",
  "public_page_show_opening_hours",
  "days_in_advance",
  "terrace_enabled",
  "terrace_capacity",
  "terrace_label",
  "public_page_editor_config",
  "gift_voucher_suggested_amounts",
].join(", ");

export async function loadRestaurant(slug: string) {
  const supabase = await createClient();
  const { data: restaurantRaw, error } = await supabase
    .from("restaurants")
    .select(RESTAURANT_SELECT)
    .eq("slug", slug)
    .single();

  if (error || !restaurantRaw) return null;
  const restaurant = restaurantRaw as unknown as PublicRestaurantRow;

  if (restaurant.public_page_status === "draft") {
    return null;
  }

  const settingsResult = await supabase
    .from("restaurant_settings")
    .select(SETTINGS_SELECT)
    .eq("restaurant_id", restaurant.id)
    .single();
  let settings = settingsResult.data;
  if (settingsResult.error) {
    const fallback = await supabase
      .from("restaurant_settings")
      .select(SETTINGS_SELECT.replace(", gift_voucher_suggested_amounts", ""))
      .eq("restaurant_id", restaurant.id)
      .single();
    settings = fallback.data;
  }

  const { data: documents } = await supabase
    .from("restaurant_documents")
    .select("id, label, file_url, position, created_at")
    .eq("restaurant_id", restaurant.id)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  const { data: pageSectionRows } = await supabase
    .from("restaurant_page_sections")
    .select("section_type, sort_index, enabled, layout_variant, data")
    .eq("restaurant_id", restaurant.id);

  return {
    restaurant,
    settings: (settings ?? null) as PublicSettingsRow | null,
    documents: documents ?? [],
    pageSectionRows: pageSectionRows ?? [],
  };
}
