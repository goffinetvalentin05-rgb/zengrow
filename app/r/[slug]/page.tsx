import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PublicLandingPage from "@/src/components/reservation/public-landing-page";
import { createClient } from "@/src/lib/supabase/server";
import { effectiveHeroSubtitle, effectiveHeroTitle } from "@/src/lib/public-page/defaults";
import type { PublicAmbiance } from "@/src/lib/public-page/constants";
import { googleFontsHref, normalizePublicPageFont } from "@/src/lib/public-page-fonts";
import { effectiveMaxPartySizeForPublic } from "@/src/lib/reservation/reservation-settings";
import { normalizeReservationMode } from "@/src/lib/reservation/reservation-modes";
import { getDefaultOpeningHours, OpeningHours } from "@/src/lib/utils";
import { parseEditorConfig } from "@/src/lib/public-page/editor-config";
import { rowsToPageSectionBundle } from "@/src/lib/public-page/page-sections";
import {
  applyStructureToEditorConfig,
  resolvePageSectionStructure,
  sectionLayoutVariantsMap,
  type PageSectionDbRow,
} from "@/src/lib/public-page/page-section-structure";
import { resolvePublicPageSectionContent } from "@/src/lib/public-page/resolve-public-page-copy";
import { resolvePublicTheme } from "@/src/lib/themes/resolve";
import type { ThemeId } from "@/src/lib/themes/types";

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

type PublicSettingsRow = {
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
].join(", ");

async function loadRestaurant(slug: string) {
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

  const { data: settings } = await supabase
    .from("restaurant_settings")
    .select(SETTINGS_SELECT)
    .eq("restaurant_id", restaurant.id)
    .single();

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

export async function generateMetadata({ params }: PublicReservationPageProps): Promise<Metadata> {
  const { slug } = await params;
  const loaded = await loadRestaurant(slug);
  if (!loaded) return { title: "Restaurant introuvable" };

  const { restaurant, settings } = loaded;
  const displayName = restaurant.public_display_name?.trim() || restaurant.name;
  const title =
    restaurant.public_seo_title?.trim() ||
    effectiveHeroTitle(restaurant.public_hero_title ?? "", displayName);
  const description =
    restaurant.public_seo_description?.trim() ||
    effectiveHeroSubtitle(
      restaurant.public_tagline ?? "",
      restaurant.cuisine_type ?? "",
      restaurant.city ?? "",
      (restaurant.public_ambiance as PublicAmbiance | null) ?? null,
    );

  const gallery = (settings?.gallery_image_urls ?? []).filter(Boolean);
  const featuredIdx = settings?.featured_gallery_index ?? 0;
  const ogImage =
    restaurant.banner_url ??
    settings?.cover_image_url ??
    gallery[featuredIdx] ??
    gallery[0] ??
    undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
  };
}

export default async function PublicReservationPage({ params }: PublicReservationPageProps) {
  const { slug } = await params;
  const loaded = await loadRestaurant(slug);

  if (!loaded) {
    notFound();
  }

  const { restaurant, settings, documents, pageSectionRows } = loaded;

  const safeSettings: PublicSettingsRow = (settings as PublicSettingsRow | null) ?? {
    opening_hours: getDefaultOpeningHours(),
    max_party_size: 8,
    reservation_slot_interval: 30,
    allow_phone: true,
    allow_email: true,
    logo_url: null,
    cover_image_url: null,
    accent_color: "#FF5722",
    button_color: "#FF5722",
    text_color: "#A8A29E",
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
    featured_gallery_index: 0,
    public_highlights: [] as unknown[],
    special_message: null,
    public_menu_mode: null,
    public_menu_url: null,
    public_reservation_enabled: true,
    min_booking_lead_minutes: 0,
    no_slots_message: null,
    show_hours_before_form: true,
    show_phone_cta: true,
    public_page_show_address: true,
    public_page_show_phone: true,
    public_page_show_email: true,
    public_page_show_website: true,
    public_page_show_opening_hours: true,
    days_in_advance: 60,
    terrace_enabled: false,
    terrace_capacity: 0,
    terrace_label: "Terrasse",
  };

  const galleryImageUrls = (safeSettings.gallery_image_urls ?? []).filter(Boolean);
  const featuredIdx = Math.min(
    Math.max(0, safeSettings.featured_gallery_index ?? 0),
    Math.max(0, galleryImageUrls.length - 1),
  );
  const highlights = Array.isArray(safeSettings.public_highlights)
    ? safeSettings.public_highlights.filter((x): x is string => typeof x === "string")
    : [];

  const headingFont = normalizePublicPageFont(
    restaurant.public_heading_font ?? safeSettings.heading_font,
    "Playfair Display",
  );
  const bodyFont = normalizePublicPageFont(restaurant.public_body_font ?? safeSettings.body_font, "Inter");
  const resolvedVisualTheme = resolvePublicTheme(restaurant.theme_id, restaurant.theme_overrides);
  const fontsHref =
    resolvedVisualTheme.googleFontsUrl ?? googleFontsHref([headingFont, bodyFont]);

  const displayName = restaurant.public_display_name?.trim() || restaurant.name;
  const tagline =
    restaurant.public_tagline?.trim() ||
    effectiveHeroSubtitle(
      "",
      restaurant.cuisine_type ?? "",
      restaurant.city ?? "",
      (restaurant.public_ambiance as PublicAmbiance | null) ?? null,
    );
  const publicDescription =
    restaurant.public_description?.trim() || safeSettings.public_page_description?.trim() || null;

  const heroCover =
    restaurant.banner_url ??
    safeSettings.cover_image_url ??
    galleryImageUrls[featuredIdx] ??
    galleryImageUrls[0] ??
    null;

  const pageBg = restaurant.page_background_color?.trim() || "#0A0A0B";
  const heroPrimary =
    restaurant.hero_primary_color?.trim() || restaurant.primary_color?.trim() || "#12151c";
  const btnBg = restaurant.public_button_bg_color?.trim() || safeSettings.button_color || "#FF5722";
  const btnText = restaurant.public_button_text_color?.trim() || "#ffffff";
  const headingColor = restaurant.public_heading_text_color?.trim() || "#F5F1EA";
  const bodyColor = restaurant.public_body_text_color?.trim() || safeSettings.text_color || "#A8A29E";
  const accent = restaurant.public_accent_color?.trim() || safeSettings.accent_color || "#FF5722";
  const footerBg = pageBg;
  const footerText = bodyColor;

  const heroTitleSize = Math.min(72, Math.max(32, restaurant.public_hero_title_size_px ?? 44));
  const heroHeight = (restaurant.public_hero_height as "compact" | "normal" | "tall") || "compact";
  const overlayOn = restaurant.public_hero_overlay_enabled !== false;
  const overlayOp = Math.min(80, Math.max(0, restaurant.public_hero_overlay_opacity ?? 45));

  const menuUrl =
    safeSettings.public_menu_mode === "url" || safeSettings.public_menu_mode === "pdf"
      ? safeSettings.public_menu_url?.trim() || null
      : null;

  const editorConfigBase = parseEditorConfig(safeSettings.public_page_editor_config);
  const pageSectionDbRows: PageSectionDbRow[] = (pageSectionRows ?? []).map((r) => ({
    section_type: r.section_type,
    sort_index: r.sort_index ?? 0,
    enabled: r.enabled !== false,
    layout_variant: (r.layout_variant as string | null) ?? null,
    data: (r.data as Record<string, unknown>) ?? {},
  }));
  const pageStructure = resolvePageSectionStructure(pageSectionDbRows, editorConfigBase);
  const editorConfig = applyStructureToEditorConfig(editorConfigBase, pageStructure);
  const sectionLayoutVariants = sectionLayoutVariantsMap(
    resolvedVisualTheme.id as ThemeId,
    pageStructure,
  );

  const sectionContent = resolvePublicPageSectionContent(
    resolvedVisualTheme.id as ThemeId,
    editorConfig.conversion.structureTemplate,
    rowsToPageSectionBundle(pageSectionRows ?? []),
    {
      contact: {
        showAddress: safeSettings.public_page_show_address ?? true,
        showPhone: safeSettings.public_page_show_phone ?? true,
        showEmail: safeSettings.public_page_show_email ?? true,
        showWebsite: safeSettings.public_page_show_website ?? true,
        showOpeningHours: safeSettings.public_page_show_opening_hours ?? true,
        showInstagram: restaurant.show_public_instagram !== false,
        showFacebook: restaurant.show_public_facebook !== false,
        showGoogleMaps: restaurant.show_public_google_maps !== false,
      },
      hero: {
        showPhone: safeSettings.show_phone_cta !== false,
        showSecondaryCta: editorConfig.hero.secondaryCtaEnabled,
      },
      reservation: {
        showHoursBlock: safeSettings.show_hours_before_form !== false,
        showPhoneAlt: safeSettings.show_phone_cta !== false,
      },
      gallery: {
        showInstagramLink: restaurant.show_public_instagram !== false,
      },
      finalCta: {
        showPhone: safeSettings.show_phone_cta !== false,
      },
    },
  );

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
        <PublicLandingPage
          visualThemeId={resolvedVisualTheme.id as ThemeId}
          themeCssVarOverrides={resolvedVisualTheme.cssVarOverrides}
          showGrainOverlay={resolvedVisualTheme.showGrain}
          restaurantId={restaurant.id}
          restaurantSlug={restaurant.slug}
          restaurantName={displayName}
          heroTitle={effectiveHeroTitle(restaurant.public_hero_title ?? "", displayName)}
          restaurantTagline={tagline}
          cuisineType={restaurant.cuisine_type}
          city={restaurant.city}
          highlights={highlights}
          specialMessage={safeSettings.special_message}
          menuUrl={menuUrl}
          reservationEnabled={safeSettings.public_reservation_enabled !== false}
          showHoursBeforeForm={safeSettings.show_hours_before_form !== false}
          showPhoneCta={safeSettings.show_phone_cta !== false}
          noSlotsMessage={safeSettings.no_slots_message}
          publicPageDescription={publicDescription}
          galleryImageUrls={galleryImageUrls}
          documents={documents.map((d) => ({
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
          maxPartySize={effectiveMaxPartySizeForPublic(safeSettings)}
          reservationMode={normalizeReservationMode(safeSettings.reservation_mode)}
          openingHours={safeSettings.opening_hours as OpeningHours}
          daysInAdvance={safeSettings.days_in_advance ?? 60}
          logoUrl={restaurant.logo_url ?? safeSettings.logo_url}
          coverImageUrl={heroCover}
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
          ctaLabel={editorConfig.hero.primaryCta.trim() || restaurant.public_cta_label?.trim() || "Réserver une table"}
          secondaryCtaLabel={editorConfig.hero.secondaryCtaEnabled ? editorConfig.hero.secondaryCta : undefined}
          heroBadgeText={editorConfig.hero.badgeText}
          heroLayout={editorConfig.hero.layout}
          heroAlign={editorConfig.hero.align}
          editorConfig={editorConfig}
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
          tiktokUrl={restaurant.tiktok_url}
          preBookingMessage={safeSettings.pre_booking_message}
          closureStartDate={safeSettings.closure_start_date}
          closureEndDate={safeSettings.closure_end_date}
          closureMessage={safeSettings.closure_message}
          terraceEnabled={safeSettings.terrace_enabled === true}
          terraceLabel={safeSettings.terrace_label}
          terraceCapacity={safeSettings.terrace_capacity}
          sectionLayoutVariants={sectionLayoutVariants}
          sectionContent={sectionContent}
        />
      </main>
    </>
  );
}
