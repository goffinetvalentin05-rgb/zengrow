export const RESERVATION_MODES = ["single_service", "fixed_slots", "physical_tables"] as const;

export type ReservationMode = (typeof RESERVATION_MODES)[number];

export function isReservationMode(value: unknown): value is ReservationMode {
  return typeof value === "string" && (RESERVATION_MODES as readonly string[]).includes(value);
}

export function normalizeReservationMode(value: unknown): ReservationMode {
  if (isReservationMode(value)) return value;
  return "fixed_slots";
}

export function reservationModeFromLegacy(useTables: boolean | null | undefined): ReservationMode {
  return useTables ? "physical_tables" : "fixed_slots";
}

export function timeHhMmFromDb(value: string | null | undefined, fallback: string): string {
  if (!value || typeof value !== "string") return fallback;
  const t = value.trim();
  if (/^\d{2}:\d{2}$/.test(t)) return t;
  if (/^\d{2}:\d{2}:\d{2}/.test(t)) return t.slice(0, 5);
  return fallback;
}
