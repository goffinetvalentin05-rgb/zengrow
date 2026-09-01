import Link from "next/link";
import { DiscoveryEmpty } from "@/src/components/discovery/empty-state";
import { DiscoverySearchBar } from "@/src/components/discovery/search-bar";
import { PeopleFeed } from "@/src/components/discovery/profile-discovery-card";
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
      <h1 className="font-[family-name:var(--font-zg-display)] text-[2.4rem] leading-none tracking-tight text-white">
        Search
      </h1>
      <p className="mt-2 text-sm text-white/40">Find a person, a project, or a niche.</p>
      <div className="mt-6">
        <DiscoverySearchBar defaultValue={q} autoFocus />
      </div>

      {idle ? (
        <section className="mt-10">
          <h2 className="mb-4 text-[11px] uppercase tracking-[0.16em] text-white/35">People worth knowing</h2>
          {results.people.length ? (
            <PeopleFeed profiles={results.people} source="search" />
          ) : (
            <DiscoveryEmpty title="Nobody to suggest yet." description="As people join, they appear here." />
          )}
          <h2 className="mb-4 mt-12 text-[11px] uppercase tracking-[0.16em] text-white/35">Worlds</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const count = counts.get(cat.id) ?? 0;
              return (
                <Link
                  key={cat.id}
                  href={categoryHref(cat.slug)}
                  className="rounded-full border border-white/[0.08] px-3.5 py-1.5 text-sm text-white/70"
                >
                  {cat.name}
                  {count ? <span className="ml-2 text-white/30">{count}</span> : null}
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      {empty ? (
        <div className="mt-10">
          <DiscoveryEmpty
            title="No exact matches yet."
            description="Try a name, a project, or a niche like SaaS."
            href={DISCOVERY_ROUTES.explore}
            cta="Keep discovering"
          />
        </div>
      ) : null}

      {!idle && results.people.length ? (
        <section className="mt-10">
          <h2 className="mb-5 text-[11px] uppercase tracking-[0.16em] text-white/35">People</h2>
          <PeopleFeed profiles={results.people} source="search" />
        </section>
      ) : null}

      {!idle && results.projects.length ? (
        <section className="mt-10">
          <h2 className="mb-2 text-[11px] uppercase tracking-[0.16em] text-white/35">Projects</h2>
          <div className="divide-y divide-white/[0.06]">
            {results.projects.map((project) => (
              <Link
                key={project.id}
                href={project.ownerUsername ? `/${project.ownerUsername}?from=search` : "#"}
                className="block py-4"
              >
                <p className="text-white">{project.name}</p>
                <p className="mt-1 text-sm text-white/40">{project.ownerName}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {!idle && results.categories.length ? (
        <section className="mt-10">
          <h2 className="mb-4 text-[11px] uppercase tracking-[0.16em] text-white/35">Niches</h2>
          <div className="flex flex-wrap gap-2">
            {results.categories.map((cat) => (
              <Link
                key={cat.id}
                href={categoryHref(cat.slug)}
                className="rounded-full border border-white/[0.08] px-3.5 py-1.5 text-sm text-white/70"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
