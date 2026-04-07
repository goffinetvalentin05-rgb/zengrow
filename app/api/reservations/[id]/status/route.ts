import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";
import { sendReservationConfirmationEmail } from "@/lib/email";
import { expireTrialIfNeeded, isRestaurantExpired } from "@/src/lib/subscription";

const allowedStatuses = new Set(["pending", "confirmed", "refused", "completed", "cancelled", "no-show"]);

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, { params }: RouteParams) {
  const supabase = await createClient();
  const { id } = await params;

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const body = (await request.json()) as { status?: string };
  if (!body.status || !allowedStatuses.has(body.status)) {
    return NextResponse.json({ error: "Statut invalide." }, { status: 400 });
  }

  const { data: reservation, error: reservationError } = await supabase
    .from("reservations")
    .select("id, restaurant_id, guest_name, guest_email, guests, reservation_date, reservation_time, status")
    .eq("id", id)
    .single();

  if (reservationError || !reservation) {
    return NextResponse.json({ error: "Réservation introuvable." }, { status: 404 });
  }

  const { data: restaurant, error: restaurantError } = await supabase
    .from("restaurants")
    .select("id, name, owner_id, subscription_status, trial_end_date, stripe_subscription_id")
    .eq("id", reservation.restaurant_id)
    .eq("owner_id", authData.user.id)
    .single();

  if (restaurantError || !restaurant) {
    return NextResponse.json({ error: "Accès interdit." }, { status: 403 });
  }

  const syncedRestaurant = await expireTrialIfNeeded(supabase, restaurant);
  if (isRestaurantExpired(syncedRestaurant)) {
    return NextResponse.json({ error: "Abonnement expiré. Mettez à jour votre formule." }, { status: 402 });
  }

  const previousStatus = reservation.status;
  const { error: updateError } = await supabase
    .from("reservations")
    .update({ status: body.status })
    .eq("id", id)
    .eq("restaurant_id", restaurant.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }

  const shouldSendConfirmation =
    body.status === "confirmed" && previousStatus !== "confirmed" && Boolean(reservation.guest_email);

  if (shouldSendConfirmation && reservation.guest_email) {
    try {
      await sendReservationConfirmationEmail({
        to: reservation.guest_email,
        customerName: reservation.guest_name || "Client",
        restaurantName: restaurant.name,
        date: reservation.reservation_date,
        time: reservation.reservation_time,
        guests: reservation.guests,
      });
    } catch (error) {
      console.error("Confirmation email failed", error);
    }
  }

  return NextResponse.json({ ok: true });
}
