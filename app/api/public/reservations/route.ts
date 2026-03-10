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

  const supabase = await createClient();

  const [{ data: restaurant, error: restaurantError }, { data: settings }, { data: blockedSlots }] = await Promise.all([
    supabase
      .from("restaurants")
      .select("id, name, reservation_confirmation_mode, subscription_status, trial_end_date, stripe_subscription_id")
      .eq("id", restaurantId)
      .single(),
    supabase
      .from("restaurant_settings")
      .select("opening_hours, reservation_slot_interval, reservation_duration, restaurant_capacity")
      .eq("restaurant_id", restaurantId)
      .maybeSingle(),
    supabase
      .from("blocked_slots")
      .select("id")
      .eq("restaurant_id", restaurantId)
      .eq("reservation_date", reservationDate)
      .eq("reservation_time", reservationTime)
      .limit(1),
  ]);

  if (restaurantError || !restaurant) {
    return NextResponse.json({ error: "Restaurant introuvable." }, { status: 404 });
  }

  const syncedRestaurant = await expireTrialIfNeeded(supabase, restaurant);
  if (isRestaurantExpired(syncedRestaurant)) {
    return NextResponse.json({ error: "Les reservations sont suspendues pour ce restaurant." }, { status: 402 });
  }

  const slotInterval = settings?.reservation_slot_interval ?? 30;
  const openingHours = (settings?.opening_hours as OpeningHours | null) ?? null;
  const availableSlots = generateTimeSlotsForDate(reservationDate, openingHours, slotInterval);
  const isBlocked = Boolean(blockedSlots && blockedSlots.length > 0);
  const isSlotInOpeningHours = availableSlots.includes(reservationTime);

  if (!isSlotInOpeningHours || isBlocked) {
    return NextResponse.json({ error: "Ce créneau n'est pas disponible." }, { status: 409 });
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
      reservation_time: reservationTime,
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
      return NextResponse.json({ error: "Ce créneau n'est plus disponible." }, { status: 409 });
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
        time: reservationTime,
        guests,
      });
    } catch (error) {
      console.error("Automatic confirmation email failed", error);
    }
  }

  return NextResponse.json({ ok: true, status: reservation.status });
}
