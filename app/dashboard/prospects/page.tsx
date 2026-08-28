import { requireRestaurant } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";
import { ProspectsCrmView } from "@/src/components/sharpz/prospects/prospects-crm-view";
import { getObjectives, getProspectEvents, getProspects, getProspectScripts, getUserSaas } from "@/src/lib/sharpz/queries";
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
  const [prospects, events, scripts, saas, objectives] = await Promise.all([
    getProspects(supabase, restaurant.id),
    getProspectEvents(supabase, restaurant.id),
    getProspectScripts(supabase, restaurant.id),
    getUserSaas(supabase, restaurant.id),
    getObjectives(supabase, restaurant.id),
  ]);
  const primary = objectives.find((item) => item.isPrimary) ?? null;
  return (
    <ProspectsCrmView
      prospects={prospects}
      eventsByProspect={groupEventsByProspect(events)}
      scripts={scripts}
      saas={{
        name: saas?.name ?? null,
        url: saas?.url ?? null,
        description: saas?.description ?? null,
        pricingSummary: saas?.pricingSummary ?? null,
        objectiveKey: primary?.key ?? null,
        objectiveCustomLabel: primary?.customLabel ?? null,
      }}
    />
  );
}
