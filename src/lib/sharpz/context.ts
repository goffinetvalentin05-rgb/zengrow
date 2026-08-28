import type { SupabaseClient } from "@supabase/supabase-js";
import { resolveAgentCapabilities } from "@/src/lib/sharpz/agent-capabilities";
import { getTrafficSummary } from "@/src/lib/sharpz/analytics";
import { selectDueFollowUps } from "@/src/lib/sharpz/follow-ups";
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
    traffic,
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
    getTrafficSummary(supabase, restaurantId),
  ]);

  const capabilities = resolveAgentCapabilities(integrations);

  const primaryObjective = objectives.find((item) => item.isPrimary) ?? null;
  const openActions = actions.filter((item) => item.status === "todo" || item.status === "in_progress");
  const followUpProspects = selectDueFollowUps(prospects);

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
    experiments: experiments.slice(0, 6).map((item) => ({
      id: item.id,
      title: item.title,
      hypothesis: item.hypothesis,
      status: item.status,
      metric: item.metric,
      beforeValue: item.beforeValue,
      afterValue: item.afterValue,
      deltaPercent: item.deltaPercent,
      result: item.result,
      conclusion: item.conclusion,
      plannedEndAt: item.plannedEndAt,
      startedAt: item.startedAt,
      completedAt: item.completedAt,
    })),
    traffic: traffic.hasData
      ? {
          visitorsToday: traffic.visitorsToday,
          visitors7d: traffic.visitors7d,
          sessions7d: traffic.sessions7d,
          pageviews7d: traffic.pageviews7d,
          topPages: traffic.topPages.slice(0, 5),
          topReferrers: traffic.topReferrers.slice(0, 5),
          topSources: traffic.topSources.slice(0, 5),
          lastEventAt: traffic.lastEventAt,
        }
      : null,
    capabilities: {
      ...capabilities,
      trafficAnalytics: capabilities.trafficAnalytics || traffic.hasData,
    },
    integrations: integrations.map((item) => ({
      provider: item.provider,
      status: item.status,
    })),
    growthNotifications: (
      await supabase
        .from("notifications")
        .select("id, type, title, message, severity, read, created_at, action_url")
        .eq("restaurant_id", restaurantId)
        .in("type", [
          "growth_follow_up_due",
          "growth_experiment_due",
          "growth_experiment_overdue",
          "growth_traffic_signal",
          "growth_revenue_signal",
          "growth_competitor_change",
        ])
        .order("created_at", { ascending: false })
        .limit(8)
    ).data?.map((row) => ({
      id: String(row.id),
      type: String(row.type),
      title: String(row.title ?? ""),
      message: String(row.message ?? ""),
      severity: typeof row.severity === "string" ? row.severity : null,
      read: Boolean(row.read),
      createdAt: String(row.created_at ?? ""),
      actionUrl: typeof row.action_url === "string" ? row.action_url : null,
    })) ?? [],
  };
}
