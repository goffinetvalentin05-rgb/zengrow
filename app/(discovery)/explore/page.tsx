import { ExploreView } from "@/src/components/discovery/explore-view";
import { requireOnboardedSession } from "@/src/lib/discovery/auth";
import { getCategories, getExplorePayload, getFavoriteCategorySlugs } from "@/src/lib/discovery/queries";
import { createClient } from "@/src/lib/supabase/server";

export const metadata = {
  title: "Explore",
};

export default async function ExplorePage() {
  const session = await requireOnboardedSession();
  const supabase = await createClient();
  const [categories, favoriteSlugs] = await Promise.all([
    getCategories(supabase),
    getFavoriteCategorySlugs(supabase, session.profile.id),
  ]);
  const payload = await getExplorePayload(supabase, {
    viewer: session.profile,
    favoriteSlugs,
    filters: {},
    viewerLocation: session.profile.country || session.profile.location,
  });

  return (
    <ExploreView
      firstName={session.profile.displayName.split(" ")[0] ?? ""}
      categories={categories}
      favoriteSlugs={favoriteSlugs}
      feed={payload.feed}
    />
  );
}
