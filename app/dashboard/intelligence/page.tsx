import { requireRestaurant } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";
import { IntelligenceView } from "@/src/components/sharpz/intelligence/intelligence-view";
import {
  getActions,
  getAuditFindings,
  getLatestAudit,
} from "@/src/lib/sharpz/queries";

type Tab = "analyse" | "traffic";

function asTab(value: string | string[] | undefined): Tab {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === "traffic" || raw === "analyse") return raw;
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
    <IntelligenceView
      tab={tab}
      lastAudit={lastAudit}
      findings={findings}
      recommendedActions={recommended}
    />
  );
}
