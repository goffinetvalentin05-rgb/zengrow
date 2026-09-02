"use client";

import Link from "next/link";
import { DiscoveryEmpty } from "@/src/components/discovery/empty-state";
import { DiscoverySearchBar } from "@/src/components/discovery/search-bar";
import { PeopleFeed } from "@/src/components/discovery/profile-discovery-card";
import { ProjectStrip } from "@/src/components/discovery/sz-ui";
import { categoryHref, DISCOVERY_ROUTES } from "@/src/lib/discovery/routes";
import type { Category, ProfileCardModel, Project } from "@/src/lib/discovery/types";
import { useI18n } from "@/src/i18n/provider";

export function SearchView({
  query,
  results,
  categories,
  counts,
}: {
  query: string;
  results: {
    people: ProfileCardModel[];
    projects: (Project & { ownerUsername?: string | null; ownerName?: string | null })[];
    categories: Category[];
  };
  categories: Category[];
  counts: Map<string, number> | Record<string, number>;
}) {
  const { t } = useI18n();
  const idle = query.length < 2;
  const empty = !idle && !results.people.length && !results.projects.length && !results.categories.length;
  const countOf = (id: string) => (counts instanceof Map ? counts.get(id) ?? 0 : counts[id] ?? 0);

  return (
    <div className="mx-auto w-full max-w-[720px] px-5 pb-8 md:max-w-none md:px-0">
      <h1 className="sz-display">{t.search.title}</h1>
      <p className="sz-sub">{t.search.subtitle}</p>
      <div className="mt-6">
        <DiscoverySearchBar defaultValue={query} />
      </div>

      {idle ? (
        <section className="sz-crossfade mt-10">
          <h2 className="sz-label mb-4">{t.search.worthKnowing}</h2>
          {results.people.length ? (
            <PeopleFeed profiles={results.people} source="search" />
          ) : (
            <DiscoveryEmpty title={t.search.nobodyYet} description={t.search.nobodyHint} />
          )}
          <h2 className="sz-label mb-4 mt-12">{t.search.worlds}</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const count = countOf(cat.id);
              return (
                <Link key={cat.id} href={categoryHref(cat.slug)} className="sz-pill">
                  {cat.name}
                  {count ? <span className="ml-2 text-white/30">{count}</span> : null}
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      {empty ? (
        <div className="sz-crossfade mt-10">
          <DiscoveryEmpty
            title={t.search.noResults}
            description={t.search.noResultsHint}
            href={DISCOVERY_ROUTES.explore}
            cta={t.search.keepDiscovering}
          />
        </div>
      ) : null}

      {!idle && results.people.length ? (
        <section className="sz-crossfade mt-10">
          <h2 className="sz-label mb-5">{t.search.people}</h2>
          <PeopleFeed profiles={results.people} source="search" />
        </section>
      ) : null}

      {!idle && results.projects.length ? (
        <section className="sz-crossfade mt-10">
          <h2 className="sz-label mb-4">{t.search.projects}</h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {results.projects.map((project) => (
              <Link
                key={project.id}
                href={project.ownerUsername ? `/${project.ownerUsername}?from=search` : "#"}
                className="sz-card sz-card-hover sz-press block p-4"
              >
                <ProjectStrip
                  name={project.name}
                  logoUrl={project.logoUrl}
                  status={project.status}
                  description={project.description}
                  showLabel={false}
                />
                <p className="sz-meta mt-2 pl-[2.375rem]">{project.ownerName}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {!idle && results.categories.length ? (
        <section className="sz-crossfade mt-10">
          <h2 className="sz-label mb-4">{t.search.niches}</h2>
          <div className="flex flex-wrap gap-2">
            {results.categories.map((cat) => (
              <Link key={cat.id} href={categoryHref(cat.slug)} className="sz-pill">
                {cat.name}
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
