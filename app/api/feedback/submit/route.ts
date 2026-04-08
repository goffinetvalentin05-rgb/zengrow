import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/src/lib/supabase/admin";

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
    const supabase = createAdminClient();

    if (body.token) {
      const { data: row, error: fetchError } = await supabase
        .from("feedbacks")
        .select("id, responded_at")
        .eq("token", body.token)
        .maybeSingle();

      if (fetchError || !row || row.responded_at) {
        return NextResponse.json({ error: invalidMsg }, { status: 400 });
      }

      const { data: updated, error: updateError } = await supabase
        .from("feedbacks")
        .update({
          rating,
          message,
          responded_at: new Date().toISOString(),
        })
        .eq("id", row.id)
        .is("responded_at", null)
        .select("id")
        .maybeSingle();

      if (updateError || !updated) {
        if (updateError) console.error("Feedback token update failed", updateError);
        return NextResponse.json({ error: invalidMsg }, { status: 400 });
      }

      return NextResponse.json({ ok: true });
    }

    const reservationId = body.reservationId;
    const restaurantId = body.restaurantId;
    const customerName = (body.customerName || "").trim();
    const customerEmail = (body.customerEmail || "").trim();

    if (!reservationId) {
      return NextResponse.json({ error: invalidMsg }, { status: 400 });
    }

    const { data: reservation, error: reservationError } = await supabase
      .from("reservations")
      .select("id, restaurant_id, guest_name, guest_email, status")
      .eq("id", reservationId)
      .single();

    if (reservationError || !reservation) {
      return NextResponse.json({ error: invalidMsg }, { status: 404 });
    }

    if (restaurantId && reservation.restaurant_id !== restaurantId) {
      return NextResponse.json({ error: invalidMsg }, { status: 400 });
    }

    if (reservation.status !== "completed") {
      return NextResponse.json({ error: "La réservation n'est pas terminée." }, { status: 400 });
    }

    const { error: insertError } = await supabase.from("feedbacks").insert({
      restaurant_id: reservation.restaurant_id,
      reservation_id: reservationId,
      customer_name: customerName || reservation.guest_name || "Client",
      customer_email: customerEmail || reservation.guest_email || null,
      rating,
      message,
      responded_at: new Date().toISOString(),
      token: null,
      initial_response: null,
    });

    if (insertError) {
      console.error("Feedback legacy insert failed", insertError);
      return NextResponse.json({ error: "Impossible d'enregistrer votre retour." }, { status: 500 });
    }
  } catch (error) {
    console.error("Feedback submit route failed", error);
    return NextResponse.json({ error: "Erreur interne du serveur." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
