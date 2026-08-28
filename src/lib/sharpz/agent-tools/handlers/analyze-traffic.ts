import type { AgentToolExecutionContext, AgentToolResult } from "@/src/lib/sharpz/agent-tools/types";
import type { AnalyzeTrafficInput } from "@/src/lib/sharpz/agent-tools/schemas";
import { getTrafficSummary } from "@/src/lib/sharpz/analytics";

export async function handleAnalyzeTraffic(
  ctx: AgentToolExecutionContext,
  input: AnalyzeTrafficInput,
): Promise<AgentToolResult> {
  const traffic = await getTrafficSummary(ctx.session.supabase, ctx.session.restaurant.id);

  if (!traffic.hasData) {
    const installed = traffic.installed || ctx.sharpzContext.capabilities.trafficAnalytics;
    return {
      tool: "analyze_traffic",
      status: "missing_integration",
      message: installed
        ? "Sharpz Analytics est installé mais aucun événement trafic n'a encore été collecté."
        : "Sharpz Analytics n'est pas connecté — aucune donnée de trafic réelle disponible.",
      meta: {
        installed,
        siteKey: traffic.siteKey,
        periodDays: input.periodDays,
      },
    };
  }

  return {
    tool: "analyze_traffic",
    status: "ok",
    message: "Données trafic réelles disponibles.",
    traffic: {
      periodDays: input.periodDays,
      visitorsToday: traffic.visitorsToday,
      visitors7d: traffic.visitors7d,
      visitors30d: traffic.visitors30d,
      sessions7d: traffic.sessions7d,
      pageviews7d: traffic.pageviews7d,
      topPages: traffic.topPages.slice(0, 5),
      topReferrers: traffic.topReferrers.slice(0, 5),
      topSources: traffic.topSources.slice(0, 5),
      devices: traffic.devices.slice(0, 3),
      countries: traffic.countries.slice(0, 5),
      lastEventAt: traffic.lastEventAt,
    },
  };
}
