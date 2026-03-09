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
      "reservation_alert_email, reservation_duration, reservation_slot_interval, restaurant_capacity, max_party_size, accent_color, button_color, logo_url, cover_image_url, instagram_url, facebook_url, website_url, pre_booking_message",
    )
    .eq("restaurant_id", restaurant.id)
    .single();

  const safeSettings = settings ?? {
    reservation_alert_email: restaurant.email,
    reservation_duration: 90,
    reservation_slot_interval: 30,
    restaurant_capacity: 40,
    max_party_size: 8,
    accent_color: "#1F7A6C",
    button_color: "#1F7A6C",
    logo_url: "",
    cover_image_url: "",
    instagram_url: "",
    facebook_url: "",
    website_url: "",
    pre_booking_message: "",
  };

  return (
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
      publicLink={publicLink}
    />
  );
}
