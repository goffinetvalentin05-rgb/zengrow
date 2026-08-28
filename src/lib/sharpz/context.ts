import type { SupabaseClient } from "@supabase/supabase-js";
import {
  getActions,
  getChannels,
  getContentOpportunities,
  getExperiments,
  getLatestAudit,
  getObjectives,
  getOpportunities,
  getProspects,
  getUserSaas,
} from "@/src/lib/sharpz/queries";

export async function loadSharpzContext(supabase: SupabaseClient, restaurantId: string) {
  const [saas, objectives, channels, actions, opportunities, audit, content, prospects, experiments] =
    await Promise.all([
      getUserSaas(supabase, restaurantId),
      getObjectives(supabase, restaurantId),
      getChannels(supabase, restaurantId),
      getActions(supabase, restaurantId),
      getOpportunities(supabase, restaurantId),
      getLatestAudit(supabase, restaurantId),
      getContentOpportunities(supabase, restaurantId),
      getProspects(supabase, restaurantId),
      getExperiments(supabase, restaurantId),
    ]);

  return {
    saas,
    objectives,
    channels,
    actions: actions.slice(0, 12),
    opportunities: opportunities.slice(0, 8),
    audit,
    content: content.slice(0, 6),
    prospects: prospects.slice(0, 12),
    experiments: experiments.slice(0, 6),
  };
}
