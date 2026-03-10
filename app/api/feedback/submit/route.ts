import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/src/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    reservationId?: string;
    restaurantId?: string;
    rating?: number;
    customerName?: string;
    customerEmail?: string;
    message?: string;
  };

  const reservationId = body.reservationId;
  const restaurantId = body.restaurantId;
  const rating = body.rating;
  const customerName = (body.customerName || "").trim();
  const customerEmail = (body.customerEmail || "").trim();
  const message = (body.message || "").trim();

  if (!reservationId || !rating || rating < 1 || rating > 5 || !message) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  try {
    const supabase = createAdminClient();
    const { data: reservation, error: reservationError } = await supabase
      .from("reservations")
      .select("id, restaurant_id, guest_name, guest_email, status")
      .eq("id", reservationId)
      .single();

    if (reservationError || !reservation) {
      return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
    }

    if (restaurantId && reservation.restaurant_id !== restaurantId) {
      return NextResponse.json({ error: "Invalid reservation context" }, { status: 400 });
    }

    if (reservation.status !== "completed") {
      return NextResponse.json({ error: "Reservation is not completed" }, { status: 400 });
    }

    const { error: feedbackError } = await supabase.from("feedbacks").upsert(
      {
        restaurant_id: reservation.restaurant_id,
        reservation_id: reservationId,
        customer_name: customerName || reservation.guest_name || "Client",
        customer_email: customerEmail || reservation.guest_email || null,
        rating,
        message,
      },
      { onConflict: "reservation_id" },
    );

    if (feedbackError) {
      console.error("Feedback insert failed", feedbackError);
      return NextResponse.json({ error: feedbackError.message }, { status: 500 });
    }
  } catch (error) {
    console.error("Feedback submit route failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
