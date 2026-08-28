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
  await supabase.from("prospect_events").insert({
    restaurant_id: input.restaurantId,
    prospect_id: input.prospectId,
    event_type: input.eventType,
    detail: input.detail?.trim() || null,
    meta: input.meta ?? {},
  });
}
