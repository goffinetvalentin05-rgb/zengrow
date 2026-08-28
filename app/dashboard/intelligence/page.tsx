import { requireRestaurant } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";
import { IntelligenceView } from "@/src/components/sharpz/intelligence/intelligence-view";
import {
  getActions,
  getAuditFindings,
  getCompetitorChanges,
  getCompetitors,
  getContentIdeas,
  getContentOpportunities,
  getLatestAudit,
  getOpportunities,
} from "@/src/lib/sharpz/queries";

type Tab = "analyse" | "market" | "content";

function asTab(value: string | string[] | undefined): Tab {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === "market" || raw === "content" || raw === "analyse") return raw;
  return "analyse";
}

export default async function IntelligencePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string | string[] }>;
}) {
  const restaurant = await requireRestaurant();
  const supabase = await createClient();
  const tab = asTab((await searchParams).tab);

  const [lastAudit, competitors, changes, opportunities, contentOpportunities, ideas, actions] = await Promise.all([
    getLatestAudit(supabase, restaurant.id),
    getCompetitors(supabase, restaurant.id),
    getCompetitorChanges(supabase, restaurant.id),
    getOpportunities(supabase, restaurant.id),
    getContentOpportunities(supabase, restaurant.id),
    getContentIdeas(supabase, restaurant.id),
    getActions(supabase, restaurant.id),
  ]);
  const findings = await getAuditFindings(supabase, restaurant.id, lastAudit?.id);
  const recommended = actions.filter((item) => item.sourceType === "audit" && item.status === "todo").slice(0, 6);

  return (
    <IntelligenceView
      tab={tab}
      lastAudit={lastAudit}
      findings={findings}
      recommendedActions={recommended}
      competitors={competitors}
      changes={changes}
      opportunities={opportunities}
      contentOpportunities={contentOpportunities}
      ideas={ideas}
    />
  );
}
