/** @deprecated Conservé pour lectures legacy en base ; tout est en mode simple. */
export type ReservationMode = "simple";

export function normalizeReservationMode(_value: unknown): ReservationMode {
  return "simple";
}

export function timeHhMmFromDb(value: string | null | undefined, fallback: string): string {
  if (!value || typeof value !== "string") return fallback;
  const t = value.trim();
  if (/^\d{2}:\d{2}$/.test(t)) return t;
  if (/^\d{2}:\d{2}:\d{2}/.test(t)) return t.slice(0, 5);
  return fallback;
}
