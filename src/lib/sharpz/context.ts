import type { SupabaseClient } from "@supabase/supabase-js";
import {
  getActions,
  getChannels,
  getExperiments,
  getLatestAudit,
  getObjectives,
  getProspects,
  getUserSaas,
} from "@/src/lib/sharpz/queries";

export async function loadSharpzContext(supabase: SupabaseClient, restaurantId: string) {
  const [saas, objectives, channels, actions, audit, prospects, experiments] =
    await Promise.all([
      getUserSaas(supabase, restaurantId),
      getObjectives(supabase, restaurantId),
      getChannels(supabase, restaurantId),
      getActions(supabase, restaurantId),
      getLatestAudit(supabase, restaurantId),
      getProspects(supabase, restaurantId),
      getExperiments(supabase, restaurantId),
    ]);

  return {
    saas,
    objectives,
    channels,
    actions: actions
      .filter((action) => action.sourceType !== "audit" || action.sourceId === audit?.id)
      .slice(0, 12),
    // Les anciennes opportunités et contenus ne stockent pas encore une provenance
    // vérifiable. Ils ne sont donc pas envoyés à l'agent.
    opportunities: [],
    audit,
    content: [],
    prospects: prospects.slice(0, 12),
    experiments: experiments.slice(0, 6),
  };
}
