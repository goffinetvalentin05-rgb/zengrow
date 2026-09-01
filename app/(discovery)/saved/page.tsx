import { DiscoveryEmpty } from "@/src/components/discovery/empty-state";
import { PeopleFeed } from "@/src/components/discovery/profile-discovery-card";
import { DiscoveryPageHeader } from "@/src/components/discovery/sz-ui";
import { requireOnboardedSession } from "@/src/lib/discovery/auth";
import { getSavedProfiles } from "@/src/lib/discovery/queries";
import { DISCOVERY_ROUTES } from "@/src/lib/discovery/routes";
import { createClient } from "@/src/lib/supabase/server";

export default async function SavedPage() {
  const session = await requireOnboardedSession();
  const supabase = await createClient();
  const profiles = await getSavedProfiles(supabase, session.profile.id);

  return (
    <div className="pb-8">
      <DiscoveryPageHeader title="Saved" subtitle="Profiles you want to keep close." />
      <div className="mt-8 px-5 md:px-0">
        {profiles.length ? (
          <PeopleFeed profiles={profiles} source="saved" />
        ) : (
          <DiscoveryEmpty
            title="You haven’t saved any profiles yet."
            description="Save someone interesting while you explore. Follow and connect stay separate."
            href={DISCOVERY_ROUTES.explore}
            cta="Discover profiles"
          />
        )}
      </div>
    </div>
  );
}
