import { DiscoveryEmpty } from "@/src/components/discovery/empty-state";
import { ProfileCard } from "@/src/components/discovery/profile-card";
import { requireOnboardedSession } from "@/src/lib/discovery/auth";
import { getSavedProfiles } from "@/src/lib/discovery/queries";
import { DISCOVERY_ROUTES } from "@/src/lib/discovery/routes";
import { createClient } from "@/src/lib/supabase/server";

export default async function SavedPage() {
  const session = await requireOnboardedSession();
  const supabase = await createClient();
  const profiles = await getSavedProfiles(supabase, session.profile.id);

  return (
    <div className="mx-auto w-full max-w-5xl">
      <h1 className="font-[family-name:var(--font-zg-display)] text-4xl text-white">Saved</h1>
      <p className="mt-2 text-sm text-white/40">Profiles you want to remember without following.</p>
      {profiles.length ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {profiles.map((profile) => (
            <ProfileCard key={profile.id} profile={profile} source="saved" />
          ))}
        </div>
      ) : (
        <DiscoveryEmpty
          className="mt-10"
          title="Nothing saved yet."
          description="Save someone interesting while you explore."
          href={DISCOVERY_ROUTES.explore}
          cta="Explore people"
        />
      )}
    </div>
  );
}
