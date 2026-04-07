import type { AvailabilitySlot } from "@/src/lib/reservation/schemas";

export function parseAvailabilityPayload(data: unknown): AvailabilitySlot[] {
  if (!Array.isArray(data)) {
    return [];
  }
  const out: AvailabilitySlot[] = [];
  for (const row of data) {
    if (!row || typeof row !== "object") continue;
    const o = row as Record<string, unknown>;
    const time = typeof o.time === "string" ? o.time : null;
    if (!time) continue;
    out.push({
      time,
      suggestedTableId: typeof o.suggestedTableId === "string" ? o.suggestedTableId : null,
      remainingCapacity:
        typeof o.remainingCapacity === "number" && !Number.isNaN(o.remainingCapacity)
          ? o.remainingCapacity
          : null,
    });
  }
  return out;
}
