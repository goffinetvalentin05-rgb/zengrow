import { requireRestaurant } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";
import { AnalyticsView } from "@/src/components/sharpz/analytics/analytics-view";
import {
  getActions,
  getAuditFindings,
  getLatestAudit,
} from "@/src/lib/sharpz/queries";
import { parseAnalyticsTab } from "@/src/lib/sharpz/routes";

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string | string[] }>;
}) {
  const restaurant = await requireRestaurant();
  const supabase = await createClient();
  const tab = parseAnalyticsTab((await searchParams).tab);

  const [lastAudit, actions] = await Promise.all([
    getLatestAudit(supabase, restaurant.id),
    getActions(supabase, restaurant.id),
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

  return (
    <AnalyticsView
      tab={tab}
      lastAudit={lastAudit}
      findings={findings}
      recommendedActions={recommended}
    />
  );
}
