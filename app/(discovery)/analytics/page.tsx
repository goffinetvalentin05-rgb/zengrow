import { AnalyticsView } from "@/src/components/discovery/analytics-view";
import { requireOnboardedSession } from "@/src/lib/discovery/auth";
import { isSharpzProActive } from "@/src/lib/discovery/pro";
import { getProfileAnalytics } from "@/src/lib/discovery/queries";
import { createClient } from "@/src/lib/supabase/server";

export default async function AnalyticsPage() {
  const session = await requireOnboardedSession();
  const isPro = isSharpzProActive({
    plan: session.subscription.plan,
    status: session.subscription.status,
    isOwnerDev: session.isOwnerDev,
  });
  const supabase = await createClient();
  const analytics = isPro ? await getProfileAnalytics(supabase, session.profile.id) : null;

  return <AnalyticsView isPro={isPro} analytics={analytics} />;
}
