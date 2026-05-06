export const RESERVATION_MODES = ["simple", "floor_plan"] as const;

export type ReservationMode = (typeof RESERVATION_MODES)[number];

export function isReservationMode(value: unknown): value is ReservationMode {
  return typeof value === "string" && (RESERVATION_MODES as readonly string[]).includes(value);
}

export function normalizeReservationMode(value: unknown): ReservationMode {
  // Legacy -> new
  if (value === "physical_tables") return "floor_plan";
  if (value === "single_service") return "simple";
  if (value === "fixed_slots") return "simple";
  if (value === "floor_plan") return "floor_plan";
  if (value === "simple") return "simple";
  return "simple";
}

export function reservationModeFromLegacy(useTables: boolean | null | undefined): ReservationMode {
  return useTables ? "floor_plan" : "simple";
}

export function timeHhMmFromDb(value: string | null | undefined, fallback: string): string {
  if (!value || typeof value !== "string") return fallback;
  const t = value.trim();
  if (/^\d{2}:\d{2}$/.test(t)) return t;
  if (/^\d{2}:\d{2}:\d{2}/.test(t)) return t.slice(0, 5);
  return fallback;
}
