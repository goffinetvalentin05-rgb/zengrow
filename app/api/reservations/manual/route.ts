import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";
import { expireTrialIfNeeded, isRestaurantExpired } from "@/src/lib/subscription";
import { generateTimeSlotsForDate, OpeningHours } from "@/src/lib/utils";

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

function toDateTimeMs(date: string, time: string) {
  return new Date(`${date}T${time}:00`).getTime();
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

  if (!/^\d{2}:\d{2}$/.test(reservationTime)) {
    return NextResponse.json({ error: "Ce créneau n'est pas valide." }, { status: 400 });
  }

  const reservationDateTimeMs = toDateTimeMs(reservationDate, reservationTime);
  if (Number.isNaN(reservationDateTimeMs) || reservationDateTimeMs < Date.now()) {
    return NextResponse.json({ error: "Impossible de réserver dans le passé." }, { status: 400 });
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

  const [{ data: settings }, { data: slotReservations }] = await Promise.all([
    supabase
      .from("restaurant_settings")
      .select("opening_hours, reservation_slot_interval, restaurant_capacity, max_party_size")
      .eq("restaurant_id", restaurant.id)
      .maybeSingle(),
    supabase
      .from("reservations")
      .select("guests")
      .eq("restaurant_id", restaurant.id)
      .eq("reservation_date", reservationDate)
      .eq("reservation_time", reservationTime)
      .in("status", ["pending", "confirmed"]),
  ]);

  const slotInterval = settings?.reservation_slot_interval ?? 30;
  const maxPartySize = settings?.max_party_size ?? 8;
  const restaurantCapacity = settings?.restaurant_capacity ?? 40;
  const openingHours = (settings?.opening_hours as OpeningHours | null) ?? null;
  const availableSlots = generateTimeSlotsForDate(reservationDate, openingHours, slotInterval);
  if (!availableSlots.includes(reservationTime)) {
    return NextResponse.json({ error: "Ce créneau n'est pas valide." }, { status: 409 });
  }
  if (guests > maxPartySize) {
    return NextResponse.json(
      { error: `Le nombre maximum de personnes par réservation est de ${maxPartySize}.` },
      { status: 409 },
    );
  }
  const existingPeopleInSlot = (slotReservations ?? []).reduce((total, row) => total + (row.guests ?? 0), 0);
  if (existingPeopleInSlot + guests > restaurantCapacity) {
    return NextResponse.json(
      { error: "Ce créneau n'a plus assez de places disponibles." },
      { status: 409 },
    );
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
      if (normalizedMessage.includes("max party size")) {
        return NextResponse.json(
          { error: `Le nombre maximum de personnes par réservation est de ${maxPartySize}.` },
          { status: 409 },
        );
      }
      return NextResponse.json({ error: "Ce créneau n'a plus assez de places disponibles." }, { status: 409 });
    }
    if (normalizedMessage.includes("invalid slot interval")) {
      return NextResponse.json({ error: "Ce créneau n'est pas valide." }, { status: 409 });
    }
    return NextResponse.json({ error: rawMessage }, { status: 400 });
  }

  return NextResponse.json({ ok: true, reservation });
}
