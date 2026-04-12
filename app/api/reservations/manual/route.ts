import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";
import { calendarYmdInBusinessTz } from "@/src/lib/date/business-calendar";
import { expireTrialIfNeeded, isRestaurantExpired } from "@/src/lib/subscription";

type ManualReservationPayload = {
  guestName?: string;
  guestPhone?: string;
  guestEmail?: string;
  reservationDate?: string;
  reservationTime?: string;
  guests?: number;
  note?: string;
  zone?: string;
  /** Walk-in : champs contact optionnels, type `walkin` en base. */
  isWalkIn?: boolean;
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
  const isWalkIn = body.isWalkIn === true;
  const guestNameRaw = body.guestName?.trim();
  const guestPhoneRaw = body.guestPhone?.trim();
  const guestEmail = normalize(body.guestEmail);
  const reservationDate = body.reservationDate?.trim();
  const reservationTime = body.reservationTime?.trim().slice(0, 5);
  const guests = Number(body.guests);
  const note = isWalkIn ? null : normalize(body.note);
  const bodyZone = typeof body.zone === "string" ? body.zone.trim() : "";

  if (!reservationDate || !reservationTime || !Number.isInteger(guests) || guests <= 0) {
    return NextResponse.json({ error: "Données invalides." }, { status: 400 });
  }

  if (isWalkIn) {
    if (guestNameRaw && guestNameRaw.length > 200) {
      return NextResponse.json({ error: "Données invalides." }, { status: 400 });
    }
  } else if (!guestNameRaw || !guestPhoneRaw) {
    return NextResponse.json({ error: "Données invalides." }, { status: 400 });
  }

  const guestName = isWalkIn ? (guestNameRaw && guestNameRaw.length > 0 ? guestNameRaw : "Sur place") : guestNameRaw!;
  const guestPhone = isWalkIn ? (guestPhoneRaw && guestPhoneRaw.length > 0 ? guestPhoneRaw : null) : guestPhoneRaw!;

  if (!/^\d{2}:\d{2}$/.test(reservationTime)) {
    return NextResponse.json({ error: "Ce créneau n'est pas valide." }, { status: 400 });
  }

  const todayYmd = calendarYmdInBusinessTz();
  if (reservationDate < todayYmd) {
    return NextResponse.json({ error: "Impossible d’utiliser une date passée." }, { status: 400 });
  }

  if (!isWalkIn) {
    const reservationDateTimeMs = toDateTimeMs(reservationDate, reservationTime);
    if (Number.isNaN(reservationDateTimeMs) || reservationDateTimeMs < Date.now()) {
      return NextResponse.json({ error: "Impossible de réserver dans le passé." }, { status: 400 });
    }
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

  const { data: settings } = await supabase
    .from("restaurant_settings")
    .select("max_party_size, use_tables, terrace_enabled")
    .eq("restaurant_id", restaurant.id)
    .maybeSingle();

  const maxPartySize = settings?.max_party_size ?? 8;
  const useTables = settings?.use_tables ?? false;
  const terraceEnabled = settings?.terrace_enabled === true;

  let reservationZone: "interior" | "terrace" = "interior";
  if (terraceEnabled) {
    if (bodyZone !== "interior" && bodyZone !== "terrace") {
      return NextResponse.json({ error: "Indiquez la zone : intérieur ou terrasse." }, { status: 400 });
    }
    reservationZone = bodyZone as "interior" | "terrace";
  }
  if (guests > maxPartySize) {
    return NextResponse.json(
      { error: `Le nombre maximum de personnes par réservation est de ${maxPartySize}.` },
      { status: 409 },
    );
  }

  const { data: slotsData, error: availError } = await supabase.rpc("get_available_slots", {
    p_restaurant_id: restaurant.id,
    p_date: reservationDate,
    p_covers: guests,
    p_zone: reservationZone,
  });

  if (availError) {
    return NextResponse.json({ error: "Impossible de vérifier les disponibilités." }, { status: 500 });
  }

  type SlotRow = { time: string; suggestedTableId?: string | null };
  let slots: SlotRow[] = [];
  if (Array.isArray(slotsData)) {
    slots = slotsData as SlotRow[];
  } else if (typeof slotsData === "string") {
    try {
      const parsed = JSON.parse(slotsData) as unknown;
      if (Array.isArray(parsed)) slots = parsed as SlotRow[];
    } catch {
      slots = [];
    }
  }
  const slotMatch = slots.find((s) => s.time === reservationTime);
  if (!slotMatch) {
    return NextResponse.json(
      { error: "Ce créneau n’est pas disponible ou n’a plus assez de places." },
      { status: 409 },
    );
  }

  let tableId: string | null = null;
  if (useTables && reservationZone === "interior") {
    const suggested = slotMatch.suggestedTableId;
    if (!suggested) {
      return NextResponse.json(
        { error: "Aucune table disponible pour ce créneau et ce nombre de convives." },
        { status: 409 },
      );
    }
    tableId = suggested;
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
      table_id: tableId,
      zone: reservationZone,
      reservation_type: isWalkIn ? "walkin" : "standard",
    })
    .select(
      "id, reservation_date, reservation_time, guest_name, guest_phone, guest_email, guests, status, internal_note, created_at, table_id, zone, reservation_type",
    )
    .single();

  if (insertError || !reservation) {
    const rawMessage = insertError?.message ?? "Impossible de créer la réservation.";
    const normalizedMessage = rawMessage.toLowerCase();
    if (
      normalizedMessage.includes("slot_full") ||
      normalizedMessage.includes("table_taken") ||
      normalizedMessage.includes("table_capacity") ||
      normalizedMessage.includes("table_required")
    ) {
      return NextResponse.json(
        { error: "Aucune table disponible ou créneau complet." },
        { status: 409 },
      );
    }
    if (normalizedMessage.includes("max_party") || normalizedMessage.includes("max party")) {
      return NextResponse.json(
        { error: `Le nombre maximum de personnes par réservation est de ${maxPartySize}.` },
        { status: 409 },
      );
    }
    if (normalizedMessage.includes("invalid_slot") || normalizedMessage.includes("invalid_time")) {
      return NextResponse.json({ error: "Ce créneau n'est pas valide." }, { status: 409 });
    }
    return NextResponse.json({ error: rawMessage }, { status: 400 });
  }

  return NextResponse.json({ ok: true, reservation });
}
