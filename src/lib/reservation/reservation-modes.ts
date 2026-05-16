export const RESERVATION_MODES = ["global_covers", "time_slots"] as const;

export type ReservationMode = (typeof RESERVATION_MODES)[number];

export const RESERVATION_MODE_LABELS: Record<ReservationMode, string> = {
  global_covers: "Couverts globaux",
  time_slots: "Slots par tranche",
};

export function normalizeReservationMode(value: unknown): ReservationMode {
  if (value === "time_slots") return "time_slots";
  return "global_covers";
}

export function timeHhMmFromDb(value: string | null | undefined, fallback: string): string {
  if (!value || typeof value !== "string") return fallback;
  const t = value.trim();
  if (/^\d{2}:\d{2}$/.test(t)) return t;
  if (/^\d{2}:\d{2}:\d{2}/.test(t)) return t.slice(0, 5);
  return fallback;
}
