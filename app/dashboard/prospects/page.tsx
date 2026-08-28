import { requireRestaurant } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";
import { ProspectsCrmView } from "@/src/components/sharpz/prospects/prospects-crm-view";
import { getProspectEvents, getProspects } from "@/src/lib/sharpz/queries";
import type { ProspectEvent } from "@/src/lib/sharpz/types";

function groupEventsByProspect(events: ProspectEvent[]) {
  const map: Record<string, ProspectEvent[]> = {};
  for (const event of events) {
    if (!map[event.prospectId]) map[event.prospectId] = [];
    map[event.prospectId].push(event);
  }
  return map;
}

export default async function ProspectsPage() {
  const restaurant = await requireRestaurant();
  const supabase = await createClient();
  const [prospects, events] = await Promise.all([
    getProspects(supabase, restaurant.id),
    getProspectEvents(supabase, restaurant.id),
  ]);
  return <ProspectsCrmView prospects={prospects} eventsByProspect={groupEventsByProspect(events)} />;
}
