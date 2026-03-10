import { NextResponse } from "next/server";
import { sendReviewRequestEmail } from "@/lib/email";
import { expireTrialIfNeeded, isRestaurantExpired } from "@/src/lib/subscription";
import { createClient } from "@/src/lib/supabase/server";

export async function POST(request: Request) {
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
    .select("id, owner_id, name, email, subscription_status, trial_end_date, stripe_subscription_id")
    .eq("owner_id", user.id)
    .single();

  if (restaurantError || !restaurant) {
    return NextResponse.json({ error: "Restaurant introuvable." }, { status: 404 });
  }

  const syncedRestaurant = await expireTrialIfNeeded(supabase, restaurant);
  if (isRestaurantExpired(syncedRestaurant)) {
    return NextResponse.json({ error: "Abonnement expiré. Mettez à jour votre formule." }, { status: 402 });
  }

  const { data: automation } = await supabase
    .from("review_automation_settings")
    .select(
      "google_review_url, email_subject, email_message, button_positive_label, button_neutral_label, button_negative_label, primary_color",
    )
    .eq("restaurant_id", syncedRestaurant.id)
    .maybeSingle();
  const { data: restaurantUi } = await supabase
    .from("restaurant_settings")
    .select("logo_url")
    .eq("restaurant_id", syncedRestaurant.id)
    .maybeSingle();

  const { data: testReservation, error: reservationError } = await supabase
    .from("reservations")
    .insert({
      restaurant_id: restaurant.id,
      guest_name: "Test review",
      guest_email: user.email ?? syncedRestaurant.email ?? null,
      guest_phone: null,
      guests: 1,
      reservation_date: new Date().toISOString().slice(0, 10),
      reservation_time: "19:00",
      status: "completed",
      is_test: true,
      source: "test_review_email",
    })
    .select("id")
    .single();

  if (reservationError || !testReservation) {
    return NextResponse.json({ error: reservationError?.message ?? "Impossible de créer une réservation de test." }, { status: 400 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || new URL(request.url).origin;
  const recipient = restaurant.email || user.email;
  if (!recipient) {
    return NextResponse.json({ error: "Aucune adresse e-mail de destination trouvée." }, { status: 400 });
  }

  try {
    await sendReviewRequestEmail({
      to: recipient,
      restaurantName: restaurant.name,
      restaurantLogoUrl: restaurantUi?.logo_url ?? null,
      googleReviewUrl: automation?.google_review_url || `${appUrl}/review/${testReservation.id}`,
      feedbackNeutralUrl: `${appUrl}/feedback/${testReservation.id}?restaurantId=${restaurant.id}&rating=3`,
      feedbackNegativeUrl: `${appUrl}/feedback/${testReservation.id}?restaurantId=${restaurant.id}&rating=2`,
      emailSubject: automation?.email_subject,
      emailMessage: automation?.email_message,
      buttonPositiveLabel: automation?.button_positive_label,
      buttonNeutralLabel: automation?.button_neutral_label,
      buttonNegativeLabel: automation?.button_negative_label,
      primaryColor: automation?.primary_color,
    });
  } catch (error) {
    console.error("Test review email failed", error);
    return NextResponse.json({ error: "Échec d'envoi de l'e-mail." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
