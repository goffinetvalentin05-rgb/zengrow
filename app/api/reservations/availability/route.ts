import { NextRequest, NextResponse } from "next/server";
import { parseAvailabilityPayload } from "@/src/lib/reservation/parse-availability";
import { availabilityQuerySchema } from "@/src/lib/reservation/schemas";
import { createClient } from "@/src/lib/supabase/server";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const raw = {
    restaurantId: params.get("restaurantId") ?? "",
    date: params.get("date") ?? "",
    covers: params.get("covers") ?? "",
    zone: params.get("zone") ?? "",
  };

  const parsed = availabilityQuerySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Paramètres invalides.", slots: [] }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_available_slots", {
    p_restaurant_id: parsed.data.restaurantId,
    p_date: parsed.data.date,
    p_covers: parsed.data.covers,
    p_zone: parsed.data.zone,
  });

  if (error) {
    return NextResponse.json(
      { error: error.message ?? "Impossible de charger les créneaux.", slots: [] },
      { status: 500 },
    );
  }

  const slots = parseAvailabilityPayload(data);
  return NextResponse.json({ slots });
}
