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
  zone?: string;
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
  const bodyZone = typeof body.zone === "string" ? body.zone.trim() : "";

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

  const { data: settings } = await supabase
    .from("restaurant_settings")
    .select(
      "opening_hours, reservation_slot_interval, restaurant_capacity, max_covers_per_slot, max_party_size, use_tables, terrace_enabled, terrace_capacity",
    )
    .eq("restaurant_id", restaurant.id)
    .maybeSingle();

  const slotInterval = settings?.reservation_slot_interval ?? 30;
  const maxPartySize = settings?.max_party_size ?? 8;
  const maxCoversPerSlot = settings?.max_covers_per_slot ?? settings?.restaurant_capacity ?? 40;
  const useTables = settings?.use_tables ?? false;
  const terraceEnabled = settings?.terrace_enabled === true;
  const terraceCapacity = settings?.terrace_capacity ?? 0;

  let reservationZone: "interior" | "terrace" = "interior";
  if (terraceEnabled) {
    if (bodyZone !== "interior" && bodyZone !== "terrace") {
      return NextResponse.json({ error: "Indiquez la zone : intérieur ou terrasse." }, { status: 400 });
    }
    reservationZone = bodyZone as "interior" | "terrace";
  }
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

  let tableId: string | null = null;

  if (useTables && reservationZone === "interior") {
    const { data: candidates } = await supabase
      .from("restaurant_tables")
      .select("id, min_covers, max_covers")
      .eq("restaurant_id", restaurant.id)
      .lte("min_covers", guests)
      .gte("max_covers", guests)
      .order("max_covers", { ascending: true })
      .order("min_covers", { ascending: true });

    const { data: takenRows } = await supabase
      .from("reservations")
      .select("table_id")
      .eq("restaurant_id", restaurant.id)
      .eq("reservation_date", reservationDate)
      .eq("reservation_time", reservationTime)
      .in("status", ["pending", "confirmed"])
      .not("table_id", "is", null);

    const taken = new Set((takenRows ?? []).map((r) => r.table_id).filter(Boolean) as string[]);
    const picked = candidates?.find((t) => !taken.has(t.id));
    if (!picked) {
      return NextResponse.json(
        { error: "Aucune table disponible pour ce créneau et ce nombre de convives." },
        { status: 409 },
      );
    }
    tableId = picked.id;
  } else if (useTables && reservationZone === "terrace") {
    tableId = null;
    if (terraceCapacity <= 0) {
      return NextResponse.json({ error: "La terrasse n'est pas configurée pour recevoir des réservations." }, { status: 409 });
    }
    const { data: slotRows } = await supabase
      .from("reservations")
      .select("guests")
      .eq("restaurant_id", restaurant.id)
      .eq("reservation_date", reservationDate)
      .eq("reservation_time", reservationTime)
      .eq("zone", "terrace")
      .in("status", ["pending", "confirmed"]);

    const existingPeopleInSlot = (slotRows ?? []).reduce((total, row) => total + (row.guests ?? 0), 0);
    if (existingPeopleInSlot + guests > terraceCapacity) {
      return NextResponse.json({ error: "Ce créneau n'a plus assez de places disponibles en terrasse." }, { status: 409 });
    }
  } else {
    const maxForZone = reservationZone === "terrace" ? terraceCapacity : maxCoversPerSlot;
    if (reservationZone === "terrace" && maxForZone <= 0) {
      return NextResponse.json(
        { error: "La terrasse n'est pas configurée pour recevoir des réservations." },
        { status: 409 },
      );
    }
    const { data: slotRows } = await supabase
      .from("reservations")
      .select("guests")
      .eq("restaurant_id", restaurant.id)
      .eq("reservation_date", reservationDate)
      .eq("reservation_time", reservationTime)
      .eq("zone", reservationZone)
      .in("status", ["pending", "confirmed"]);

    const existingPeopleInSlot = (slotRows ?? []).reduce((total, row) => total + (row.guests ?? 0), 0);
    if (existingPeopleInSlot + guests > maxForZone) {
      return NextResponse.json(
        { error: "Ce créneau n'a plus assez de places disponibles." },
        { status: 409 },
      );
    }
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
    })
    .select(
      "id, reservation_date, reservation_time, guest_name, guest_phone, guest_email, guests, status, internal_note, created_at, table_id, zone",
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
