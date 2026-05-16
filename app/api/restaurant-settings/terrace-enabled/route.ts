import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/src/lib/supabase/server";

const bodySchema = z.object({
  terrace_enabled: z.boolean(),
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

  const { error } = await supabase
    .from("restaurant_settings")
    .update({ terrace_enabled: parsed.data.terrace_enabled })
    .eq("restaurant_id", restaurant.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, terrace_enabled: parsed.data.terrace_enabled });
}
