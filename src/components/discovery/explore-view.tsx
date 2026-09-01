"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { DiscoveryFiltersSheet } from "@/src/components/discovery/explore-filters";
import { DiscoveryEmpty } from "@/src/components/discovery/empty-state";
import { NichePills } from "@/src/components/discovery/niche-pills";
import { PeopleFeed } from "@/src/components/discovery/profile-discovery-card";
import { PeopleSwipeDeck } from "@/src/components/discovery/people-swipe-deck";
import { DiscoverySearchBar } from "@/src/components/discovery/search-bar";
import { DiscoveryFeedSkeleton } from "@/src/components/discovery/sz-ui";
import { DISCOVERY_PAGE_SIZE } from "@/src/lib/discovery/constants";
import { droppedFilterHints } from "@/src/lib/discovery/apply-filters";
import { categoryDiscoveryHref, exploreHref, feedQueryString } from "@/src/lib/discovery/filters";
import { readExploreScroll, rememberExploreCount, restoreExploreScroll } from "@/src/lib/discovery/track";
import { consumeOnboardingJustFinished } from "@/src/lib/discovery/onboarding";
import type { Category, ExploreFilters, ProfileCardModel } from "@/src/lib/discovery/types";

export function ExploreView({
  categories,
  favoriteSlugs,
  filters,
  initialProfiles,
  related,
  hasMore: initialHasMore,
  nextOffset: initialNextOffset,
  extraLocations = [],
  isLoggedIn = true,
  source = "explore",
}: {
  categories: Category[];
  favoriteSlugs: string[];
  filters: ExploreFilters;
  initialProfiles: ProfileCardModel[];
  related: ProfileCardModel[];
  hasMore: boolean;
  nextOffset: number;
  extraLocations?: string[];
  isLoggedIn?: boolean;
  source?: string;
}) {
  const [profiles, setProfiles] = useState(initialProfiles);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [filterPending, setFilterPending] = useState(false);
  const [feedReady, setFeedReady] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);
  const seen = useRef(new Set(initialProfiles.map((profile) => profile.id)));
  const paging = useRef({ offset: initialNextOffset, hasMore: initialHasMore, loading: false });

  useEffect(() => {
    if (source !== "explore") return;
    if (!consumeOnboardingJustFinished()) return;
    setFeedReady(true);
    const timer = window.setTimeout(() => setFeedReady(false), 2800);
    return () => window.clearTimeout(timer);
  }, [source]);

  useEffect(() => {
    setProfiles(initialProfiles);
    setHasMore(initialHasMore);
    seen.current = new Set(initialProfiles.map((profile) => profile.id));
    paging.current = { offset: initialNextOffset, hasMore: initialHasMore, loading: false };
    setFilterPending(false);
  }, [initialProfiles, initialHasMore, initialNextOffset]);

  useEffect(() => {
    if (!filterPending) return;
    const timer = window.setTimeout(() => setFilterPending(false), 5000);
    return () => window.clearTimeout(timer);
  }, [filterPending]);

  useEffect(() => {
    const href = `${window.location.pathname}${window.location.search}`;
    rememberExploreCount(href, profiles.length);
  }, [profiles.length]);

  useEffect(() => {
    const href = `${window.location.pathname}${window.location.search}`;
    const saved = readExploreScroll();
    if (!saved || saved.href !== href || saved.count <= initialProfiles.length) {
      restoreExploreScroll(href);
      return;
    }
    let cancelled = false;
    paging.current.loading = true;
    void (async () => {
      const response = await fetch(
        `/api/discovery/feed?${feedQueryString(filters, initialProfiles.length, saved.count - initialProfiles.length)}`,
      );
      const payload = (await response.json()) as {
        profiles?: ProfileCardModel[];
        hasMore?: boolean;
        nextOffset?: number;
      };
      if (cancelled) return;
      const incoming = (payload.profiles ?? []).filter((profile) => !seen.current.has(profile.id));
      for (const profile of incoming) seen.current.add(profile.id);
      setProfiles((current) => [...current, ...incoming]);
      paging.current = {
        offset: payload.nextOffset ?? paging.current.offset,
        hasMore: Boolean(payload.hasMore),
        loading: false,
      };
      setHasMore(paging.current.hasMore);
      restoreExploreScroll(href);
    })();
    return () => {
      cancelled = true;
    };
  }, [filters.niche, filters.location, filters.audience, filters.age, filters.profileType, filters.platform, filters.activity]);

  useEffect(() => {
    const node = sentinel.current;
    if (!node) return;
    const root = document.getElementById("discovery-scroll");
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        void loadMore();
      },
      { root: root ?? null, rootMargin: "560px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [filters]);

  async function loadMore() {
    if (paging.current.loading || !paging.current.hasMore) return;
    paging.current.loading = true;
    setLoading(true);
    const response = await fetch(
      `/api/discovery/feed?${feedQueryString(filters, paging.current.offset, DISCOVERY_PAGE_SIZE)}`,
    );
    const payload = (await response.json()) as {
      profiles?: ProfileCardModel[];
      hasMore?: boolean;
      nextOffset?: number;
    };
    const incoming = (payload.profiles ?? []).filter((profile) => !seen.current.has(profile.id));
    for (const profile of incoming) seen.current.add(profile.id);
    setProfiles((current) => [...current, ...incoming]);
    paging.current = {
      offset: payload.nextOffset ?? paging.current.offset,
      hasMore: Boolean(payload.hasMore),
      loading: false,
    };
    setHasMore(paging.current.hasMore);
    setLoading(false);
  }

  const hrefFor = (next: ExploreFilters) =>
    source === "category" && next.niche
      ? categoryDiscoveryHref(next.niche, next)
      : exploreHref(next);
  const empty = !profiles.length;
  const hints = droppedFilterHints(filters);
  const nearby = categories.filter((cat) => cat.slug !== filters.niche).slice(0, 4);
  const filterKey = [
    filters.niche,
    filters.location,
    filters.audience,
    filters.age,
    filters.profileType,
    filters.platform,
    filters.activity,
  ].join("|");

  return (
    <div className="pb-8 max-md:pb-12">
      <header className="mx-auto w-full max-w-[720px] px-5 md:mx-0 md:max-w-none md:px-0">
        <h1 className="sz-display">Discover people worth knowing.</h1>
        {feedReady ? <p className="sz-copied mt-3 text-sm text-white/50">Your feed is ready.</p> : null}
        <p className="sz-sub">Find builders, creators and operators in the niches you care about.</p>
        <div className="mt-5">
          <DiscoverySearchBar />
        </div>
        <div className="mt-5">
          <NichePills
            categories={categories}
            activeSlug={filters.niche}
            favoriteSlugs={favoriteSlugs}
            hrefFor={(slug) => hrefFor({ ...filters, niche: slug })}
            onNavigate={() => setFilterPending(true)}
          />
          <div className="mt-3">
            <DiscoveryFiltersSheet
              filters={filters}
              extraLocations={extraLocations}
              hrefFor={hrefFor}
              onNavigate={() => setFilterPending(true)}
            />
          </div>
        </div>
      </header>

      <div className="mt-7 px-5 md:px-0">
        {filterPending ? (
          <>
            <div className="md:hidden">
              <DiscoveryFeedSkeleton swipe />
            </div>
            <div className="hidden md:block">
              <DiscoveryFeedSkeleton />
            </div>
          </>
        ) : empty ? (
          <div className="sz-crossfade">
            <DiscoveryEmpty
              title="No exact matches yet."
              description="Sharpz is still small in this slice. Try a nearby world, or drop one filter."
            />
            {hints.length ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {hints.map((hint) => (
                  <Link
                    key={hint.key}
                    href={hrefFor({ ...filters, [hint.key]: null })}
                    onClick={() => setFilterPending(true)}
                    className="sz-pill"
                  >
                    Remove {hint.label}
                  </Link>
                ))}
              </div>
            ) : null}
            {nearby.length ? (
              <div className="mt-6">
                <p className="sz-label mb-3">Browse nearby niches</p>
                <div className="flex flex-wrap gap-2">
                  {nearby.map((cat) => (
                    <Link
                      key={cat.id}
                      href={hrefFor({ ...filters, niche: cat.slug })}
                      onClick={() => setFilterPending(true)}
                      className="sz-pill"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
            {related.length ? (
              <div className="mt-10">
                <p className="sz-label mb-5">People close to these filters</p>
                <PeopleFeed profiles={related} source={source} isLoggedIn={isLoggedIn} />
              </div>
            ) : null}
          </div>
        ) : (
          <div key={filterKey} className="sz-crossfade">
            <div className="md:hidden">
              <PeopleSwipeDeck
                profiles={profiles}
                source={source}
                isLoggedIn={isLoggedIn}
                onNearEnd={() => void loadMore()}
              />
            </div>
            <div className="hidden md:block">
              <PeopleFeed profiles={profiles} source={source} isLoggedIn={isLoggedIn} />
              <div ref={sentinel} className="h-10" />
            </div>
            {loading ? (
              <div className="mt-6">
                <div className="md:hidden">
                  <DiscoveryFeedSkeleton swipe count={2} />
                </div>
                <div className="hidden md:block">
                  <DiscoveryFeedSkeleton count={3} />
                </div>
              </div>
            ) : null}
            {!hasMore && profiles.length ? (
              <p className="sz-meta py-8 text-center">That’s everyone in this slice for now.</p>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
