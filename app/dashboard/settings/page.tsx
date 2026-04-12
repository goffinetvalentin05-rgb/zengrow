import SettingsForm from "@/src/components/dashboard/settings-form";
import { headers } from "next/headers";
import { requireRestaurant } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";

type DashboardRestaurantPublicConfig = {
  reservation_confirmation_mode: string | null;
  primary_color: string | null;
  logo_url: string | null;
  banner_url: string | null;
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
  public_cta_label: string | null;
  public_hero_height: string | null;
  public_hero_overlay_enabled: boolean | null;
  public_hero_overlay_opacity: number | null;
  google_maps_url: string | null;
  show_public_instagram: boolean | null;
  show_public_facebook: boolean | null;
  show_public_google_maps: boolean | null;
};

export default async function DashboardSettingsPage() {
  const supabase = await createClient();
  const restaurant = await requireRestaurant();
  const headerList = await headers();
  const host = headerList.get("host");
  const protocol = headerList.get("x-forwarded-proto") ?? "http";
  const publicLink = host ? `${protocol}://${host}/r/${restaurant.slug}` : `/r/${restaurant.slug}`;

  const { data: settings } = await supabase
    .from("restaurant_settings")
    .select(
      "reservation_duration, reservation_slot_interval, restaurant_capacity, max_covers_per_slot, max_party_size, use_tables, terrace_enabled, terrace_capacity, auto_archive_reservations, days_in_advance, accent_color, button_color, text_color, heading_font, body_font, font_size_scale, border_radius, button_style, card_style, logo_url, cover_image_url, instagram_url, facebook_url, website_url, pre_booking_message, closure_start_date, closure_end_date, closure_message, public_page_description, gallery_image_urls, public_page_show_address, public_page_show_phone, public_page_show_email, public_page_show_website, public_page_show_opening_hours",
    )
    .eq("restaurant_id", restaurant.id)
    .single();

  const { data: restaurantConfigRaw } = await supabase
    .from("restaurants")
    .select(
      [
        "reservation_confirmation_mode",
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
        "public_display_name",
        "public_tagline",
        "public_description",
        "public_cta_label",
        "public_hero_height",
        "public_hero_overlay_enabled",
        "public_hero_overlay_opacity",
        "google_maps_url",
        "show_public_instagram",
        "show_public_facebook",
        "show_public_google_maps",
      ].join(", "),
    )
    .eq("id", restaurant.id)
    .single();

  const restaurantConfig = restaurantConfigRaw as DashboardRestaurantPublicConfig | null;

  const { data: restaurantTablesRows } = await supabase
    .from("restaurant_tables")
    .select("id, name, min_covers, max_covers")
    .eq("restaurant_id", restaurant.id)
    .order("name", { ascending: true });

  const safeSettings = settings ?? {
    reservation_duration: 90,
    reservation_slot_interval: 30,
    restaurant_capacity: 40,
    max_covers_per_slot: 40,
    max_party_size: 8,
    use_tables: false,
    days_in_advance: 60,
    accent_color: "#1A6B50",
    button_color: "#1A6B50",
    text_color: "#111827",
    heading_font: "Playfair Display",
    body_font: "Inter",
    font_size_scale: "medium" as const,
    border_radius: "rounded" as const,
    button_style: "filled" as const,
    card_style: "elevated" as const,
    logo_url: "",
    cover_image_url: "",
    instagram_url: "",
    facebook_url: "",
    website_url: "",
    pre_booking_message: "",
    closure_start_date: null,
    closure_end_date: null,
    closure_message: "",
    public_page_description: "",
    gallery_image_urls: [] as string[],
    public_page_show_address: true,
    public_page_show_phone: true,
    public_page_show_email: true,
    public_page_show_website: true,
    public_page_show_opening_hours: true,
    terrace_enabled: false,
    terrace_capacity: 0,
    auto_archive_reservations: false,
  };

  return (
    <div className="space-y-10">
      <header className="border-b border-gray-100 pb-6">
        <h1 className="dashboard-section-heading">Paramètres</h1>
        <p className="dashboard-section-subtitle mt-2 max-w-2xl">
          Page publique, règles de réservation, apparence et lien à partager.
        </p>
      </header>
      <SettingsForm
        restaurant={{
          id: restaurant.id,
          name: restaurant.name,
          phone: restaurant.phone,
          email: restaurant.email,
          address: restaurant.address,
          description: restaurant.description,
          slug: restaurant.slug,
          primary_color: restaurantConfig?.primary_color ?? "#12151c",
          logo_url: restaurantConfig?.logo_url ?? null,
          banner_url: restaurantConfig?.banner_url ?? null,
          page_background_color: restaurantConfig?.page_background_color ?? null,
          hero_primary_color: restaurantConfig?.hero_primary_color ?? null,
          public_button_bg_color: restaurantConfig?.public_button_bg_color ?? null,
          public_button_text_color: restaurantConfig?.public_button_text_color ?? null,
          public_heading_text_color: restaurantConfig?.public_heading_text_color ?? null,
          public_body_text_color: restaurantConfig?.public_body_text_color ?? null,
          public_accent_color: restaurantConfig?.public_accent_color ?? null,
          public_footer_bg_color: restaurantConfig?.public_footer_bg_color ?? null,
          public_footer_text_color: restaurantConfig?.public_footer_text_color ?? null,
          public_heading_font: restaurantConfig?.public_heading_font ?? null,
          public_body_font: restaurantConfig?.public_body_font ?? null,
          public_hero_title_size_px: restaurantConfig?.public_hero_title_size_px ?? null,
          public_display_name: restaurantConfig?.public_display_name ?? null,
          public_tagline: restaurantConfig?.public_tagline ?? null,
          public_description: restaurantConfig?.public_description ?? null,
          public_cta_label: restaurantConfig?.public_cta_label ?? null,
          public_hero_height: restaurantConfig?.public_hero_height ?? null,
          public_hero_overlay_enabled: restaurantConfig?.public_hero_overlay_enabled ?? null,
          public_hero_overlay_opacity: restaurantConfig?.public_hero_overlay_opacity ?? null,
          google_maps_url: restaurantConfig?.google_maps_url ?? null,
          show_public_instagram: restaurantConfig?.show_public_instagram ?? null,
          show_public_facebook: restaurantConfig?.show_public_facebook ?? null,
          show_public_google_maps: restaurantConfig?.show_public_google_maps ?? null,
        }}
        settings={safeSettings}
        confirmationMode={
          restaurantConfig?.reservation_confirmation_mode === "automatic" ? "automatic" : "manual"
        }
        publicLink={publicLink}
        initialRestaurantTables={restaurantTablesRows ?? []}
      />
    </div>
  );
}
