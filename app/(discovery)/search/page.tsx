import Link from "next/link";
import { DiscoveryEmpty } from "@/src/components/discovery/empty-state";
import { DiscoverySearchBar } from "@/src/components/discovery/search-bar";
import { PeopleFeed } from "@/src/components/discovery/profile-discovery-card";
import { ProjectStrip } from "@/src/components/discovery/sz-ui";
import { requireOnboardedSession } from "@/src/lib/discovery/auth";
import { getCategories, getCategoryProfileCounts, searchDiscovery } from "@/src/lib/discovery/queries";
import { categoryHref, DISCOVERY_ROUTES } from "@/src/lib/discovery/routes";
import { createClient } from "@/src/lib/supabase/server";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await requireOnboardedSession();
  const { q = "" } = await searchParams;
  const supabase = await createClient();
  const query = q.trim();
  const [results, categories, counts] = await Promise.all([
    searchDiscovery(supabase, query, session.profile.id),
    getCategories(supabase),
    getCategoryProfileCounts(supabase),
  ]);
  const idle = query.length < 2;
  const empty =
    !idle && !results.people.length && !results.projects.length && !results.categories.length;

  return (
    <div className="mx-auto w-full max-w-[720px] px-5 pb-8 md:max-w-none md:px-0">
      <h1 className="sz-display">Search</h1>
      <p className="sz-sub">Find a person, a project, or a niche.</p>
      <div className="mt-6">
        <DiscoverySearchBar defaultValue={q} autoFocus />
      </div>

      {idle ? (
        <section className="sz-crossfade mt-10">
          <h2 className="sz-label mb-4">People worth knowing</h2>
          {results.people.length ? (
            <PeopleFeed profiles={results.people} source="search" />
          ) : (
            <DiscoveryEmpty title="Nobody to suggest yet." description="As people join, they appear here." />
          )}
          <h2 className="sz-label mb-4 mt-12">Worlds</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const count = counts.get(cat.id) ?? 0;
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
            title="No exact matches yet."
            description="Try a name, a project, or a niche like SaaS."
            href={DISCOVERY_ROUTES.explore}
            cta="Keep discovering"
          />
        </div>
      ) : null}

      {!idle && results.people.length ? (
        <section className="sz-crossfade mt-10">
          <h2 className="sz-label mb-5">People</h2>
          <PeopleFeed profiles={results.people} source="search" />
        </section>
      ) : null}

      {!idle && results.projects.length ? (
        <section className="sz-crossfade mt-10">
          <h2 className="sz-label mb-4">Projects</h2>
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
          <h2 className="sz-label mb-4">Niches</h2>
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
