import { NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";

const DEFAULT_SUBJECT = "Comment s'est passée votre expérience chez {{restaurant_name}} ?";
const DEFAULT_MESSAGE =
  "Merci pour votre visite chez {{restaurant_name}}.\nNous aimerions connaître votre expérience.";

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 });
  }

  const isEnabled = (body as { is_enabled?: unknown }).is_enabled;
  if (typeof isEnabled !== "boolean") {
    return NextResponse.json({ error: "is_enabled (booléen) requis." }, { status: 400 });
  }

  const { data: restaurant, error: restaurantError } = await supabase
    .from("restaurants")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (restaurantError || !restaurant) {
    return NextResponse.json({ error: "Restaurant introuvable." }, { status: 404 });
  }

  const { data: existing } = await supabase
    .from("review_automation_settings")
    .select(
      "id, is_enabled, channel, delay_minutes, google_review_url, email_subject, email_message, button_positive_label, button_neutral_label, button_negative_label, primary_color",
    )
    .eq("restaurant_id", restaurant.id)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("review_automation_settings")
      .update({ is_enabled: isEnabled })
      .eq("restaurant_id", restaurant.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, is_enabled: isEnabled });
  }

  const { error: insertError } = await supabase.from("review_automation_settings").insert({
    restaurant_id: restaurant.id,
    is_enabled: isEnabled,
    channel: "email",
    delay_minutes: 90,
    google_review_url: null,
    email_subject: DEFAULT_SUBJECT,
    email_message: DEFAULT_MESSAGE,
    button_positive_label: "Excellent",
    button_neutral_label: "Moyen",
    button_negative_label: "À améliorer",
    primary_color: "#1A6B50",
  });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, is_enabled: isEnabled });
}
