import { NextRequest, NextResponse } from "next/server";
import { sendReviewRequestEmail } from "@/lib/email";
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
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
      .select("restaurant_id, is_enabled, channel, delay_minutes")
      .in("restaurant_id", restaurantIds),
    supabase.from("restaurants").select("id, name").in("id", restaurantIds),
  ]);

  const settingsByRestaurant = new Map((settings ?? []).map((item) => [item.restaurant_id, item]));
  const restaurantsById = new Map((restaurants ?? []).map((item) => [item.id, item]));

  let sent = 0;

  for (const reservation of reservations) {
    const restaurant = restaurantsById.get(reservation.restaurant_id);
    const automation = settingsByRestaurant.get(reservation.restaurant_id);

    if (!restaurant || !automation) continue;
    if (!automation.is_enabled || automation.channel !== "email") continue;

    const completedAt = toCompletedAt(reservation.reservation_date, reservation.reservation_time);
    const sendAt = new Date(completedAt.getTime() + automation.delay_minutes * 60 * 1000);
    if (now < sendAt) continue;

    const reviewUrl = `${appUrl}/review/${reservation.id}`;

    try {
      await sendReviewRequestEmail({
        to: reservation.guest_email as string,
        customerName: reservation.guest_name || "Client",
        restaurantName: restaurant.name,
        reviewUrl,
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
