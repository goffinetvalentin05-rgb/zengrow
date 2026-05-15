import { headers } from "next/headers";
import { requireRestaurantSession } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";
import { getDefaultOpeningHours, type OpeningHours } from "@/src/lib/utils";
import { buildPublicPageSettingsInitial } from "@/src/lib/public-page/build-initial";
import SettingsForm from "@/src/components/dashboard/settings-form";
import PageHeader from "@/src/components/dashboard/page-header";
import DashboardContent from "@/src/components/dashboard/ui/dashboard-content";

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
  reservation_confirmation_email_subject: string | null;
  reservation_confirmation_email_body: string | null;
};

export default async function DashboardSettingsPage() {
  const supabase = await createClient();
  const { restaurant, access } = await requireRestaurantSession();
  const headerList = await headers();
  const host = headerList.get("host");
  const protocol = headerList.get("x-forwarded-proto") ?? "http";
  const publicLink = host ? `${protocol}://${host}/r/${restaurant.slug}` : `/r/${restaurant.slug}`;

  const { data: settings } = await supabase
    .from("restaurant_settings")
    .select(
      "opening_hours, max_guests_per_slot, reservation_duration, reservation_slot_interval, restaurant_capacity, max_covers_per_slot, max_party_size, use_tables, reservation_mode, public_table_selection_mode, floor_plan_clients_choose_table, service_lunch_enabled, service_lunch_start, service_lunch_end, service_lunch_max_covers, service_dinner_enabled, service_dinner_start, service_dinner_end, service_dinner_max_covers, terrace_enabled, terrace_capacity, auto_archive_reservations, days_in_advance, accent_color, button_color, text_color, heading_font, body_font, font_size_scale, border_radius, button_style, card_style, logo_url, cover_image_url, instagram_url, facebook_url, website_url, pre_booking_message, closure_start_date, closure_end_date, closure_message, public_page_description, gallery_image_urls, featured_gallery_index, public_highlights, special_message, public_menu_mode, public_menu_url, public_reservation_enabled, min_booking_lead_minutes, no_slots_message, show_hours_before_form, show_phone_cta, public_page_show_address, public_page_show_phone, public_page_show_email, public_page_show_website, public_page_show_opening_hours",
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
        "reservation_confirmation_email_subject",
        "reservation_confirmation_email_body",
      ].join(", "),
    )
    .eq("id", restaurant.id)
    .single();

  const restaurantConfig = restaurantConfigRaw as DashboardRestaurantPublicConfig | null;

  const safeSettings = settings ?? {
    reservation_duration: 90,
    reservation_slot_interval: 30,
    restaurant_capacity: 40,
    max_covers_per_slot: 40,
    max_party_size: 8,
    use_tables: false,
    reservation_mode: "fixed_slots",
    public_table_selection_mode: "automatic",
    floor_plan_clients_choose_table: false,
    service_lunch_enabled: true,
    service_lunch_start: "11:30:00",
    service_lunch_end: "14:30:00",
    service_lunch_max_covers: 40,
    service_dinner_enabled: true,
    service_dinner_start: "18:00:00",
    service_dinner_end: "22:30:00",
    service_dinner_max_covers: 40,
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

  const availabilitySettings = {
    opening_hours: (settings?.opening_hours as OpeningHours | undefined) ?? getDefaultOpeningHours(),
    max_guests_per_slot: settings?.max_guests_per_slot ?? 20,
    reservation_slot_interval: safeSettings.reservation_slot_interval ?? 30,
    reservation_duration: safeSettings.reservation_duration ?? 90,
  };

  const { data: documents } = await supabase
    .from("restaurant_documents")
    .select("id, label, file_url, position")
    .eq("restaurant_id", restaurant.id)
    .order("position", { ascending: true });

  const publicPageInitial = buildPublicPageSettingsInitial(
    {
      id: restaurant.id,
      name: restaurant.name,
      slug: restaurant.slug,
      city: (restaurantConfigRaw as { city?: string | null })?.city ?? null,
      cuisine_type: (restaurantConfigRaw as { cuisine_type?: string | null })?.cuisine_type ?? null,
      phone: restaurant.phone,
      email: restaurant.email,
      address: restaurant.address,
      primary_color: restaurantConfig?.primary_color ?? null,
      logo_url: restaurantConfig?.logo_url ?? null,
      banner_url: restaurantConfig?.banner_url ?? null,
      page_background_color: restaurantConfig?.page_background_color ?? null,
      hero_primary_color: restaurantConfig?.hero_primary_color ?? null,
      public_secondary_color: (restaurantConfigRaw as { public_secondary_color?: string | null })?.public_secondary_color ?? null,
      public_style_preset: (restaurantConfigRaw as { public_style_preset?: string | null })?.public_style_preset ?? null,
      public_ambiance: (restaurantConfigRaw as { public_ambiance?: string | null })?.public_ambiance ?? null,
      public_hero_title: (restaurantConfigRaw as { public_hero_title?: string | null })?.public_hero_title ?? null,
      public_tagline: restaurantConfig?.public_tagline ?? null,
      public_description: restaurantConfig?.public_description ?? null,
      public_cta_label: restaurantConfig?.public_cta_label ?? null,
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
      public_hero_height: restaurantConfig?.public_hero_height ?? null,
      public_hero_overlay_enabled: restaurantConfig?.public_hero_overlay_enabled ?? null,
      public_hero_overlay_opacity: restaurantConfig?.public_hero_overlay_opacity ?? null,
      google_maps_url: restaurantConfig?.google_maps_url ?? null,
      tiktok_url: (restaurantConfigRaw as { tiktok_url?: string | null })?.tiktok_url ?? null,
      public_seo_title: (restaurantConfigRaw as { public_seo_title?: string | null })?.public_seo_title ?? null,
      public_seo_description: (restaurantConfigRaw as { public_seo_description?: string | null })?.public_seo_description ?? null,
      public_page_status: (restaurantConfigRaw as { public_page_status?: string | null })?.public_page_status ?? null,
      public_page_published_at: (restaurantConfigRaw as { public_page_published_at?: string | null })?.public_page_published_at ?? null,
      public_page_draft_updated_at: (restaurantConfigRaw as { public_page_draft_updated_at?: string | null })?.public_page_draft_updated_at ?? null,
      show_public_instagram: restaurantConfig?.show_public_instagram ?? null,
      show_public_facebook: restaurantConfig?.show_public_facebook ?? null,
      show_public_google_maps: restaurantConfig?.show_public_google_maps ?? null,
    },
    safeSettings,
    availabilitySettings.opening_hours,
    (documents ?? []).map((d) => ({
      id: d.id,
      label: d.label,
      fileUrl: d.file_url,
      position: d.position ?? 0,
    })),
  );

  return (
    <DashboardContent>
      <div className="space-y-10">
        <PageHeader
          title="Paramètres"
          subtitle="Configure ton restaurant, ta page publique et tes préférences."
          titleClassName="text-3xl font-bold tracking-tight"
          subtitleClassName="text-sm text-zg-text-muted"
        />
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
            reservation_confirmation_email_subject: restaurantConfig?.reservation_confirmation_email_subject ?? null,
            reservation_confirmation_email_body: restaurantConfig?.reservation_confirmation_email_body ?? null,
          }}
          settings={safeSettings}
          confirmationMode={restaurantConfig?.reservation_confirmation_mode === "automatic" ? "automatic" : "manual"}
          publicLink={publicLink}
          subscriptionStatus={access.effectiveStatus}
          subscriptionPlan={access.effectivePlan}
          trialEndDate={restaurant.trial_end_date}
          isOwnerDev={access.isOwnerDev}
          availabilitySettings={availabilitySettings}
          publicPageInitial={publicPageInitial}
        />
      </div>
    </DashboardContent>
  );
}
