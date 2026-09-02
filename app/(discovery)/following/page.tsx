import { FollowingView } from "@/src/components/discovery/following-view";
import { requireOnboardedSession } from "@/src/lib/discovery/auth";
import { getFollowedProfiles, getIncomingConnectionRequests } from "@/src/lib/discovery/queries";
import { createClient } from "@/src/lib/supabase/server";

export default async function FollowingPage() {
  const session = await requireOnboardedSession();
  const supabase = await createClient();
  const [profiles, requests] = await Promise.all([
    getFollowedProfiles(supabase, session.profile.id),
    getIncomingConnectionRequests(supabase, session.profile.id),
  ]);

  return <FollowingView profiles={profiles} requests={requests} />;
}
