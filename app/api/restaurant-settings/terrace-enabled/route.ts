import { NextResponse } from "next/server";
import { z } from "zod";
import { calendarYmdInBusinessTz } from "@/src/lib/date/business-calendar";
import { createClient } from "@/src/lib/supabase/server";

const bodySchema = z.object({
  terrace_enabled: z.boolean(),
  disposition: z.enum(["keep", "move_interior", "cancel"]).optional(),
});

export async function PATCH(request: Request) {
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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "terrace_enabled (booléen) requis." }, { status: 400 });
  }

  const today = calendarYmdInBusinessTz();

  if (!parsed.data.terrace_enabled) {
    const { data: terraceToday } = await supabase
      .from("reservations")
      .select("id")
      .eq("restaurant_id", restaurant.id)
      .eq("reservation_date", today)
      .eq("zone", "terrace")
      .in("status", ["pending", "confirmed"]);

    const ids = (terraceToday ?? []).map((r) => r.id);

    if (ids.length > 0 && !parsed.data.disposition) {
      return NextResponse.json(
        {
          error: "Des réservations terrasse existent pour aujourd'hui.",
          requiresDisposition: true,
          reservationCount: ids.length,
        },
        { status: 409 },
      );
    }

    if (ids.length > 0 && parsed.data.disposition) {
      if (parsed.data.disposition === "move_interior") {
        const { error: moveError } = await supabase
          .from("reservations")
          .update({ zone: "interior", table_id: null })
          .in("id", ids);
        if (moveError) {
          return NextResponse.json({ error: moveError.message }, { status: 500 });
        }
      } else if (parsed.data.disposition === "cancel") {
        const { error: cancelError } = await supabase
          .from("reservations")
          .update({ status: "cancelled" })
          .in("id", ids);
        if (cancelError) {
          return NextResponse.json({ error: cancelError.message }, { status: 500 });
        }
      }
    }
  }

  const { error } = await supabase
    .from("restaurant_settings")
    .update({ terrace_enabled: parsed.data.terrace_enabled })
    .eq("restaurant_id", restaurant.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, terrace_enabled: parsed.data.terrace_enabled });
}
