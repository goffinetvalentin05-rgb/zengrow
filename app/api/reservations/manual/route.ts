import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";
import { expireTrialIfNeeded, isRestaurantExpired } from "@/src/lib/subscription";

type ManualReservationPayload = {
  guestName?: string;
  guestPhone?: string;
  guestEmail?: string;
  reservationDate?: string;
  reservationTime?: string;
  guests?: number;
  note?: string;
};

function normalize(value?: string) {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : null;
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as ManualReservationPayload;
  const guestName = body.guestName?.trim();
  const guestPhone = body.guestPhone?.trim();
  const guestEmail = normalize(body.guestEmail);
  const reservationDate = body.reservationDate?.trim();
  const reservationTime = body.reservationTime?.trim().slice(0, 5);
  const guests = Number(body.guests);
  const note = normalize(body.note);

  if (!guestName || !guestPhone || !reservationDate || !reservationTime || !Number.isInteger(guests) || guests <= 0) {
    return NextResponse.json({ error: "Données invalides." }, { status: 400 });
  }

  const { data: restaurant, error: restaurantError } = await supabase
    .from("restaurants")
    .select("id, subscription_status, trial_end_date, stripe_subscription_id")
    .eq("owner_id", user.id)
    .single();

  if (restaurantError || !restaurant) {
    return NextResponse.json({ error: "Restaurant introuvable." }, { status: 404 });
  }

  const syncedRestaurant = await expireTrialIfNeeded(supabase, restaurant);
  if (isRestaurantExpired(syncedRestaurant)) {
    return NextResponse.json({ error: "Abonnement expiré. Mettez à jour votre formule." }, { status: 402 });
  }

  const { data: reservation, error: insertError } = await supabase
    .from("reservations")
    .insert({
      restaurant_id: restaurant.id,
      guest_name: guestName,
      guest_phone: guestPhone,
      guest_email: guestEmail,
      reservation_date: reservationDate,
      reservation_time: reservationTime,
      guests,
      internal_note: note,
      status: "confirmed",
      source: "manual_dashboard",
    })
    .select(
      "id, reservation_date, reservation_time, guest_name, guest_phone, guest_email, guests, status, internal_note, created_at",
    )
    .single();

  if (insertError || !reservation) {
    const rawMessage = insertError?.message ?? "Impossible de créer la réservation.";
    const normalizedMessage = rawMessage.toLowerCase();
    if (
      normalizedMessage.includes("capacity exceeded") ||
      normalizedMessage.includes("slot is full") ||
      normalizedMessage.includes("exceeds max party size")
    ) {
      return NextResponse.json({ error: "Capacité insuffisante sur ce créneau." }, { status: 409 });
    }
    return NextResponse.json({ error: rawMessage }, { status: 400 });
  }

  return NextResponse.json({ ok: true, reservation });
}
