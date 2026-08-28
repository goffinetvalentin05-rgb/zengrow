import type { SupabaseClient } from "@supabase/supabase-js";

export type ProspectEventType = "created" | "status_change" | "note" | "contact";

export async function logProspectEvent(
  supabase: SupabaseClient,
  input: {
    restaurantId: string;
    prospectId: string;
    eventType: ProspectEventType;
    detail?: string | null;
    meta?: Record<string, unknown>;
  },
) {
  const { data } = await supabase
    .from("prospect_events")
    .insert({
      restaurant_id: input.restaurantId,
      prospect_id: input.prospectId,
      event_type: input.eventType,
      detail: input.detail?.trim() || null,
      meta: input.meta ?? {},
    })
    .select("id, prospect_id, event_type, detail, meta, created_at")
    .maybeSingle();

  return data
    ? {
        id: String(data.id),
        prospectId: String(data.prospect_id),
        eventType: data.event_type as ProspectEventType,
        detail: (data.detail as string | null) ?? null,
        meta:
          data.meta && typeof data.meta === "object" && !Array.isArray(data.meta)
            ? (data.meta as Record<string, unknown>)
            : null,
        createdAt: String(data.created_at ?? ""),
      }
    : null;
}
