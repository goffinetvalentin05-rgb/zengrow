/** Bornes lundi–dimanche (UTC) de la semaine ISO contenant `ref`, au format YYYY-MM-DD. */
export function isoWeekUtcBounds(ref: Date): { start: string; end: string } {
  const t = Date.UTC(ref.getUTCFullYear(), ref.getUTCMonth(), ref.getUTCDate());
  const d = new Date(t);
  const dow = d.getUTCDay();
  const isoDow = dow === 0 ? 7 : dow;
  d.setUTCDate(d.getUTCDate() + 4 - isoDow);
  const thursday = d;
  const monday = new Date(thursday);
  monday.setUTCDate(thursday.getUTCDate() - 3);
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);
  return {
    start: monday.toISOString().slice(0, 10),
    end: sunday.toISOString().slice(0, 10),
  };
}
