export const RESERVATION_MODES = ["single_service", "fixed_slots", "floor_plan", "physical_tables"] as const;

export type ReservationMode = (typeof RESERVATION_MODES)[number];

export function isReservationMode(value: unknown): value is ReservationMode {
  return typeof value === "string" && (RESERVATION_MODES as readonly string[]).includes(value);
}

export function normalizeReservationMode(value: unknown): ReservationMode {
  if (value === "physical_tables") return "floor_plan";
  if (isReservationMode(value)) return value;
  return "fixed_slots";
}

export function reservationModeFromLegacy(useTables: boolean | null | undefined): ReservationMode {
  return useTables ? "floor_plan" : "fixed_slots";
}

export function timeHhMmFromDb(value: string | null | undefined, fallback: string): string {
  if (!value || typeof value !== "string") return fallback;
  const t = value.trim();
  if (/^\d{2}:\d{2}$/.test(t)) return t;
  if (/^\d{2}:\d{2}:\d{2}/.test(t)) return t.slice(0, 5);
  return fallback;
}
