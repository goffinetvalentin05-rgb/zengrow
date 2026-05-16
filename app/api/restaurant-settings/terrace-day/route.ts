import { NextResponse } from "next/server";
import { calendarYmdInBusinessTz } from "@/src/lib/date/business-calendar";
import { summarizeTerraceDay } from "@/src/lib/reservation/terrace-day-stats";
import { createClient } from "@/src/lib/supabase/server";

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
  const dateYmd = url.searchParams.get("date")?.trim() || calendarYmdInBusinessTz();

  const [{ data: settings }, { data: reservations }] = await Promise.all([
    supabase
      .from("restaurant_settings")
      .select("reservation_duration")
      .eq("restaurant_id", restaurant.id)
      .maybeSingle(),
    supabase
      .from("reservations")
      .select("id, guest_name, reservation_date, reservation_time, guests, status, zone")
      .eq("restaurant_id", restaurant.id)
      .eq("reservation_date", dateYmd)
      .in("status", ["pending", "confirmed"]),
  ]);

  const durationMinutes = Math.max(30, settings?.reservation_duration ?? 90);
  const summary = summarizeTerraceDay(reservations ?? [], durationMinutes, dateYmd);

  return NextResponse.json(summary);
}
