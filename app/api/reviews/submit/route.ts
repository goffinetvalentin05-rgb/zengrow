import { NextRequest, NextResponse } from "next/server";
import { sendNegativeFeedbackEmail } from "@/lib/email";
import { createAdminClient } from "@/src/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    reservationId?: string;
    rating?: number;
    message?: string;
  };

  const reservationId = body.reservationId;
  const rating = body.rating;
  const message = (body.message || "").trim();

  if (!reservationId || !rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: reservation, error: reservationError } = await supabase
    .from("reservations")
    .select("id, restaurant_id, status")
    .eq("id", reservationId)
    .single();

  if (reservationError || !reservation) {
    return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
  }

  if (reservation.status !== "completed") {
    return NextResponse.json({ error: "Reservation is not completed" }, { status: 400 });
  }

  const [{ data: restaurant }, { data: automation }] = await Promise.all([
    supabase.from("restaurants").select("id, name, email").eq("id", reservation.restaurant_id).single(),
    supabase
      .from("review_automation_settings")
      .select("google_review_url")
      .eq("restaurant_id", reservation.restaurant_id)
      .maybeSingle(),
  ]);

  if (rating <= 3) {
    const { error: feedbackError } = await supabase.from("customer_feedback").upsert(
      {
        restaurant_id: reservation.restaurant_id,
        reservation_id: reservation.id,
        rating,
        message: message || null,
      },
      { onConflict: "reservation_id" },
    );

    if (feedbackError) {
      return NextResponse.json({ error: feedbackError.message }, { status: 500 });
    }

    if (restaurant?.email) {
      try {
        await sendNegativeFeedbackEmail({
          to: restaurant.email,
          restaurantName: restaurant.name || "Restaurant",
          rating,
          message,
        });
      } catch (error) {
        console.error("Negative feedback email failed", { reservationId, error });
      }
    }

    return NextResponse.json({ ok: true, redirectToGoogle: false });
  }

  return NextResponse.json({
    ok: true,
    redirectToGoogle: true,
    googleReviewUrl: automation?.google_review_url || null,
  });
}
