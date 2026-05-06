import {
  sendReservationConfirmationEmail,
  sendReservationReceivedEmail,
} from "@/lib/email";
import { devOwnerBypassesPublicBookingBlock } from "@/src/lib/access";
import { expireTrialIfNeeded, isRestaurantExpired } from "@/src/lib/subscription";
import { mapReservationRpcError } from "@/src/lib/reservation/map-reservation-error";
import { asRestaurantReservationEmailRow } from "@/src/lib/reservation/restaurant-reservation-email-row";
import type { SubscriptionStatus } from "@/src/lib/subscription";
import type { PublicReservationPostInput } from "@/src/lib/reservation/schemas";
import { parseAvailabilityPayload } from "@/src/lib/reservation/parse-availability";
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
  const chosenTableId = parsed.tableId ?? null;
  const chosenFloorPlanId = parsed.floorPlanId ?? null;

  const reservationDateTimeMs = toDateTimeMs(reservationDate, reservationTime);
  if (Number.isNaN(reservationDateTimeMs) || reservationDateTimeMs < Date.now()) {
    return { ok: false, status: 400, error: "Impossible de réserver dans le passé." };
  }

  const { data: restaurant, error: restaurantError } = await supabase
    .from("restaurants")
    .select(
      [
        "id",
        "owner_id",
        "name",
        "phone",
        "email",
        "logo_url",
        "primary_color",
        "reservation_confirmation_mode",
        "reservation_confirmation_email_subject",
        "reservation_confirmation_email_body",
        "subscription_status",
        "trial_end_date",
        "stripe_subscription_id",
      ].join(", "),
    )
    .eq("id", restaurantId)
    .single();

  if (restaurantError || !restaurant) {
    return { ok: false, status: 404, error: "Restaurant introuvable." };
  }

  const restaurantRow = asRestaurantReservationEmailRow(restaurant);
  const syncedRestaurant = await expireTrialIfNeeded(supabase, {
    id: restaurantRow.id,
    subscription_status: restaurantRow.subscription_status as SubscriptionStatus,
    trial_end_date: restaurantRow.trial_end_date,
    stripe_subscription_id: restaurantRow.stripe_subscription_id,
  });
  const subscriptionBlocksPublic =
    isRestaurantExpired(syncedRestaurant) &&
    !(await devOwnerBypassesPublicBookingBlock(restaurantRow.owner_id ?? null));
  if (subscriptionBlocksPublic) {
    return { ok: false, status: 402, error: "Les réservations sont suspendues pour ce restaurant." };
  }

  const { data: settings } = await supabase
    .from("restaurant_settings")
    .select(
      "reservation_mode, reservation_duration, max_party_size, closure_start_date, closure_end_date, closure_message, days_in_advance, terrace_enabled, allow_phone, allow_email",
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

  const maxPartySize = settings?.max_party_size ?? 8;
  const daysInAdvance = settings?.days_in_advance ?? 60;

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

  const { data: availRows, error: availError } = await supabase.rpc("get_available_slots", {
    p_restaurant_id: restaurantId,
    p_date: reservationDate,
    p_covers: guests,
    p_zone: reservationZone,
  });

  if (availError) {
    return {
      ok: false,
      status: 500,
      error: "Impossible de vérifier les créneaux disponibles. Réessayez dans un instant.",
    };
  }

  let availParsed: unknown = availRows;
  if (typeof availRows === "string") {
    try {
      availParsed = JSON.parse(availRows) as unknown;
    } catch {
      availParsed = [];
    }
  }

  const bookableTimes = parseAvailabilityPayload(availParsed).map((s) => s.time);
  if (!bookableTimes.includes(reservationTime)) {
    return {
      ok: false,
      status: 409,
      error: "Ce créneau n'est pas disponible pour cette date et ce nombre de personnes.",
    };
  }

  if (guests > maxPartySize) {
    return {
      ok: false,
      status: 409,
      error: `Le nombre maximum de personnes par réservation est de ${maxPartySize}.`,
    };
  }

  const confirmationMode =
    restaurantRow.reservation_confirmation_mode === "automatic" ? "automatic" : "manual";
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

  // Si le client a choisi une table (option premium), on remplace l’assignation automatique.
  // Si la table n’est plus dispo au moment du changement, on annule la réservation créée
  // afin d’éviter un état incohérent côté client.
  const effectiveMode = settings?.reservation_mode === "floor_plan" ? "floor_plan" : "simple";
  async function pickAvailableTableInFloorPlan(floorPlanId: string): Promise<{ id: string; floor_plan_id: string | null } | null> {
    const reservationDuration = settings?.reservation_duration ?? 90;
    const targetStartMs = toDateTimeMs(reservationDate, reservationTime);
    const targetEndMs = targetStartMs + reservationDuration * 60_000;

    const [{ data: tablesData, error: tablesError }, { data: reservationsData, error: reservationsError }] = await Promise.all([
      supabase
        .from("restaurant_tables")
        .select("id, floor_plan_id, min_covers, max_covers, status")
        .eq("restaurant_id", restaurantId)
        .eq("floor_plan_id", floorPlanId)
        .eq("status", "active")
        .lte("min_covers", guests)
        .gte("max_covers", guests),
      supabase
        .from("reservations")
        .select("table_id, reservation_time, status")
        .eq("restaurant_id", restaurantId)
        .eq("reservation_date", reservationDate)
        .in("status", ["pending", "confirmed"])
        .not("table_id", "is", null),
    ]);

    if (tablesError || !tablesData || reservationsError || !reservationsData) return null;

    const reserved = new Set<string>();
    for (const r of reservationsData) {
      if (!r.table_id || !r.reservation_time) continue;
      const startMs = toDateTimeMs(reservationDate, String(r.reservation_time).slice(0, 5));
      const endMs = startMs + reservationDuration * 60_000;
      if (startMs < targetEndMs && endMs > targetStartMs) reserved.add(r.table_id);
    }

    const candidates = tablesData.filter((t) => !reserved.has(t.id));
    candidates.sort((a, b) => (a.max_covers ?? 9999) - (b.max_covers ?? 9999) || (a.min_covers ?? 0) - (b.min_covers ?? 0));
    const best = candidates[0];
    if (!best) return null;
    return { id: best.id, floor_plan_id: (best.floor_plan_id as string | null) ?? null };
  }

  // Choix explicite de table (mode “table”) : on remplace l’assignation automatique
  if (effectiveMode === "floor_plan" && chosenTableId && typeof row.id === "string") {
    const { data: tableRow, error: tableError } = await supabase
      .from("restaurant_tables")
      .select("id, floor_plan_id")
      .eq("restaurant_id", restaurantId)
      .eq("id", chosenTableId)
      .maybeSingle();

    if (tableError || !tableRow) {
      await supabase.from("reservations").update({ status: "cancelled" }).eq("id", row.id).eq("restaurant_id", restaurantId);
      return {
        ok: false,
        status: 409,
        error: "Cette table n’est plus disponible. Veuillez choisir une autre table ou un autre créneau.",
      };
    }

    const { error: tableUpdateError } = await supabase
      .from("reservations")
      .update({ table_id: chosenTableId, floor_plan_id: tableRow.floor_plan_id ?? null })
      .eq("id", row.id)
      .eq("restaurant_id", restaurantId);

    if (tableUpdateError) {
      await supabase.from("reservations").update({ status: "cancelled" }).eq("id", row.id).eq("restaurant_id", restaurantId);
      return {
        ok: false,
        status: 409,
        error: "Cette table n’est plus disponible. Veuillez choisir une autre table ou un autre créneau.",
      };
    }
  }

  // Choix d’espace (mode “area”) : on assigne automatiquement une table dans le plan choisi
  if (effectiveMode === "floor_plan" && !chosenTableId && chosenFloorPlanId && typeof row.id === "string") {
    const picked = await pickAvailableTableInFloorPlan(chosenFloorPlanId);
    if (!picked) {
      await supabase.from("reservations").update({ status: "cancelled" }).eq("id", row.id).eq("restaurant_id", restaurantId);
      return { ok: false, status: 409, error: "Aucune table disponible dans cet espace pour ce créneau." };
    }

    const { error: updateError } = await supabase
      .from("reservations")
      .update({ table_id: picked.id, floor_plan_id: picked.floor_plan_id ?? chosenFloorPlanId })
      .eq("id", row.id)
      .eq("restaurant_id", restaurantId);

    if (updateError) {
      await supabase.from("reservations").update({ status: "cancelled" }).eq("id", row.id).eq("restaurant_id", restaurantId);
      return { ok: false, status: 409, error: "Aucune table disponible dans cet espace pour ce créneau." };
    }
  }

  if (finalStatus === "confirmed" && guestEmail) {
    try {
      await sendReservationConfirmationEmail({
        to: guestEmail,
        customSubject: restaurantRow.reservation_confirmation_email_subject,
        customBody: restaurantRow.reservation_confirmation_email_body,
        context: {
          restaurantName: restaurantRow.name,
          guestName: guestName || "Client",
          reservationDateIso: reservationDate,
          reservationTime,
          partySize: guests,
          zone: reservationZone,
          restaurantPhone: restaurantRow.phone,
          restaurantEmail: restaurantRow.email,
        },
        restaurantLogoUrl: restaurantRow.logo_url,
        primaryColor: restaurantRow.primary_color,
      });
    } catch (error) {
      console.error("Automatic confirmation email failed", error);
    }
  } else if (finalStatus === "pending" && guestEmail) {
    try {
      await sendReservationReceivedEmail({
        to: guestEmail,
        customerName: guestName || "Client",
        restaurantName: restaurantRow.name,
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
