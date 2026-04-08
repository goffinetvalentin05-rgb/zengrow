import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    token?: string;
    reservationId?: string;
    restaurantId?: string;
    rating?: number;
    customerName?: string;
    customerEmail?: string;
    message?: string;
  };

  const rating = body.rating;
  const message = (body.message || "").trim();
  const invalidMsg = "Ce lien a déjà été utilisé ou est invalide.";

  if (!rating || rating < 1 || rating > 5 || !message) {
    return NextResponse.json({ error: "Données invalides." }, { status: 400 });
  }

  try {
    const supabase = await createClient();

    if (body.token) {
      const token = body.token.trim();
      const { data: ok, error } = await supabase.rpc("submit_feedback_by_token", {
        p_token: token,
        p_rating: rating,
        p_message: message,
      });

      if (error) {
        console.error("submit_feedback_by_token", error);
        return NextResponse.json({ error: invalidMsg }, { status: 400 });
      }
      if (!ok) {
        return NextResponse.json({ error: invalidMsg }, { status: 400 });
      }

      return NextResponse.json({ ok: true });
    }

    const reservationId = body.reservationId;
    const restaurantId = body.restaurantId;
    const customerName = (body.customerName || "").trim();
    const customerEmail = (body.customerEmail || "").trim();

    if (!reservationId || !restaurantId) {
      return NextResponse.json({ error: invalidMsg }, { status: 400 });
    }

    const { data: ok, error } = await supabase.rpc("submit_feedback_legacy", {
      p_reservation_id: reservationId,
      p_restaurant_id: restaurantId,
      p_rating: rating,
      p_message: message,
      p_customer_name: customerName,
      p_customer_email: customerEmail,
    });

    if (error) {
      console.error("submit_feedback_legacy", error);
      return NextResponse.json({ error: invalidMsg }, { status: 400 });
    }
    if (!ok) {
      return NextResponse.json({ error: invalidMsg }, { status: 400 });
    }
  } catch (error) {
    console.error("Feedback submit route failed", error);
    return NextResponse.json({ error: "Erreur interne du serveur." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
