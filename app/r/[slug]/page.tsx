import { notFound } from "next/navigation";
import PublicReservationForm from "@/src/components/reservation/public-reservation-form";
import { createClient } from "@/src/lib/supabase/server";
import { getDefaultOpeningHours, OpeningHours } from "@/src/lib/utils";

const GOOGLE_FONT_FAMILIES = new Set([
  "Playfair Display",
  "Cormorant Garamond",
  "DM Sans",
  "Inter",
  "Merriweather",
  "Lato",
  "Source Sans Pro",
  "Montserrat",
  "Raleway",
  "Poppins",
]);

function normalizeFontChoice(value: string | null | undefined, fallback: string) {
  const v = (value ?? "").trim();
  return GOOGLE_FONT_FAMILIES.has(v) ? v : fallback;
}

function googleFontsHref(fonts: string[]) {
  const unique = Array.from(new Set(fonts.map((f) => f.trim()).filter(Boolean)));
  const safe = unique.filter((f) => GOOGLE_FONT_FAMILIES.has(f));
  if (safe.length === 0) return null;
  const families = safe
    .map((fam) => `family=${encodeURIComponent(fam).replace(/%20/g, "+")}:wght@300;400;500;600;700`)
    .join("&");
  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}

type PublicReservationPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function PublicReservationPage({ params }: PublicReservationPageProps) {
  const supabase = await createClient();
  const { slug } = await params;

  const { data: restaurant, error } = await supabase
    .from("restaurants")
    .select("id, name, slug, description, phone, address, email, logo_url, banner_url, primary_color")
    .eq("slug", slug)
    .single();

  if (error || !restaurant) {
    notFound();
  }

  const { data: settings } = await supabase
    .from("restaurant_settings")
    .select(
      "opening_hours, reservation_slot_interval, max_party_size, allow_phone, allow_email, logo_url, cover_image_url, accent_color, button_color, text_color, heading_font, body_font, font_size_scale, border_radius, button_style, card_style, instagram_url, facebook_url, website_url, pre_booking_message, closure_start_date, closure_end_date, closure_message, public_page_description, gallery_image_urls, public_menu_mode, public_menu_url, public_menu_pdf_url, public_page_show_address, public_page_show_phone, public_page_show_email, public_page_show_website, public_page_show_opening_hours, days_in_advance, use_tables",
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
    heading_font: "Playfair Display",
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
    public_menu_mode: null as "url" | "pdf" | null,
    public_menu_url: null,
    public_menu_pdf_url: null,
    public_page_show_address: true,
    public_page_show_phone: true,
    public_page_show_email: true,
    public_page_show_website: true,
    public_page_show_opening_hours: true,
    days_in_advance: 60,
    use_tables: false,
  };

  const menuPdf = safeSettings.public_menu_pdf_url?.trim();
  const menuUrl = safeSettings.public_menu_url?.trim();
  const menuMode = safeSettings.public_menu_mode;
  const menuPublicHref =
    menuMode === "pdf" && menuPdf
      ? menuPdf
      : menuMode === "url" && menuUrl
        ? menuUrl
        : !menuMode && menuPdf
          ? menuPdf
          : !menuMode && menuUrl
            ? menuUrl
            : null;

  const galleryImageUrls = (safeSettings.gallery_image_urls ?? []).filter(Boolean);
  const headingFont = normalizeFontChoice(safeSettings.heading_font, "Playfair Display");
  const bodyFont = normalizeFontChoice(safeSettings.body_font, "Inter");
  const fontsHref = googleFontsHref([headingFont, bodyFont]);

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
          restaurantName={restaurant.name}
          restaurantTagline={restaurant.description}
          publicPageDescription={safeSettings.public_page_description}
          galleryImageUrls={galleryImageUrls}
          menuPublicHref={menuPublicHref}
          restaurantPhone={restaurant.phone}
          restaurantAddress={restaurant.address}
          restaurantEmail={restaurant.email}
          allowPhone={safeSettings.allow_phone}
          allowEmail={safeSettings.allow_email}
          maxPartySize={safeSettings.max_party_size}
          openingHours={safeSettings.opening_hours as OpeningHours}
          daysInAdvance={safeSettings.days_in_advance ?? 60}
          useTables={safeSettings.use_tables ?? false}
          logoUrl={restaurant.logo_url ?? safeSettings.logo_url}
          coverImageUrl={restaurant.banner_url ?? safeSettings.cover_image_url}
          primaryColor={restaurant.primary_color ?? "#12151c"}
          buttonColor={safeSettings.button_color ?? "#1F7A6C"}
          textColor={safeSettings.text_color ?? "#111827"}
          accentColor={safeSettings.accent_color ?? "#1F7A6C"}
          headingFont={headingFont}
          bodyFont={bodyFont}
          fontSizeScale={(safeSettings.font_size_scale ?? "medium") as "small" | "medium" | "large"}
          borderRadius={(safeSettings.border_radius ?? "rounded") as "sharp" | "rounded" | "pill"}
          buttonStyle={(safeSettings.button_style ?? "filled") as "filled" | "outlined" | "ghost"}
          cardStyle={(safeSettings.card_style ?? "elevated") as "flat" | "elevated" | "bordered"}
          showPublicAddress={safeSettings.public_page_show_address ?? true}
          showPublicPhone={safeSettings.public_page_show_phone ?? true}
          showPublicEmail={safeSettings.public_page_show_email ?? true}
          showPublicWebsite={safeSettings.public_page_show_website ?? true}
          showPublicOpeningHours={safeSettings.public_page_show_opening_hours ?? true}
          instagramUrl={safeSettings.instagram_url}
          facebookUrl={safeSettings.facebook_url}
          websiteUrl={safeSettings.website_url}
          preBookingMessage={safeSettings.pre_booking_message}
          closureStartDate={safeSettings.closure_start_date}
          closureEndDate={safeSettings.closure_end_date}
          closureMessage={safeSettings.closure_message}
        />
      </main>
    </>
  );
}
