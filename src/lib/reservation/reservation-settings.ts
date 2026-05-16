import {
  normalizeReservationMode,
  type ReservationMode,
} from "@/src/lib/reservation/reservation-modes";

export type ReservationSettingsSnapshot = {
  reservation_mode: string | null | undefined;
  service_lunch_enabled?: boolean | null;
  service_dinner_enabled?: boolean | null;
  service_lunch_max_covers?: number | null;
  service_dinner_max_covers?: number | null;
  lunch_duration_minutes?: number | null;
  dinner_duration_minutes?: number | null;
  time_slots_lunch_max_groups?: number | null;
  time_slots_dinner_max_groups?: number | null;
  time_slots_max_party_size?: number | null;
};

export function clampCoversCapacity(value: number): number {
  return Math.max(1, Math.min(500, Math.trunc(value)));
}

export function clampMealDurationMinutes(value: number): number {
  return Math.max(30, Math.min(240, Math.trunc(value)));
}

export function clampPartySize(value: number): number {
  return Math.max(2, Math.min(30, Math.trunc(value)));
}

export function clampTimeSlotsGroups(value: number): number {
  return Math.max(1, Math.min(100, Math.trunc(value)));
}

export function effectiveMaxPartySizeForPublic(settings: {
  reservation_mode?: string | null;
  max_party_size?: number | null;
  time_slots_max_party_size?: number | null;
}): number {
  const mode = normalizeReservationMode(settings.reservation_mode);
  if (mode === "time_slots") {
    return clampPartySize(settings.time_slots_max_party_size ?? settings.max_party_size ?? 8);
  }
  return clampPartySize(settings.max_party_size ?? 8);
}

export function clampSlotInterval(value: number): number {
  const allowed = [15, 30, 60] as const;
  if (allowed.includes(value as (typeof allowed)[number])) {
    return value;
  }
  return 30;
}

export function isReservationCapacityConfigured(
  settings: ReservationSettingsSnapshot,
): boolean {
  const mode = normalizeReservationMode(settings.reservation_mode);
  const lunchOn = settings.service_lunch_enabled !== false;
  const dinnerOn = settings.service_dinner_enabled !== false;

  if (!lunchOn && !dinnerOn) {
    return false;
  }

  if (mode === "time_slots") {
    const lunchOk =
      !lunchOn ||
      (settings.time_slots_lunch_max_groups != null && settings.time_slots_lunch_max_groups > 0);
    const dinnerOk =
      !dinnerOn ||
      (settings.time_slots_dinner_max_groups != null && settings.time_slots_dinner_max_groups > 0);
    return lunchOk && dinnerOk;
  }

  const lunchOk =
    !lunchOn || (settings.service_lunch_max_covers != null && settings.service_lunch_max_covers > 0);
  const dinnerOk =
    !dinnerOn ||
    (settings.service_dinner_max_covers != null && settings.service_dinner_max_covers > 0);
  return lunchOk && dinnerOk;
}

export type ReservationSettingsValidationResult =
  | { ok: true }
  | { ok: false; message: string };

export function validateReservationSettingsInput(input: {
  mode: ReservationMode;
  lunchServiceEnabled: boolean;
  dinnerServiceEnabled: boolean;
  lunchMaxCovers: number;
  dinnerMaxCovers: number;
  lunchDurationMinutes: number;
  dinnerDurationMinutes: number;
  maxPartySize: number;
  timeSlotsLunchMaxGroups: number;
  timeSlotsDinnerMaxGroups: number;
  timeSlotsMaxPartySize: number;
}): ReservationSettingsValidationResult {
  if (!input.lunchServiceEnabled && !input.dinnerServiceEnabled) {
    return { ok: false, message: "Activez au moins le service midi ou le service soir." };
  }

  if (input.mode === "global_covers") {
    if (input.lunchServiceEnabled && input.lunchMaxCovers <= 0) {
      return { ok: false, message: "La capacité midi doit être supérieure à 0." };
    }
    if (input.dinnerServiceEnabled && input.dinnerMaxCovers <= 0) {
      return { ok: false, message: "La capacité soir doit être supérieure à 0." };
    }
    if (input.lunchDurationMinutes < 30 || input.lunchDurationMinutes > 240) {
      return { ok: false, message: "La durée midi doit être entre 30 et 240 minutes." };
    }
    if (input.dinnerDurationMinutes < 30 || input.dinnerDurationMinutes > 240) {
      return { ok: false, message: "La durée soir doit être entre 30 et 240 minutes." };
    }
    if (input.maxPartySize < 2 || input.maxPartySize > 30) {
      return { ok: false, message: "La taille max. du groupe doit être entre 2 et 30." };
    }
    return { ok: true };
  }

  if (input.lunchServiceEnabled && input.timeSlotsLunchMaxGroups <= 0) {
    return { ok: false, message: "Le nombre max. de groupes midi doit être supérieur à 0." };
  }
  if (input.dinnerServiceEnabled && input.timeSlotsDinnerMaxGroups <= 0) {
    return { ok: false, message: "Le nombre max. de groupes soir doit être supérieur à 0." };
  }
  if (input.timeSlotsMaxPartySize < 2 || input.timeSlotsMaxPartySize > 30) {
    return { ok: false, message: "La taille max. du groupe doit être entre 2 et 30." };
  }

  return { ok: true };
}
