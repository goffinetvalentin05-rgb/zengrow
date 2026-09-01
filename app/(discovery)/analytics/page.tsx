import { AnalyticsView } from "@/src/components/discovery/analytics-view";
import { requireOnboardedSession } from "@/src/lib/discovery/auth";
import { emptyProfileAnalytics, parseAnalyticsRange } from "@/src/lib/discovery/analytics";
import { discoveryAnalyticsTier } from "@/src/lib/discovery/pro";
import { getProfileAnalytics } from "@/src/lib/discovery/queries";
import { createClient } from "@/src/lib/supabase/server";

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const session = await requireOnboardedSession();
  const { range: rawRange } = await searchParams;
  const range = parseAnalyticsRange(rawRange);
  const tier = discoveryAnalyticsTier({
    plan: session.subscription.plan,
    status: session.subscription.status,
    isOwnerDev: session.isOwnerDev,
  });
  const supabase = await createClient();
  const analytics = (await getProfileAnalytics(supabase, session.profile.id, range)) ?? emptyProfileAnalytics(range);

  return (
    <div className="px-5 md:px-0">
      <AnalyticsView analytics={analytics} range={range} tier={tier} />
    </div>
  );
}
