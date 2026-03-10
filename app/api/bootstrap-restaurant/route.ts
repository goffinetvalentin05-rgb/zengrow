import { NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";
import { getDefaultOpeningHours, slugifyRestaurantName } from "@/src/lib/utils";

type Payload = {
  restaurantName?: string;
  requestedSlug?: string;
};

async function buildUniqueSlug(supabase: Awaited<ReturnType<typeof createClient>>, base: string) {
  let candidate = base || "restaurant";
  let index = 1;

  while (true) {
    const { data } = await supabase.from("restaurants").select("id").eq("slug", candidate).maybeSingle();
    if (!data) return candidate;
    index += 1;
    candidate = `${base}-${index}`;
  }
}

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => ({}))) as Payload;
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const { data: existingRestaurant } = await supabase
    .from("restaurants")
    .select("id, slug")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (existingRestaurant) {
    return NextResponse.json({ restaurant: existingRestaurant });
  }

  const metadataName = (user.user_metadata?.restaurant_name as string | undefined) ?? "";
  const metadataSlug = (user.user_metadata?.restaurant_slug as string | undefined) ?? "";
  const restaurantName = payload.restaurantName?.trim() || metadataName || "Mon restaurant";
  const slugBase = slugifyRestaurantName(payload.requestedSlug || metadataSlug || restaurantName);
  const slug = await buildUniqueSlug(supabase, slugBase);

  const { data: restaurant, error: restaurantError } = await supabase
    .from("restaurants")
    .insert({
      owner_id: user.id,
      name: restaurantName,
      slug,
      email: user.email ?? null,
    })
    .select("id, slug")
    .single();

  if (restaurantError || !restaurant) {
    return NextResponse.json(
      { error: restaurantError?.message ?? "Impossible de créer le restaurant." },
      { status: 400 },
    );
  }

  const { error: settingsError } = await supabase.from("restaurant_settings").insert({
    restaurant_id: restaurant.id,
    opening_hours: getDefaultOpeningHours(),
  });

  if (settingsError) {
    return NextResponse.json({ error: settingsError.message }, { status: 400 });
  }

  return NextResponse.json({ restaurant });
}
