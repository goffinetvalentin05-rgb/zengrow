import {
  sendReservationConfirmationEmail,
  sendReservationReceivedEmail,
} from "@/lib/email";
import { expireTrialIfNeeded, isRestaurantExpired } from "@/src/lib/subscription";
import { mapReservationRpcError } from "@/src/lib/reservation/map-reservation-error";
import type { PublicReservationPostInput } from "@/src/lib/reservation/schemas";
import { generateTimeSlotsForDate, type OpeningHours } from "@/src/lib/utils";
import type { SupabaseClient } from "@supabase/supabase-js";

export type ExecutePublicReservationResult =
  | { ok: true; status: string }
  | { ok: false; status: number; error: string };

function normalizeTime(value: string) {
  return value.slice(0, 5);
}

function toDateTimeMs(date: string, time: string) {
  return new Date(`${date}T${time}:00`).getTime();
}

export async function executePublicReservation(
  supabase: SupabaseClient,
  parsed: PublicReservationPostInput,
): Promise<ExecutePublicReservationResult> {
  const restaurantId = parsed.restaurantId;
  const guestName = parsed.guestName.trim();
  const guestEmail = parsed.guestEmail?.trim() ?? null;
  const guestPhone = parsed.guestPhone?.trim() ?? null;
  const guests = parsed.guests;
  const reservationDate = parsed.reservationDate;
  const reservationTime = normalizeTime(parsed.reservationTime);

  const reservationDateTimeMs = toDateTimeMs(reservationDate, reservationTime);
  if (Number.isNaN(reservationDateTimeMs) || reservationDateTimeMs < Date.now()) {
    return { ok: false, status: 400, error: "Impossible de réserver dans le passé." };
  }

  const { data: restaurant, error: restaurantError } = await supabase
    .from("restaurants")
    .select("id, name, reservation_confirmation_mode, subscription_status, trial_end_date, stripe_subscription_id")
    .eq("id", restaurantId)
    .single();

  if (restaurantError || !restaurant) {
    return { ok: false, status: 404, error: "Restaurant introuvable." };
  }

  const syncedRestaurant = await expireTrialIfNeeded(supabase, restaurant);
  if (isRestaurantExpired(syncedRestaurant)) {
    return { ok: false, status: 402, error: "Les réservations sont suspendues pour ce restaurant." };
  }

  const { data: settings } = await supabase
    .from("restaurant_settings")
    .select(
      "opening_hours, reservation_slot_interval, max_party_size, closure_start_date, closure_end_date, closure_message, days_in_advance, terrace_enabled, allow_phone, allow_email",
    )
    .eq("restaurant_id", restaurantId)
    .maybeSingle();

  const allowEmail = settings?.allow_email !== false;
  const allowPhone = settings?.allow_phone !== false;

  if (allowEmail && !guestEmail?.trim()) {
    return { ok: false, status: 400, error: "L'adresse e-mail est requise." };
  }
  if (allowPhone && !guestPhone?.trim()) {
    return { ok: false, status: 400, error: "Le numéro de téléphone est requis." };
  }
  const phoneDigits = (guestPhone ?? "").replace(/\D/g, "");
  if (guestPhone?.trim() && phoneDigits.length < 8) {
    return { ok: false, status: 400, error: "Numéro de téléphone invalide." };
  }

  const terraceEnabled = settings?.terrace_enabled === true;
  if (terraceEnabled && parsed.zone !== "interior" && parsed.zone !== "terrace") {
    return {
      ok: false,
      status: 400,
      error: "Indiquez si la réservation est en salle ou en terrasse.",
    };
  }
  const reservationZone: "interior" | "terrace" = terraceEnabled ? parsed.zone! : "interior";

  const slotInterval = settings?.reservation_slot_interval ?? 30;
  const maxPartySize = settings?.max_party_size ?? 8;
  const daysInAdvance = settings?.days_in_advance ?? 60;
  const openingHours = (settings?.opening_hours as OpeningHours | null) ?? null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const maxBook = new Date(today);
  maxBook.setDate(maxBook.getDate() + daysInAdvance);
  const selected = new Date(`${reservationDate}T12:00:00`);
  if (selected < today || selected > maxBook) {
    return {
      ok: false,
      status: 409,
      error: `Les réservations sont possibles uniquement dans les ${daysInAdvance} prochains jours.`,
    };
  }

  const isClosedPeriod =
    Boolean(settings?.closure_start_date) &&
    Boolean(settings?.closure_end_date) &&
    reservationDate >= String(settings?.closure_start_date) &&
    reservationDate <= String(settings?.closure_end_date);

  if (isClosedPeriod) {
    const closureMessage = settings?.closure_message?.trim();
    const prefix = closureMessage ? `${closureMessage} — ` : "";
    return {
      ok: false,
      status: 409,
      error: `${prefix}Le restaurant est fermé du ${settings?.closure_start_date} au ${settings?.closure_end_date}. Les réservations restent disponibles après cette période.`,
    };
  }

  const availableSlots = generateTimeSlotsForDate(reservationDate, openingHours, slotInterval);
  if (!availableSlots.includes(reservationTime)) {
    return { ok: false, status: 409, error: "Ce créneau n'est pas disponible (restaurant fermé ou horaire invalide)." };
  }

  if (guests > maxPartySize) {
    return {
      ok: false,
      status: 409,
      error: `Le nombre maximum de personnes par réservation est de ${maxPartySize}.`,
    };
  }

  const confirmationMode =
    syncedRestaurant.reservation_confirmation_mode === "automatic" ? "automatic" : "manual";
  const status = confirmationMode === "automatic" ? "confirmed" : "pending";

  const { data: rpcData, error: rpcError } = await supabase.rpc("create_public_reservation", {
    p_restaurant_id: restaurantId,
    p_guest_name: guestName,
    p_guest_email: guestEmail,
    p_guest_phone: guestPhone,
    p_guests: guests,
    p_reservation_date: reservationDate,
    p_reservation_time: reservationTime,
    p_status: status,
    p_source: "public_link",
    p_zone: reservationZone,
  });

  if (rpcError || !rpcData) {
    const msg = mapReservationRpcError(rpcError, "Impossible de créer la réservation.", maxPartySize);
    const code = rpcError?.message?.toLowerCase() ?? "";
    const isConflict =
      code.includes("slot_full") ||
      code.includes("table") ||
      code.includes("max_party") ||
      code.includes("invalid_slot") ||
      code.includes("invalid_time") ||
      code.includes("terrace_disabled");
    return { ok: false, status: isConflict ? 409 : 400, error: msg };
  }

  const row = rpcData as { id?: string; status?: string };
  const finalStatus = typeof row.status === "string" ? row.status : status;

  if (finalStatus === "confirmed" && guestEmail) {
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
  } else if (finalStatus === "pending" && guestEmail) {
    try {
      await sendReservationReceivedEmail({
        to: guestEmail,
        customerName: guestName || "Client",
        restaurantName: restaurant.name,
        date: reservationDate,
        time: reservationTime,
        guests,
      });
    } catch (error) {
      console.error("Pending reservation acknowledgment email failed", error);
    }
  }

  return { ok: true, status: finalStatus };
}
