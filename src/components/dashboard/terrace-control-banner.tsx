import { calendarYmdInBusinessTz } from "@/src/lib/date/business-calendar";
import {
  countZoneCoversNow,
  resolveInteriorCapacityMax,
} from "@/src/lib/reservation/terrace-day-stats";
import { countTerraceCoversNow } from "@/src/lib/reservation/terrace-occupancy";
import { clampTerraceCapacity, normalizeTerraceLabel, terraceSettingsFromRow } from "@/src/lib/reservation/terrace-settings";
import { createClient } from "@/src/lib/supabase/server";
import TerraceControlWidget from "@/src/components/dashboard/terrace-control-widget";

type TerraceControlBannerProps = {
  restaurantId: string;
  className?: string;
};

export async function TerraceControlBanner({ restaurantId, className }: TerraceControlBannerProps) {
  const supabase = await createClient();
  const today = calendarYmdInBusinessTz();

  const [{ data: settings }, { data: reservations }] = await Promise.all([
    supabase
      .from("restaurant_settings")
      .select(
        "terrace_enabled, terrace_capacity, terrace_label, reservation_duration, max_covers_per_slot, restaurant_capacity, service_lunch_max_covers, service_dinner_max_covers",
      )
      .eq("restaurant_id", restaurantId)
      .maybeSingle(),
    supabase
      .from("reservations")
      .select("guests, reservation_date, reservation_time, status, zone")
      .eq("restaurant_id", restaurantId)
      .eq("reservation_date", today)
      .in("status", ["pending", "confirmed"]),
  ]);

  const terrace = terraceSettingsFromRow(settings ?? {});
  const capacity = clampTerraceCapacity(terrace.terraceCapacity);

  if (capacity <= 0) {
    return null;
  }

  const durationMinutes = Math.max(30, settings?.reservation_duration ?? 90);
  const rows = reservations ?? [];
  const terraceOccupied = countTerraceCoversNow(rows, durationMinutes);
  const interiorOccupied = countZoneCoversNow(rows, "interior", durationMinutes);
  const interiorCapacity = resolveInteriorCapacityMax(settings ?? {});

  return (
    <TerraceControlWidget
      initialEnabled={terrace.terraceEnabled}
      terraceCapacity={capacity}
      terraceLabel={normalizeTerraceLabel(terrace.terraceLabel)}
      terraceOccupiedCovers={terraceOccupied}
      interiorOccupiedCovers={interiorOccupied}
      interiorCapacity={interiorCapacity}
      className={className}
    />
  );
}
