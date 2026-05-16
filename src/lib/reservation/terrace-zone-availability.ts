import type { AvailabilitySlot } from "@/src/lib/reservation/schemas";

export type SlotsByZone = {
  interior: AvailabilitySlot[];
  terrace: AvailabilitySlot[];
};

export function findSlotAtTime(slots: AvailabilitySlot[], time: string): AvailabilitySlot | null {
  return slots.find((s) => s.time === time) ?? null;
}

/** Créneaux affichables : union des horaires disponibles (salle et/ou terrasse). */
export function mergeAvailabilitySlotTimes(interior: AvailabilitySlot[], terrace: AvailabilitySlot[]): AvailabilitySlot[] {
  const byTime = new Map<string, AvailabilitySlot>();
  for (const slot of interior) {
    byTime.set(slot.time, slot);
  }
  for (const slot of terrace) {
    if (!byTime.has(slot.time)) {
      byTime.set(slot.time, { time: slot.time, suggestedTableId: null, remainingCapacity: null });
    }
  }
  return [...byTime.values()].sort((a, b) => a.time.localeCompare(b.time));
}

export type ZoneSeatOptionState = {
  available: boolean;
  remainingCovers: number;
  disabledReason: "complete" | "not_enough" | null;
};

/**
 * État d’une option terrasse pour un créneau et un nombre de convives.
 * `terraceMinCoversSlot` : créneau terrasse dispo pour 1 couvert (distingue complet vs pas assez de places).
 */
export function resolveTerraceSeatOption(
  terraceSlot: AvailabilitySlot | null,
  terraceMinCoversSlot: AvailabilitySlot | null,
  partySize: number,
): ZoneSeatOptionState {
  if (terraceSlot) {
    const remainingAfterBooking = terraceSlot.remainingCapacity ?? 0;
    return {
      available: true,
      remainingCovers: remainingAfterBooking + partySize,
      disabledReason: null,
    };
  }

  if (terraceMinCoversSlot) {
    return {
      available: false,
      remainingCovers: 0,
      disabledReason: "not_enough",
    };
  }

  return {
    available: false,
    remainingCovers: 0,
    disabledReason: "complete",
  };
}

export function resolveInteriorSeatOption(interiorSlot: AvailabilitySlot | null): ZoneSeatOptionState {
  if (interiorSlot) {
    return { available: true, remainingCovers: 0, disabledReason: null };
  }
  return { available: false, remainingCovers: 0, disabledReason: "complete" };
}

export async function fetchAvailabilityForZone(
  restaurantId: string,
  date: string,
  covers: number,
  zone: "interior" | "terrace",
): Promise<AvailabilitySlot[]> {
  const q = new URLSearchParams({
    restaurantId,
    date,
    covers: String(covers),
    zone,
  });
  const response = await fetch(`/api/reservations/availability?${q.toString()}`);
  const payload = (await response.json().catch(() => ({}))) as {
    slots?: AvailabilitySlot[];
    error?: string;
  };
  if (!response.ok) {
    throw new Error(payload.error ?? "Impossible de charger les disponibilités.");
  }
  return payload.slots ?? [];
}

export async function fetchSlotsByZone(
  restaurantId: string,
  date: string,
  covers: number,
): Promise<SlotsByZone> {
  const [interior, terrace] = await Promise.all([
    fetchAvailabilityForZone(restaurantId, date, covers, "interior"),
    fetchAvailabilityForZone(restaurantId, date, covers, "terrace"),
  ]);
  return { interior, terrace };
}
