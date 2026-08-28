import { headers } from "next/headers";
import { requireRestaurant } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";
import { AnalyticsView } from "@/src/components/sharpz/analytics/analytics-view";
import { getTrafficSummary, sharpzAnalyticsSnippet } from "@/src/lib/sharpz/analytics";
import {
  getActions,
  getAuditFindings,
  getCompetitors,
  getCompetitorChanges,
  getContentIdeas,
  getContentOpportunities,
  getIntegrations,
  getLatestAudit,
} from "@/src/lib/sharpz/queries";
import { parseAnalyticsTab } from "@/src/lib/sharpz/routes";

function resolveAppOrigin(host: string | null) {
  const env = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (env) return env;
  if (host) return `https://${host}`;
  return "http://localhost:3000";
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string | string[] }>;
}) {
  const restaurant = await requireRestaurant();
  const supabase = await createClient();
  const tab = parseAnalyticsTab((await searchParams).tab);
  const host = (await headers()).get("host");
  const origin = resolveAppOrigin(host);

  const [
    lastAudit,
    actions,
    traffic,
    integrations,
    competitors,
    changes,
    contentOpportunities,
    contentIdeas,
  ] = await Promise.all([
    getLatestAudit(supabase, restaurant.id),
    getActions(supabase, restaurant.id),
    getTrafficSummary(supabase, restaurant.id),
    getIntegrations(supabase, restaurant.id),
    getCompetitors(supabase, restaurant.id),
    getCompetitorChanges(supabase, restaurant.id),
    getContentOpportunities(supabase, restaurant.id),
    getContentIdeas(supabase, restaurant.id),
  ]);

  const findings = lastAudit
    ? await getAuditFindings(supabase, restaurant.id, lastAudit.id)
    : [];
  const recommended = actions
    .filter(
      (item) =>
        item.sourceType === "audit" &&
        item.sourceId === lastAudit?.id &&
        item.status === "todo",
    )
    .slice(0, 6);

  const stripeConnected = integrations.some(
    (item) => item.provider === "stripe" && item.status === "connected",
  );
  const snippet = traffic.siteKey ? sharpzAnalyticsSnippet(origin, traffic.siteKey) : "";

  return (
    <AnalyticsView
      tab={tab}
      lastAudit={lastAudit}
      findings={findings}
      recommendedActions={recommended}
      traffic={traffic}
      snippet={snippet}
      stripeConnected={stripeConnected}
      competitors={competitors}
      changes={changes}
      contentOpportunities={contentOpportunities}
      contentIdeas={contentIdeas}
    />
  );
}
