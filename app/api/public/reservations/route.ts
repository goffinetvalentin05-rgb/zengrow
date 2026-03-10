import { NextRequest, NextResponse } from "next/server";
import { sendReservationConfirmationEmail } from "@/lib/email";
import { expireTrialIfNeeded, isRestaurantExpired } from "@/src/lib/subscription";
import { generateTimeSlotsForDate, OpeningHours } from "@/src/lib/utils";
import { createClient } from "@/src/lib/supabase/server";

type ReservationPayload = {
  restaurantId?: string;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  guests?: number;
  reservationDate?: string;
  reservationTime?: string;
};

function normalize(value?: string) {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : null;
}

function toDateTimeMs(date: string, time: string) {
  return new Date(`${date}T${time}:00`).getTime();
}

function normalizeTime(value: string) {
  return value.slice(0, 5);
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as ReservationPayload;
  const restaurantId = body.restaurantId?.trim();
  const guestName = body.guestName?.trim();
  const guestEmail = normalize(body.guestEmail);
  const guestPhone = normalize(body.guestPhone);
  const guests = Number(body.guests);
  const reservationDate = body.reservationDate?.trim();
  const reservationTime = body.reservationTime?.trim();

  if (!restaurantId || !guestName || !reservationDate || !reservationTime || !Number.isInteger(guests) || guests <= 0) {
    return NextResponse.json({ error: "Données invalides." }, { status: 400 });
  }

  const normalizedReservationTime = normalizeTime(reservationTime);
  if (!/^\d{2}:\d{2}$/.test(normalizedReservationTime)) {
    return NextResponse.json({ error: "Ce créneau n'est pas valide." }, { status: 400 });
  }

  const reservationDateTimeMs = toDateTimeMs(reservationDate, normalizedReservationTime);
  if (Number.isNaN(reservationDateTimeMs) || reservationDateTimeMs < Date.now()) {
    return NextResponse.json({ error: "Impossible de réserver dans le passé." }, { status: 400 });
  }

  const supabase = await createClient();

  const [{ data: restaurant, error: restaurantError }, { data: settings }, { data: blockedSlots }, { data: slotReservations }] = await Promise.all([
    supabase
      .from("restaurants")
      .select("id, name, reservation_confirmation_mode, subscription_status, trial_end_date, stripe_subscription_id")
      .eq("id", restaurantId)
      .single(),
    supabase
      .from("restaurant_settings")
      .select(
        "opening_hours, reservation_slot_interval, reservation_duration, restaurant_capacity, max_party_size, closure_start_date, closure_end_date, closure_message",
      )
      .eq("restaurant_id", restaurantId)
      .maybeSingle(),
    supabase
      .from("blocked_slots")
      .select("id")
      .eq("restaurant_id", restaurantId)
      .eq("reservation_date", reservationDate)
      .eq("reservation_time", normalizedReservationTime)
      .limit(1),
    supabase
      .from("reservations")
      .select("guests")
      .eq("restaurant_id", restaurantId)
      .eq("reservation_date", reservationDate)
      .eq("reservation_time", normalizedReservationTime)
      .in("status", ["pending", "confirmed"]),
  ]);

  if (restaurantError || !restaurant) {
    return NextResponse.json({ error: "Restaurant introuvable." }, { status: 404 });
  }

  const syncedRestaurant = await expireTrialIfNeeded(supabase, restaurant);
  if (isRestaurantExpired(syncedRestaurant)) {
    return NextResponse.json({ error: "Les reservations sont suspendues pour ce restaurant." }, { status: 402 });
  }

  const slotInterval = settings?.reservation_slot_interval ?? 30;
  const restaurantCapacity = settings?.restaurant_capacity ?? 40;
  const maxPartySize = settings?.max_party_size ?? 8;
  const openingHours = (settings?.opening_hours as OpeningHours | null) ?? null;
  const availableSlots = generateTimeSlotsForDate(reservationDate, openingHours, slotInterval);
  const isBlocked = Boolean(blockedSlots && blockedSlots.length > 0);
  const isSlotInOpeningHours = availableSlots.includes(normalizedReservationTime);
  const isClosedPeriod =
    Boolean(settings?.closure_start_date) &&
    Boolean(settings?.closure_end_date) &&
    reservationDate >= String(settings?.closure_start_date) &&
    reservationDate <= String(settings?.closure_end_date);

  if (isClosedPeriod) {
    const closureMessage = settings?.closure_message?.trim();
    const prefix = closureMessage ? `${closureMessage} - ` : "";
    return NextResponse.json(
      {
        error: `${prefix}Le restaurant est fermé du ${settings?.closure_start_date} au ${settings?.closure_end_date}. Les réservations restent disponibles après cette période.`,
      },
      { status: 409 },
    );
  }

  if (!isSlotInOpeningHours || isBlocked) {
    return NextResponse.json({ error: "Ce créneau n'est pas disponible." }, { status: 409 });
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

  const confirmationMode =
    syncedRestaurant.reservation_confirmation_mode === "automatic" ? "automatic" : "manual";
  const status = confirmationMode === "automatic" ? "confirmed" : "pending";

  const { data: reservation, error: insertError } = await supabase
    .from("reservations")
    .insert({
      restaurant_id: restaurantId,
      guest_name: guestName,
      guest_email: guestEmail,
      guest_phone: guestPhone,
      guests,
      reservation_date: reservationDate,
      reservation_time: normalizedReservationTime,
      source: "public_link",
      status,
    })
    .select("id, status")
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

  if (status === "confirmed" && guestEmail) {
    try {
      await sendReservationConfirmationEmail({
        to: guestEmail,
        customerName: guestName || "Client",
        restaurantName: restaurant.name,
        date: reservationDate,
        time: normalizedReservationTime,
        guests,
      });
    } catch (error) {
      console.error("Automatic confirmation email failed", error);
    }
  }

  return NextResponse.json({ ok: true, status: reservation.status });
}
