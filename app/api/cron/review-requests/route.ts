import { NextRequest, NextResponse } from "next/server";
import { sendReviewRequestEmail } from "@/lib/email";
import { isRestaurantExpired } from "@/src/lib/subscription";
import { createAdminClient } from "@/src/lib/supabase/admin";

function isAuthorized(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return true;

  const authHeader = request.headers.get("authorization");
  const headerSecret = request.headers.get("x-cron-secret");

  return authHeader === `Bearer ${cronSecret}` || headerSecret === cronSecret;
}

function toCompletedAt(date: string, time: string) {
  return new Date(`${date}T${time}:00`);
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const supabase = createAdminClient();
  const now = new Date();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || request.nextUrl.origin;

  const { data: reservations, error: reservationsError } = await supabase
    .from("reservations")
    .select("id, restaurant_id, guest_name, guest_email, reservation_date, reservation_time, status, review_sent")
    .eq("status", "completed")
    .eq("review_sent", false)
    .not("guest_email", "is", null)
    .limit(500);

  if (reservationsError) {
    return NextResponse.json({ error: reservationsError.message }, { status: 500 });
  }

  if (!reservations || reservations.length === 0) {
    return NextResponse.json({ ok: true, processed: 0, sent: 0 });
  }

  const restaurantIds = Array.from(new Set(reservations.map((item) => item.restaurant_id)));

  const [{ data: settings }, { data: restaurants }] = await Promise.all([
    supabase
      .from("review_automation_settings")
      .select(
        "restaurant_id, is_enabled, channel, delay_minutes, google_review_url, email_subject, email_message, button_positive_label, button_neutral_label, button_negative_label, primary_color",
      )
      .in("restaurant_id", restaurantIds),
    supabase
      .from("restaurants")
      .select("id, name, subscription_status, trial_end_date, stripe_subscription_id")
      .in("id", restaurantIds),
  ]);
  const { data: restaurantVisuals } = await supabase
    .from("restaurant_settings")
    .select("restaurant_id, logo_url")
    .in("restaurant_id", restaurantIds);

  const settingsByRestaurant = new Map((settings ?? []).map((item) => [item.restaurant_id, item]));
  const restaurantsById = new Map((restaurants ?? []).map((item) => [item.id, item]));
  const visualsByRestaurant = new Map((restaurantVisuals ?? []).map((item) => [item.restaurant_id, item]));

  let sent = 0;

  for (const reservation of reservations) {
    const restaurant = restaurantsById.get(reservation.restaurant_id);
    const automation = settingsByRestaurant.get(reservation.restaurant_id);

    if (!restaurant || !automation) continue;
    if (isRestaurantExpired(restaurant)) continue;
    if (!automation.is_enabled || automation.channel !== "email") continue;

    const completedAt = toCompletedAt(reservation.reservation_date, reservation.reservation_time);
    const sendAt = new Date(completedAt.getTime() + automation.delay_minutes * 60 * 1000);
    if (now < sendAt) continue;

    const googleReviewUrl = automation.google_review_url || `${appUrl}/review/${reservation.id}`;
    const feedbackNeutralUrl = `${appUrl}/feedback/${reservation.id}?restaurantId=${reservation.restaurant_id}&rating=3`;
    const feedbackNegativeUrl = `${appUrl}/feedback/${reservation.id}?restaurantId=${reservation.restaurant_id}&rating=2`;
    const visual = visualsByRestaurant.get(reservation.restaurant_id);

    try {
      await sendReviewRequestEmail({
        to: reservation.guest_email as string,
        restaurantName: restaurant.name,
        restaurantLogoUrl: visual?.logo_url ?? null,
        googleReviewUrl,
        feedbackNeutralUrl,
        feedbackNegativeUrl,
        emailSubject: automation.email_subject,
        emailMessage: automation.email_message,
        buttonPositiveLabel: automation.button_positive_label,
        buttonNeutralLabel: automation.button_neutral_label,
        buttonNegativeLabel: automation.button_negative_label,
        primaryColor: automation.primary_color,
      });

      await supabase
        .from("reservations")
        .update({ review_sent: true, review_sent_at: now.toISOString() })
        .eq("id", reservation.id);

      sent += 1;
    } catch (error) {
      console.error("Review request email failed", { reservationId: reservation.id, error });
    }
  }

  return NextResponse.json({ ok: true, processed: reservations.length, sent });
}
