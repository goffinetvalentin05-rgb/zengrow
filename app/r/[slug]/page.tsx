import { notFound } from "next/navigation";
import PublicReservationForm from "@/src/components/reservation/public-reservation-form";
import { createClient } from "@/src/lib/supabase/server";
import { getDefaultOpeningHours, OpeningHours } from "@/src/lib/utils";

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

  const [{ data: settings }, { data: blockedSlots }, { data: existingReservations }] = await Promise.all([
    supabase
      .from("restaurant_settings")
      .select(
        "opening_hours, reservation_slot_interval, reservation_duration, restaurant_capacity, max_party_size, allow_phone, allow_email, logo_url, cover_image_url, accent_color, button_color, instagram_url, facebook_url, website_url, pre_booking_message, closure_start_date, closure_end_date, closure_message, public_page_description, gallery_image_urls, public_menu_mode, public_menu_url, public_menu_pdf_url",
      )
      .eq("restaurant_id", restaurant.id)
      .single(),
    supabase
      .from("blocked_slots")
      .select("reservation_date, reservation_time")
      .eq("restaurant_id", restaurant.id),
    supabase
      .from("reservations")
      .select("reservation_date, reservation_time, guests, status")
      .eq("restaurant_id", restaurant.id)
      .in("status", ["pending", "confirmed"]),
  ]);

  const safeSettings = settings ?? {
    opening_hours: getDefaultOpeningHours(),
    restaurant_capacity: 40,
    max_party_size: 8,
    reservation_duration: 90,
    reservation_slot_interval: 30,
    allow_phone: true,
    allow_email: true,
    logo_url: null,
    cover_image_url: null,
    accent_color: "#1F7A6C",
    button_color: "#1F7A6C",
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

  return (
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
          restaurantCapacity={safeSettings.restaurant_capacity}
          maxPartySize={safeSettings.max_party_size}
          reservationDuration={safeSettings.reservation_duration}
          slotInterval={safeSettings.reservation_slot_interval}
          openingHours={safeSettings.opening_hours as OpeningHours}
          blockedSlots={blockedSlots ?? []}
          existingReservations={existingReservations ?? []}
          logoUrl={restaurant.logo_url ?? safeSettings.logo_url}
          coverImageUrl={restaurant.banner_url ?? safeSettings.cover_image_url}
          accentColor={restaurant.primary_color ?? safeSettings.accent_color}
          buttonColor={restaurant.primary_color ?? safeSettings.button_color}
          instagramUrl={safeSettings.instagram_url}
          facebookUrl={safeSettings.facebook_url}
          websiteUrl={safeSettings.website_url}
          preBookingMessage={safeSettings.pre_booking_message}
          closureStartDate={safeSettings.closure_start_date}
          closureEndDate={safeSettings.closure_end_date}
          closureMessage={safeSettings.closure_message}
      />
    </main>
  );
}
