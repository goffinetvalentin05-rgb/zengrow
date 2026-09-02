"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { DiscoveryFiltersSheet } from "@/src/components/discovery/explore-filters";
import { DiscoveryEmpty } from "@/src/components/discovery/empty-state";
import { NichePills } from "@/src/components/discovery/niche-pills";
import { PeopleFeed } from "@/src/components/discovery/profile-discovery-card";
import { PeopleProfileFeed } from "@/src/components/discovery/people-profile-feed";
import { ExploreGlobe } from "@/src/components/discovery/explore-globe";
import { DiscoverySearchBar } from "@/src/components/discovery/search-bar";
import { DiscoveryFeedSkeleton } from "@/src/components/discovery/sz-ui";
import { DISCOVERY_PAGE_SIZE } from "@/src/lib/discovery/constants";
import { droppedFilterHints } from "@/src/lib/discovery/apply-filters";
import { categoryDiscoveryHref, exploreHref, feedQueryString } from "@/src/lib/discovery/filters";
import { collectWorldPoints } from "@/src/lib/discovery/geo";
import { readExploreScroll, rememberExploreCount, restoreExploreScroll } from "@/src/lib/discovery/track";
import { consumeOnboardingJustFinished } from "@/src/lib/discovery/onboarding";
import type { Category, ExploreFilters, ProfileCardModel } from "@/src/lib/discovery/types";
import { useI18n } from "@/src/i18n/provider";
import { interpolate } from "@/src/locales/app";

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
  const { t } = useI18n();
  const router = useRouter();
  const [profiles, setProfiles] = useState(initialProfiles);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [filterPending, setFilterPending] = useState(false);
  const [feedReady, setFeedReady] = useState(false);
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

  const empty = !profiles.length;
  const feedMode = !empty || filterPending;

  useEffect(() => {
    if (!feedMode) return;
    const root = document.getElementById("discovery-scroll");
    if (!root) return;
    root.classList.add("sz-feed-root");
    return () => root.classList.remove("sz-feed-root");
  }, [feedMode]);

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
  const worldPoints = useMemo(
    () => collectWorldPoints(profiles.concat(related), extraLocations),
    [profiles, related, extraLocations],
  );

  function goToFilters(next: ExploreFilters) {
    setFilterPending(true);
    router.push(hrefFor(next), { scroll: false });
  }

  const nichePills = (
    <NichePills
      categories={categories}
      activeSlug={filters.niche}
      favoriteSlugs={favoriteSlugs}
      hrefFor={(slug) => hrefFor({ ...filters, niche: slug })}
      forYouLabel={t.explore.forYou}
      onNavigate={() => setFilterPending(true)}
    />
  );

  const desktopHeader = (
    <header className="mx-auto hidden w-full max-w-[720px] px-5 md:mx-0 md:block md:max-w-none md:px-0">
      <h1 className="sz-display">{t.explore.title}</h1>
      {feedReady ? <p className="sz-copied mt-3 text-sm text-white/50">{t.explore.feedReady}</p> : null}
      <p className="sz-sub">{t.explore.subtitle}</p>
      <div className="mt-5">
        <DiscoverySearchBar />
      </div>
      <div className="mt-5 flex items-center gap-3">
        <ExploreGlobe
          points={worldPoints}
          activeLocation={filters.location}
          onSelect={(location) => goToFilters({ ...filters, location })}
          size={64}
        />
        <div className="min-w-0 flex-1">
          {nichePills}
          {filters.location ? (
            <Link
              href={hrefFor({ ...filters, location: null })}
              scroll={false}
              onClick={() => setFilterPending(true)}
              className="sz-pill is-on mt-2"
            >
              {filters.location} ×
            </Link>
          ) : null}
        </div>
        <DiscoveryFiltersSheet
          filters={filters}
          extraLocations={extraLocations}
          hrefFor={hrefFor}
          onNavigate={() => setFilterPending(true)}
        />
      </div>
    </header>
  );

  const mobileOverlay = (
    <div className="pt-[max(0.45rem,env(safe-area-inset-top))]">
      <div className="flex items-center gap-2.5 bg-gradient-to-b from-[#050506]/92 via-[#050506]/55 to-transparent px-3 pb-5 pt-1">
        <div className="pointer-events-auto shrink-0">
          <ExploreGlobe
            points={worldPoints}
            activeLocation={filters.location}
            onSelect={(location) => goToFilters({ ...filters, location })}
            size={56}
          />
        </div>
        <div className="pointer-events-auto min-w-0 flex-1">
          {nichePills}
        </div>
        <div className="pointer-events-auto shrink-0">
          <DiscoveryFiltersSheet
            compact
            filters={filters}
            extraLocations={extraLocations}
            hrefFor={hrefFor}
            onNavigate={() => setFilterPending(true)}
          />
        </div>
      </div>
      {filters.location ? (
        <div className="pointer-events-auto -mt-1.5 flex px-3 pb-2">
          <Link
            href={hrefFor({ ...filters, location: null })}
            scroll={false}
            onClick={() => setFilterPending(true)}
            className="sz-pill is-on text-[12px]"
          >
            {filters.location} ×
          </Link>
        </div>
      ) : null}
      {feedReady ? (
        <p className="px-5 pb-2 text-center text-xs text-white/50">{t.explore.feedReady}</p>
      ) : null}
    </div>
  );

  if (!feedMode) {
    return (
      <div className="pb-8 max-md:pb-12">
        <header className="mx-auto w-full max-w-[720px] px-5 md:mx-0 md:max-w-none md:px-0">
          <h1 className="sz-display">{t.explore.title}</h1>
          <p className="sz-sub">{t.explore.subtitle}</p>
          <div className="mt-5">
            <DiscoverySearchBar />
          </div>
          <div className="mt-5 flex items-start gap-3">
            <ExploreGlobe
              points={worldPoints}
              activeLocation={filters.location}
              onSelect={(location) => goToFilters({ ...filters, location })}
              size={56}
            />
            <div className="min-w-0 flex-1">
              {nichePills}
              <div className="mt-3">
                <DiscoveryFiltersSheet
                  filters={filters}
                  extraLocations={extraLocations}
                  hrefFor={hrefFor}
                  onNavigate={() => setFilterPending(true)}
                />
              </div>
            </div>
          </div>
        </header>
        <div className="mt-7 px-5 md:px-0">
          <DiscoveryEmpty title={t.explore.emptyTitle} description={t.explore.emptyDescription} />
          {hints.length ? (
            <div className="mt-5 flex flex-wrap gap-2">
              {hints.map((hint) => (
                <Link
                  key={hint.key}
                  href={hrefFor({ ...filters, [hint.key]: null })}
                  onClick={() => setFilterPending(true)}
                  className="sz-pill"
                >
                  {interpolate(t.explore.removeFilter, { label: t.filters[hint.filter] })}
                </Link>
              ))}
            </div>
          ) : null}
          {nearby.length ? (
            <div className="mt-6">
              <p className="sz-label mb-3">{t.explore.nearby}</p>
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
              <p className="sz-label mb-5">{t.explore.related}</p>
              <PeopleFeed profiles={related} source={source} isLoggedIn={isLoggedIn} />
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="max-md:absolute max-md:inset-0 max-md:overflow-hidden md:pb-8">
      {desktopHeader}
      <div className="relative h-full min-h-0 md:mt-7 md:h-auto">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 md:hidden">{mobileOverlay}</div>
        <div key={filterKey} className="h-full min-h-0">
          {filterPending ? (
            <div className="h-full pb-[var(--sz-bottom-nav-height)] md:pb-0">
              <DiscoveryFeedSkeleton person />
            </div>
          ) : (
            <PeopleProfileFeed
              profiles={profiles}
              source={source}
              isLoggedIn={isLoggedIn}
              hasMore={hasMore || loading}
              onNearEnd={() => void loadMore()}
            />
          )}
        </div>
      </div>
    </div>
  );
}
