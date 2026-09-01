import { ProfileRail } from "@/src/components/discovery/profile-rail";
import { NichePills } from "@/src/components/discovery/niche-pills";
import { DiscoverySearchBar } from "@/src/components/discovery/search-bar";
import { ExploreFiltersBar } from "@/src/components/discovery/explore-filters";
import { DiscoveryEmpty } from "@/src/components/discovery/empty-state";
import { ProfileCard } from "@/src/components/discovery/profile-card";
import { DISCOVERY_ROUTES } from "@/src/lib/discovery/routes";
import type { Category, ExploreFilters, ProfileCardModel } from "@/src/lib/discovery/types";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function ExploreView({
  firstName,
  categories,
  favoriteSlugs,
  filters,
  rising,
  newProfiles,
  worthDiscovering,
  popular,
  under5k,
  nearYou,
  recentlyJoined,
  all,
}: {
  firstName: string;
  categories: Category[];
  favoriteSlugs: string[];
  filters: ExploreFilters;
  rising: ProfileCardModel[];
  newProfiles: ProfileCardModel[];
  worthDiscovering: ProfileCardModel[];
  popular: ProfileCardModel[];
  under5k: ProfileCardModel[];
  nearYou: ProfileCardModel[];
  recentlyJoined: ProfileCardModel[];
  all: ProfileCardModel[];
}) {
  const nicheName = categories.find((cat) => cat.slug === filters.niche)?.name;
  const hasFilters = Boolean(
    filters.niche || filters.profileType || filters.audience || filters.platform || filters.activity || filters.location,
  );

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
      <header className="flex flex-col gap-5">
        <div>
          <p className="text-sm text-white/40">{greeting()}</p>
          <h1 className="mt-1 font-[family-name:var(--font-zg-display)] text-4xl tracking-tight text-white md:text-5xl">
            {firstName ? `${greeting()}, ${firstName}` : "Explore Sharpz"}
          </h1>
          <p className="mt-2 text-sm text-white/45">Discover people worth knowing in your world.</p>
        </div>
        <DiscoverySearchBar />
        <NichePills
          categories={categories}
          activeSlug={filters.niche}
          favoriteSlugs={favoriteSlugs}
          hrefFor={(slug) => {
            const params = new URLSearchParams();
            if (slug) params.set("niche", slug);
            if (filters.profileType) params.set("type", filters.profileType);
            if (filters.audience) params.set("audience", filters.audience);
            if (filters.platform) params.set("platform", filters.platform);
            if (filters.activity) params.set("activity", filters.activity);
            const qs = params.toString();
            return qs ? `${DISCOVERY_ROUTES.explore}?${qs}` : DISCOVERY_ROUTES.explore;
          }}
        />
        <ExploreFiltersBar filters={filters} />
      </header>

      {!all.length ? (
        <DiscoveryEmpty
          title="No people found."
          description="Try another niche or clear a filter. New profiles appear here as they join."
        />
      ) : hasFilters ? (
        <section>
          <h2 className="mb-4 font-[family-name:var(--font-zg-display)] text-2xl text-white">
            {nicheName ?? "Filtered"} people
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {all.slice(0, 30).map((profile) => (
              <ProfileCard key={profile.id} profile={profile} source="explore" />
            ))}
          </div>
        </section>
      ) : (
        <>
          <ProfileRail
            title={nicheName ? `Rising in ${nicheName}` : "Rising in your niches"}
            subtitle="Ranked from completeness, recency, follows and editorial picks — never invented stats."
            profiles={rising}
          />
          <ProfileRail title={nicheName ? `New in ${nicheName}` : "New profiles"} profiles={newProfiles} variant="compact" />
          <ProfileRail title="Worth discovering" subtitle="Editor’s picks" profiles={worthDiscovering} variant="featured" />
          <ProfileRail title="Popular this week" profiles={popular} />
          <ProfileRail title="Under 5k followers" subtitle="Self-reported audience, only when provided" profiles={under5k} />
          <ProfileRail title="Near you" profiles={nearYou} />
          <ProfileRail title="Recently joined" profiles={recentlyJoined} />
        </>
      )}
      <p className="text-xs text-white/25">
        <a href={DISCOVERY_ROUTES.categories} className="underline-offset-4 hover:underline">
          Browse all categories
        </a>
      </p>
    </div>
  );
}
