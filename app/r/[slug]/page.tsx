import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PublicLandingPage from "@/src/components/reservation/public-landing-page";
import {
  loadRestaurant,
  type PublicRestaurantRow,
  type PublicSettingsRow,
} from "@/src/lib/public-page/load-public-restaurant";
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

  const themeColor = restaurant.page_background_color?.trim() || "#0A0A0B";

  return {
    title,
    description,
    themeColor,
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
      <main className="min-h-[100dvh] min-h-dvh w-full">
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
