import AvailabilityEditor from "@/src/components/dashboard/availability-editor";
import { requireRestaurant } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";
import { getDefaultOpeningHours } from "@/src/lib/utils";
import DashboardContent from "@/src/components/dashboard/ui/dashboard-content";

export default async function DashboardAvailabilityPage() {
  const supabase = await createClient();
  const restaurant = await requireRestaurant();

  const { data: settings } = await supabase
    .from("restaurant_settings")
    .select("opening_hours, max_guests_per_slot, reservation_slot_interval, reservation_duration")
    .eq("restaurant_id", restaurant.id)
    .single();

  return (
    <DashboardContent>
      <AvailabilityEditor
        restaurantId={restaurant.id}
        settings={{
          opening_hours: settings?.opening_hours ?? getDefaultOpeningHours(),
          max_guests_per_slot: settings?.max_guests_per_slot ?? 20,
          reservation_slot_interval: settings?.reservation_slot_interval ?? 30,
          reservation_duration: settings?.reservation_duration ?? 90,
        }}
      />
    </DashboardContent>
  );
}
