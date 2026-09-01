import { DiscoveryEmpty } from "@/src/components/discovery/empty-state";
import { PeopleFeed } from "@/src/components/discovery/profile-discovery-card";
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
      <header className="mx-auto w-full max-w-[560px] px-5 md:px-0">
        <h1 className="font-[family-name:var(--font-zg-display)] text-[2.4rem] leading-none tracking-tight text-white">
          Saved
        </h1>
        <p className="mt-2 text-sm text-white/40">People you want to remember.</p>
      </header>
      <div className="mt-8">
        {profiles.length ? (
          <PeopleFeed profiles={profiles} source="saved" />
        ) : (
          <div className="px-5">
            <DiscoveryEmpty
              title="Nothing saved yet."
              description="Save someone interesting while you explore."
              href={DISCOVERY_ROUTES.explore}
              cta="Discover people"
            />
          </div>
        )}
      </div>
    </div>
  );
}
