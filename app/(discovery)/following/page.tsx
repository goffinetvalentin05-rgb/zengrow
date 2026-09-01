import { DiscoveryEmpty } from "@/src/components/discovery/empty-state";
import { ProfileCard } from "@/src/components/discovery/profile-card";
import { requireOnboardedSession } from "@/src/lib/discovery/auth";
import { getFollowedProfiles } from "@/src/lib/discovery/queries";
import { DISCOVERY_ROUTES } from "@/src/lib/discovery/routes";
import { createClient } from "@/src/lib/supabase/server";

export default async function FollowingPage() {
  const session = await requireOnboardedSession();
  const supabase = await createClient();
  const profiles = await getFollowedProfiles(supabase, session.profile.id);

  return (
    <div className="mx-auto w-full max-w-5xl">
      <h1 className="font-[family-name:var(--font-zg-display)] text-4xl text-white">Following</h1>
      <p className="mt-2 text-sm text-white/40">People you follow. No feed — just the people.</p>
      {profiles.length ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {profiles.map((profile) => (
            <ProfileCard key={profile.id} profile={profile} source="following" />
          ))}
        </div>
      ) : (
        <DiscoveryEmpty
          className="mt-10"
          title="You’re not following anyone yet."
          description="Explore your niches and find people worth following."
          href={DISCOVERY_ROUTES.explore}
          cta="Explore people"
        />
      )}
    </div>
  );
}
