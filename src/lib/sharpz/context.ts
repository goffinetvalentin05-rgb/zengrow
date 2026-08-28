import type { SupabaseClient } from "@supabase/supabase-js";
import { resolveAgentCapabilities } from "@/src/lib/sharpz/agent-capabilities";
import {
  getActions,
  getChannels,
  getCompetitors,
  getExperiments,
  getIntegrations,
  getLatestAudit,
  getObjectives,
  getProspects,
  getUserSaas,
} from "@/src/lib/sharpz/queries";

export async function loadSharpzContext(supabase: SupabaseClient, restaurantId: string) {
  const [
    saas,
    objectives,
    channels,
    actions,
    audit,
    prospects,
    experiments,
    competitors,
    integrations,
  ] = await Promise.all([
    getUserSaas(supabase, restaurantId),
    getObjectives(supabase, restaurantId),
    getChannels(supabase, restaurantId),
    getActions(supabase, restaurantId),
    getLatestAudit(supabase, restaurantId),
    getProspects(supabase, restaurantId),
    getExperiments(supabase, restaurantId),
    getCompetitors(supabase, restaurantId),
    getIntegrations(supabase, restaurantId),
  ]);

  const primaryObjective = objectives.find((item) => item.isPrimary) ?? null;
  const openActions = actions.filter((item) => item.status === "todo" || item.status === "in_progress");
  const followUpProspects = prospects.filter(
    (item) =>
      item.status === "to_contact" ||
      item.status === "contacted" ||
      item.status === "followed_up" ||
      (item.nextFollowUpAt && new Date(item.nextFollowUpAt) <= new Date()),
  );

  return {
    saas,
    objectives,
    primaryObjective,
    channels,
    actions: actions
      .filter((action) => action.sourceType !== "audit" || action.sourceId === audit?.id)
      .slice(0, 12),
    openActions: openActions.slice(0, 8).map((item) => ({
      id: item.id,
      title: item.title,
      status: item.status,
      score: item.score,
      category: item.category,
    })),
    opportunities: [],
    audit,
    content: [],
    prospects: prospects.slice(0, 12),
    followUpProspects: followUpProspects.slice(0, 8).map((item) => ({
      id: item.id,
      company: item.company,
      name: item.name,
      status: item.status,
      nextFollowUpAt: item.nextFollowUpAt,
    })),
    competitors: competitors.slice(0, 8),
    experiments: experiments.slice(0, 6),
    capabilities: resolveAgentCapabilities(integrations),
    integrations: integrations.map((item) => ({
      provider: item.provider,
      status: item.status,
    })),
  };
}
