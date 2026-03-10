import { NextRequest, NextResponse } from "next/server";
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

  if (rating <= 3 && !message) {
    return NextResponse.json({ error: "Message is required for low ratings" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: reservation, error: reservationError } = await supabase
    .from("reservations")
    .select("id, restaurant_id, guest_name, guest_email, status")
    .eq("id", reservationId)
    .single();

  if (reservationError || !reservation) {
    return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
  }

  if (reservation.status !== "completed") {
    return NextResponse.json({ error: "Reservation is not completed" }, { status: 400 });
  }

  const { data: automation } = await supabase
    .from("review_automation_settings")
    .select("google_review_url")
    .eq("restaurant_id", reservation.restaurant_id)
    .maybeSingle();

  if (rating <= 3) {
    const { error: feedbackError } = await supabase.from("feedbacks").upsert(
      {
        restaurant_id: reservation.restaurant_id,
        reservation_id: reservation.id,
        customer_name: reservation.guest_name || "Client",
        customer_email: reservation.guest_email || null,
        rating,
        message,
      },
      { onConflict: "reservation_id" },
    );

    if (feedbackError) {
      return NextResponse.json({ error: feedbackError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, redirectToGoogle: false });
  }

  return NextResponse.json({
    ok: true,
    redirectToGoogle: true,
    googleReviewUrl: automation?.google_review_url || null,
  });
}
