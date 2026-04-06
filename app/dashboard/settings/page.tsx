import SettingsForm from "@/src/components/dashboard/settings-form";
import { headers } from "next/headers";
import { requireRestaurant } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";

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
      "reservation_duration, reservation_slot_interval, restaurant_capacity, max_party_size, accent_color, button_color, logo_url, cover_image_url, instagram_url, facebook_url, website_url, pre_booking_message, closure_start_date, closure_end_date, closure_message, public_page_description, gallery_image_urls, public_menu_mode, public_menu_url, public_menu_pdf_url, public_page_background_color, public_page_show_address, public_page_show_phone, public_page_show_email, public_page_show_website, public_page_show_opening_hours",
    )
    .eq("restaurant_id", restaurant.id)
    .single();

  const { data: restaurantConfig } = await supabase
    .from("restaurants")
    .select("reservation_confirmation_mode")
    .eq("id", restaurant.id)
    .single();

  const safeSettings = settings ?? {
    reservation_duration: 90,
    reservation_slot_interval: 30,
    restaurant_capacity: 40,
    max_party_size: 8,
    accent_color: "#1A6B50",
    button_color: "#1A6B50",
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
    public_menu_mode: null as "url" | "pdf" | null,
    public_menu_url: "",
    public_menu_pdf_url: "",
    public_page_background_color: "#12151c",
    public_page_show_address: true,
    public_page_show_phone: true,
    public_page_show_email: true,
    public_page_show_website: true,
    public_page_show_opening_hours: true,
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
        }}
        settings={safeSettings}
        confirmationMode={restaurantConfig?.reservation_confirmation_mode ?? "manual"}
        publicLink={publicLink}
      />
    </div>
  );
}
