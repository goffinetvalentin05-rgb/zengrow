import { NextRequest, NextResponse } from "next/server";
import { sendReservationConfirmationEmail } from "@/lib/email";
import { generateTimeSlotsForDate, OpeningHours } from "@/src/lib/utils";
import { createAdminClient } from "@/src/lib/supabase/admin";

type ReservationPayload = {
  restaurantId?: string;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  guests?: number;
  reservationDate?: string;
  reservationTime?: string;
};

function toMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

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
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const [{ data: restaurant, error: restaurantError }, { data: settings }, { data: blockedSlots }] = await Promise.all([
    supabase
      .from("restaurants")
      .select("id, name, reservation_confirmation_mode")
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
    return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
  }

  const slotInterval = settings?.reservation_slot_interval ?? 30;
  const reservationDuration = settings?.reservation_duration ?? 90;
  const restaurantCapacity = settings?.restaurant_capacity ?? 40;
  const openingHours = (settings?.opening_hours as OpeningHours | null) ?? null;
  const availableSlots = generateTimeSlotsForDate(reservationDate, openingHours, slotInterval);
  const isBlocked = Boolean(blockedSlots && blockedSlots.length > 0);
  const isSlotInOpeningHours = availableSlots.includes(reservationTime);

  if (!isSlotInOpeningHours || isBlocked) {
    return NextResponse.json({ error: "Ce creneau n'est pas disponible." }, { status: 409 });
  }

  const { data: sameDayReservations, error: reservationsError } = await supabase
    .from("reservations")
    .select("reservation_time, guests")
    .eq("restaurant_id", restaurantId)
    .eq("reservation_date", reservationDate)
    .in("status", ["pending", "confirmed"]);

  if (reservationsError) {
    return NextResponse.json({ error: reservationsError.message }, { status: 500 });
  }

  const newStart = toMinutes(reservationTime);
  const newEnd = newStart + reservationDuration;

  const usedSeats = (sameDayReservations ?? []).reduce((total, current) => {
    const currentStart = toMinutes(current.reservation_time);
    const currentEnd = currentStart + reservationDuration;
    const overlaps = currentStart < newEnd && currentEnd > newStart;
    return overlaps ? total + current.guests : total;
  }, 0);

  if (usedSeats + guests > restaurantCapacity) {
    return NextResponse.json({ error: "Ce creneau n'est plus disponible." }, { status: 409 });
  }

  const confirmationMode =
    restaurant.reservation_confirmation_mode === "automatic" ? "automatic" : "manual";
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
    return NextResponse.json({ error: insertError?.message ?? "Impossible de creer la reservation." }, { status: 400 });
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
