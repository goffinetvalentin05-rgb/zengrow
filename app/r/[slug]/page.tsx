import { notFound } from "next/navigation";
import PublicReservationForm from "@/src/components/reservation/public-reservation-form";
import { createClient } from "@/src/lib/supabase/server";
import { googleFontsHref, normalizePublicPageFont } from "@/src/lib/public-page-fonts";
import { getDefaultOpeningHours, OpeningHours } from "@/src/lib/utils";

type PublicReservationPageProps = {
  params: Promise<{ slug: string }>;
};

type PublicRestaurantRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  phone: string | null;
  address: string | null;
  email: string | null;
  logo_url: string | null;
  banner_url: string | null;
  primary_color: string | null;
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

export default async function PublicReservationPage({ params }: PublicReservationPageProps) {
  const supabase = await createClient();
  const { slug } = await params;

  const { data: restaurantRaw, error } = await supabase
    .from("restaurants")
    .select(
      [
        "id",
        "name",
        "slug",
        "description",
        "phone",
        "address",
        "email",
        "logo_url",
        "banner_url",
        "primary_color",
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
    .eq("slug", slug)
    .single();

  const restaurant = restaurantRaw as PublicRestaurantRow | null;

  if (error || !restaurant) {
    notFound();
  }

  const { data: settings } = await supabase
    .from("restaurant_settings")
    .select(
      "opening_hours, reservation_slot_interval, max_party_size, allow_phone, allow_email, logo_url, cover_image_url, accent_color, button_color, text_color, heading_font, body_font, font_size_scale, border_radius, button_style, card_style, instagram_url, facebook_url, website_url, pre_booking_message, closure_start_date, closure_end_date, closure_message, public_page_description, gallery_image_urls, public_page_show_address, public_page_show_phone, public_page_show_email, public_page_show_website, public_page_show_opening_hours, days_in_advance, use_tables, terrace_enabled",
    )
    .eq("restaurant_id", restaurant.id)
    .single();

  const safeSettings = settings ?? {
    opening_hours: getDefaultOpeningHours(),
    max_party_size: 8,
    reservation_slot_interval: 30,
    allow_phone: true,
    allow_email: true,
    logo_url: null,
    cover_image_url: null,
    accent_color: "#1F7A6C",
    button_color: "#1F7A6C",
    text_color: "#111827",
    heading_font: "Inter",
    body_font: "Inter",
    font_size_scale: "medium" as const,
    border_radius: "rounded" as const,
    button_style: "filled" as const,
    card_style: "elevated" as const,
    instagram_url: null,
    facebook_url: null,
    website_url: null,
    pre_booking_message: null,
    closure_start_date: null,
    closure_end_date: null,
    closure_message: null,
    public_page_description: null,
    gallery_image_urls: [] as string[],
    public_page_show_address: true,
    public_page_show_phone: true,
    public_page_show_email: true,
    public_page_show_website: true,
    public_page_show_opening_hours: true,
    days_in_advance: 60,
    use_tables: false,
    terrace_enabled: false,
  };

  const { data: documents } = await supabase
    .from("restaurant_documents")
    .select("id, label, file_url, position, created_at")
    .eq("restaurant_id", restaurant.id)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  const galleryImageUrls = (safeSettings.gallery_image_urls ?? []).filter(Boolean);

  const headingFont = normalizePublicPageFont(
    restaurant.public_heading_font ?? safeSettings.heading_font,
    "Playfair Display",
  );
  const bodyFont = normalizePublicPageFont(restaurant.public_body_font ?? safeSettings.body_font, "Inter");
  const fontsHref = googleFontsHref([headingFont, bodyFont]);

  const displayName = restaurant.public_display_name?.trim() || restaurant.name;
  const tagline = restaurant.public_tagline?.trim() || restaurant.description?.trim() || null;
  const publicDescription =
    restaurant.public_description?.trim() || safeSettings.public_page_description?.trim() || null;

  const pageBg =
    restaurant.page_background_color?.trim() || safeSettings.text_color || "#f8fafc";
  const heroPrimary =
    restaurant.hero_primary_color?.trim() || restaurant.primary_color?.trim() || "#12151c";
  const btnBg = restaurant.public_button_bg_color?.trim() || safeSettings.button_color || "#1F7A6C";
  const btnText = restaurant.public_button_text_color?.trim() || "#ffffff";
  const headingColor = restaurant.public_heading_text_color?.trim() || "#0f172a";
  const bodyColor = restaurant.public_body_text_color?.trim() || safeSettings.text_color || "#334155";
  const accent = restaurant.public_accent_color?.trim() || safeSettings.accent_color || "#1F7A6C";
  const footerBg = restaurant.public_footer_bg_color?.trim() || "#0f172a";
  const footerText = restaurant.public_footer_text_color?.trim() || "#e2e8f0";

  const heroTitleSize = Math.min(72, Math.max(32, restaurant.public_hero_title_size_px ?? 48));
  const heroHeight = (restaurant.public_hero_height as "compact" | "normal" | "tall") || "normal";
  const overlayOn = restaurant.public_hero_overlay_enabled !== false;
  const overlayOp = Math.min(80, Math.max(0, restaurant.public_hero_overlay_opacity ?? 40));

  return (
    <>
      {fontsHref ? (
        <>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link rel="stylesheet" href={fontsHref} />
        </>
      ) : null}
      <main className="min-h-screen">
        <PublicReservationForm
          restaurantId={restaurant.id}
          restaurantName={displayName}
          restaurantTagline={tagline}
          publicPageDescription={publicDescription}
          galleryImageUrls={galleryImageUrls}
          documents={(documents ?? []).map((d) => ({
            id: d.id,
            label: d.label,
            fileUrl: d.file_url,
            position: d.position ?? 0,
          }))}
          restaurantPhone={restaurant.phone}
          restaurantAddress={restaurant.address}
          restaurantEmail={restaurant.email}
          allowPhone={safeSettings.allow_phone}
          allowEmail={safeSettings.allow_email}
          maxPartySize={Math.max(1, safeSettings.max_party_size ?? 8)}
          openingHours={safeSettings.opening_hours as OpeningHours}
          daysInAdvance={safeSettings.days_in_advance ?? 60}
          useTables={safeSettings.use_tables ?? false}
          logoUrl={restaurant.logo_url ?? safeSettings.logo_url}
          coverImageUrl={restaurant.banner_url ?? safeSettings.cover_image_url}
          pageBackgroundColor={pageBg}
          heroPrimaryColor={heroPrimary}
          buttonBgColor={btnBg}
          buttonTextColor={btnText}
          headingTextColor={headingColor}
          bodyTextColor={bodyColor}
          accentColor={accent}
          footerBgColor={footerBg}
          footerTextColor={footerText}
          headingFont={headingFont}
          bodyFont={bodyFont}
          heroTitleSizePx={heroTitleSize}
          heroHeight={heroHeight}
          heroOverlayEnabled={overlayOn}
          heroOverlayOpacity={overlayOp}
          ctaLabel={restaurant.public_cta_label?.trim() || "Réserver une table"}
          fontSizeScale={(safeSettings.font_size_scale ?? "medium") as "small" | "medium" | "large"}
          borderRadius={(safeSettings.border_radius ?? "rounded") as "sharp" | "rounded" | "pill"}
          buttonStyle={(safeSettings.button_style ?? "filled") as "filled" | "outlined" | "ghost"}
          cardStyle={(safeSettings.card_style ?? "elevated") as "flat" | "elevated" | "bordered"}
          showPublicAddress={safeSettings.public_page_show_address ?? true}
          showPublicPhone={safeSettings.public_page_show_phone ?? true}
          showPublicEmail={safeSettings.public_page_show_email ?? true}
          showPublicWebsite={safeSettings.public_page_show_website ?? true}
          showPublicOpeningHours={safeSettings.public_page_show_opening_hours ?? true}
          showPublicInstagram={restaurant.show_public_instagram !== false}
          showPublicFacebook={restaurant.show_public_facebook !== false}
          showPublicGoogleMaps={restaurant.show_public_google_maps !== false}
          instagramUrl={safeSettings.instagram_url}
          facebookUrl={safeSettings.facebook_url}
          websiteUrl={safeSettings.website_url}
          googleMapsUrl={restaurant.google_maps_url}
          preBookingMessage={safeSettings.pre_booking_message}
          closureStartDate={safeSettings.closure_start_date}
          closureEndDate={safeSettings.closure_end_date}
          closureMessage={safeSettings.closure_message}
          terraceEnabled={safeSettings.terrace_enabled === true}
        />
      </main>
    </>
  );
}
