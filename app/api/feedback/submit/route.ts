import { NextRequest, NextResponse } from "next/server";
import { sendNegativeFeedbackEmail } from "@/lib/email";
import { createClient } from "@/src/lib/supabase/server";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    reservationId?: string;
    restaurantId?: string;
    rating?: number;
    message?: string;
  };

  const reservationId = body.reservationId;
  const restaurantId = body.restaurantId;
  const rating = body.rating;
  const message = (body.message || "").trim();

  if (!reservationId || !restaurantId || !rating || rating < 1 || rating > 5 || !message) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const supabase = await createClient();
  const { error: feedbackError } = await supabase.from("feedbacks").insert(
    {
      restaurant_id: restaurantId,
      reservation_id: reservationId,
      message,
    },
  );

  if (feedbackError) {
    console.error("Feedback insert failed", feedbackError);
    return NextResponse.json({ error: feedbackError.message }, { status: 500 });
  }

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("name, email")
    .eq("id", restaurantId)
    .single();

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

  return NextResponse.json({ ok: true });
}
