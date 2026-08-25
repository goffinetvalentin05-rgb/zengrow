import { headers } from "next/headers";
import { requireRestaurantSession } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";
import { getDefaultOpeningHours, type OpeningHours } from "@/src/lib/utils";
import SettingsForm from "@/src/components/dashboard/settings-form";
import PageHeader from "@/src/components/dashboard/page-header";
import DashboardContent from "@/src/components/dashboard/ui/dashboard-content";
import {
  DEFAULT_GIFT_VOUCHER_NOTIFICATION_PREFS,
  mapGiftVoucherNotificationPrefs,
  type GiftVoucherNotificationPrefs,
} from "@/src/lib/notifications/preferences";
import { getRequestOrigin } from "@/src/lib/site-url";

type RestaurantPublicRow = {
  primary_color: string | null;
  public_accent_color: string | null;
  logo_url: string | null;
  banner_url: string | null;
  public_display_name: string | null;
};

export default async function DashboardSettingsPage() {
  const supabase = await createClient();
  const { restaurant, access } = await requireRestaurantSession();
  const headerList = await headers();
  const publicOrigin = getRequestOrigin(headerList);

  const settingsSelectCore =
    "opening_hours, max_guests_per_slot, reservation_duration, reservation_slot_interval, accent_color, logo_url, cover_image_url, instagram_url, facebook_url, website_url";
  const settingsSelectFull = `${settingsSelectCore}, notify_gift_voucher_created, notify_gift_voucher_request, notify_gift_voucher_redeemed, notify_gift_voucher_fully_used`;

  const fullSettings = await supabase
    .from("restaurant_settings")
    .select(settingsSelectFull)
    .eq("restaurant_id", restaurant.id)
    .maybeSingle();
  const settings = fullSettings.error
    ? (
        await supabase
          .from("restaurant_settings")
          .select(settingsSelectCore)
          .eq("restaurant_id", restaurant.id)
          .maybeSingle()
      ).data
    : fullSettings.data;

  const { data: restaurantConfigRaw } = await supabase
    .from("restaurants")
    .select("primary_color, public_accent_color, logo_url, banner_url, public_display_name")
    .eq("id", restaurant.id)
    .maybeSingle();

  const restaurantConfig = restaurantConfigRaw as RestaurantPublicRow | null;
  const notificationPrefs = settings
    ? mapGiftVoucherNotificationPrefs(settings as unknown as Partial<GiftVoucherNotificationPrefs>)
    : DEFAULT_GIFT_VOUCHER_NOTIFICATION_PREFS;

  const availabilitySettings = {
    opening_hours: (settings?.opening_hours as OpeningHours | undefined) ?? getDefaultOpeningHours(),
    max_guests_per_slot: settings?.max_guests_per_slot ?? 20,
    reservation_slot_interval: settings?.reservation_slot_interval ?? 30,
    reservation_duration: settings?.reservation_duration ?? 90,
  };

  return (
    <DashboardContent>
      <div className="space-y-10">
        <PageHeader
          title="Paramètres"
          subtitle="Établissement, bons cadeaux, paiements et canaux de vente."
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
            primary_color: restaurantConfig?.primary_color ?? null,
            public_accent_color: restaurantConfig?.public_accent_color ?? null,
            logo_url: restaurantConfig?.logo_url ?? null,
            banner_url: restaurantConfig?.banner_url ?? null,
            public_display_name: restaurantConfig?.public_display_name ?? null,
          }}
          settings={{
            website_url: settings?.website_url ?? null,
            instagram_url: settings?.instagram_url ?? null,
            facebook_url: settings?.facebook_url ?? null,
            logo_url: settings?.logo_url ?? null,
            accent_color: settings?.accent_color ?? null,
            cover_image_url: settings?.cover_image_url ?? null,
          }}
          subscriptionStatus={access.effectiveStatus}
          subscriptionPlan={access.effectivePlan}
          trialEndDate={restaurant.trial_end_date}
          isOwnerDev={access.isOwnerDev}
          publicOrigin={publicOrigin}
          notificationPrefs={notificationPrefs}
          availabilitySettings={availabilitySettings}
        />
      </div>
    </DashboardContent>
  );
}
