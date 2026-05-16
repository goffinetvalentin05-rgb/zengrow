import { NextResponse } from "next/server";
import { z } from "zod";
import { calendarYmdInBusinessTz } from "@/src/lib/date/business-calendar";
import { sumZoneCoversForDate } from "@/src/lib/reservation/terrace-day-stats";
import { clampTerraceCapacity } from "@/src/lib/reservation/terrace-settings";
import { createClient } from "@/src/lib/supabase/server";

const querySchema = z.object({
  capacity: z.coerce.number().int().min(0).max(500),
});

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const { data: restaurant, error: restaurantError } = await supabase
    .from("restaurants")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (restaurantError || !restaurant) {
    return NextResponse.json({ error: "Restaurant introuvable." }, { status: 404 });
  }

  const url = new URL(request.url);
  const parsed = querySchema.safeParse({ capacity: url.searchParams.get("capacity") ?? "" });
  if (!parsed.success) {
    return NextResponse.json({ error: "Capacité invalide." }, { status: 400 });
  }

  const today = calendarYmdInBusinessTz();
  const newCapacity = clampTerraceCapacity(parsed.data.capacity);

  const { data: reservations } = await supabase
    .from("reservations")
    .select("guests, reservation_date, reservation_time, status, zone")
    .eq("restaurant_id", restaurant.id)
    .eq("reservation_date", today)
    .eq("zone", "terrace")
    .in("status", ["pending", "confirmed"]);

  const bookedCovers = sumZoneCoversForDate(reservations ?? [], "terrace", today);

  return NextResponse.json({
    dateYmd: today,
    newCapacity,
    bookedCovers,
    needsConfirmation: bookedCovers > newCapacity,
  });
}
