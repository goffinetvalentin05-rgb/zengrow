import { ConnectionRequests } from "@/src/components/discovery/connection-requests";
import { DiscoveryEmpty } from "@/src/components/discovery/empty-state";
import { PeopleFeed } from "@/src/components/discovery/profile-discovery-card";
import { DiscoveryPageHeader } from "@/src/components/discovery/sz-ui";
import { requireOnboardedSession } from "@/src/lib/discovery/auth";
import { getFollowedProfiles, getIncomingConnectionRequests } from "@/src/lib/discovery/queries";
import { DISCOVERY_ROUTES } from "@/src/lib/discovery/routes";
import { createClient } from "@/src/lib/supabase/server";

export default async function FollowingPage() {
  const session = await requireOnboardedSession();
  const supabase = await createClient();
  const [profiles, requests] = await Promise.all([
    getFollowedProfiles(supabase, session.profile.id),
    getIncomingConnectionRequests(supabase, session.profile.id),
  ]);

  return (
    <div className="pb-8">
      <DiscoveryPageHeader title="Following" subtitle="People you follow." />
      <div className="mt-8 px-5 md:px-0">
        <ConnectionRequests requests={requests} />
        {profiles.length ? (
          <PeopleFeed profiles={profiles} source="following" />
        ) : (
          <DiscoveryEmpty
            title="You’re not following anyone yet."
            description="Discover people in your world, then follow the ones worth keeping."
            href={DISCOVERY_ROUTES.explore}
            cta="Discover people"
          />
        )}
      </div>
    </div>
  );
}
