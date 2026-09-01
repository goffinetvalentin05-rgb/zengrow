"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { DiscoveryFiltersSheet } from "@/src/components/discovery/explore-filters";
import { DiscoveryEmpty } from "@/src/components/discovery/empty-state";
import { NichePills } from "@/src/components/discovery/niche-pills";
import { PeopleFeed } from "@/src/components/discovery/profile-discovery-card";
import { PeopleSwipeDeck } from "@/src/components/discovery/people-swipe-deck";
import { DiscoverySearchBar } from "@/src/components/discovery/search-bar";
import { DISCOVERY_PAGE_SIZE } from "@/src/lib/discovery/constants";
import { droppedFilterHints } from "@/src/lib/discovery/apply-filters";
import { categoryDiscoveryHref, exploreHref, feedQueryString } from "@/src/lib/discovery/filters";
import { readExploreScroll, rememberExploreCount, restoreExploreScroll } from "@/src/lib/discovery/track";
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
  const sentinel = useRef<HTMLDivElement>(null);
  const seen = useRef(new Set(initialProfiles.map((profile) => profile.id)));
  const paging = useRef({ offset: initialNextOffset, hasMore: initialHasMore, loading: false });

  useEffect(() => {
    setProfiles(initialProfiles);
    setHasMore(initialHasMore);
    seen.current = new Set(initialProfiles.map((profile) => profile.id));
    paging.current = { offset: initialNextOffset, hasMore: initialHasMore, loading: false };
  }, [initialProfiles, initialHasMore, initialNextOffset]);

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

  return (
    <div className="pb-8">
      <header className="mx-auto w-full max-w-[720px] px-5 md:mx-0 md:max-w-none md:px-0">
        <h1 className="font-[family-name:var(--font-zg-display)] text-[2.15rem] leading-[0.95] tracking-tight text-white md:text-[2.6rem]">
          Discover people worth knowing.
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/45">
          Find builders, creators and operators in the niches you care about.
        </p>
        <div className="mt-5">
          <DiscoverySearchBar />
        </div>
        <div className="mt-5">
          <NichePills
            categories={categories}
            activeSlug={filters.niche}
            favoriteSlugs={favoriteSlugs}
            hrefFor={(slug) => hrefFor({ ...filters, niche: slug })}
          />
          <div className="mt-3">
            <DiscoveryFiltersSheet
              filters={filters}
              extraLocations={extraLocations}
              hrefFor={hrefFor}
            />
          </div>
        </div>
      </header>

      <div className="mt-7 px-5 md:px-0">
        {empty ? (
          <div>
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
                    className="rounded-full border border-white/[0.08] px-3 py-1.5 text-sm text-white/60"
                  >
                    Remove {hint.label}
                  </Link>
                ))}
              </div>
            ) : null}
            {nearby.length ? (
              <div className="mt-6">
                <p className="mb-3 text-[11px] uppercase tracking-[0.16em] text-white/35">Browse nearby niches</p>
                <div className="flex flex-wrap gap-2">
                  {nearby.map((cat) => (
                    <Link
                      key={cat.id}
                      href={hrefFor({ ...filters, niche: cat.slug })}
                      className="rounded-full bg-white/[0.06] px-3.5 py-1.5 text-sm text-white/70"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
            {related.length ? (
              <div className="mt-10">
                <p className="mb-5 text-[11px] uppercase tracking-[0.16em] text-white/35">People close to these filters</p>
                <PeopleFeed profiles={related} source={source} isLoggedIn={isLoggedIn} />
              </div>
            ) : null}
          </div>
        ) : (
          <>
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
            {loading ? <p className="py-6 text-center text-sm text-white/35">Loading more people…</p> : null}
            {!hasMore && profiles.length ? (
              <p className="py-8 text-center text-sm text-white/30">That’s everyone in this slice for now.</p>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
