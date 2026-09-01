import { NextResponse } from "next/server";
import { getDiscoveryApiSession, isApiError } from "@/src/lib/discovery/api-session";
import { emptyProfileAnalytics, parseAnalyticsRange } from "@/src/lib/discovery/analytics";
import { getProfileAnalytics } from "@/src/lib/discovery/queries";
import { createClient } from "@/src/lib/supabase/server";

export async function GET(request: Request) {
  const session = await getDiscoveryApiSession();
  if (isApiError(session)) return session;
  const days = parseAnalyticsRange(new URL(request.url).searchParams.get("range"));
  const supabase = await createClient();
  const analytics =
    (await getProfileAnalytics(supabase, session.profile.id, days)) ?? emptyProfileAnalytics(days);
  return NextResponse.json({ analytics });
}
