import Link from "next/link";
import { DiscoveryEmpty } from "@/src/components/discovery/empty-state";
import { DiscoverySearchBar } from "@/src/components/discovery/search-bar";
import { ProfileRow } from "@/src/components/discovery/profile-row";
import { requireOnboardedSession } from "@/src/lib/discovery/auth";
import { getCategories, getCategoryProfileCounts, searchDiscovery } from "@/src/lib/discovery/queries";
import { categoryHref, profileHref } from "@/src/lib/discovery/routes";
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
  const empty = query.length >= 2 && !results.people.length && !results.projects.length && !results.categories.length;
  const idle = query.length < 2;

  return (
    <div className="mx-auto w-full max-w-[560px] px-5 pb-8 md:px-0">
      <h1 className="font-[family-name:var(--font-zg-display)] text-[2.4rem] leading-none tracking-tight text-white">
        Search
      </h1>
      <p className="mt-2 text-sm text-white/40">Find a person, a project, or a world.</p>
      <div className="mt-6">
        <DiscoverySearchBar defaultValue={q} autoFocus />
      </div>

      {idle ? (
        <section className="mt-10">
          <h2 className="mb-4 text-[11px] uppercase tracking-[0.16em] text-white/35">Worlds</h2>
          <div className="divide-y divide-white/[0.06]">
            {categories.map((cat) => {
              const count = counts.get(cat.id) ?? 0;
              return (
                <Link key={cat.id} href={categoryHref(cat.slug)} className="flex items-baseline justify-between py-4">
                  <span className="font-[family-name:var(--font-zg-display)] text-2xl text-white">{cat.name}</span>
                  <span className="text-sm text-white/35">{count}</span>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      {empty ? (
        <DiscoveryEmpty className="mt-10" title="No people found." description="Try a name, a project, or a niche like SaaS." />
      ) : null}

      {results.people.length ? (
        <section className="mt-10">
          <h2 className="mb-2 text-[11px] uppercase tracking-[0.16em] text-white/35">People</h2>
          <div className="divide-y divide-white/[0.06]">
            {results.people.map((profile) => (
              <ProfileRow key={profile.id} profile={profile} source="search" />
            ))}
          </div>
        </section>
      ) : null}

      {results.projects.length ? (
        <section className="mt-10">
          <h2 className="mb-2 text-[11px] uppercase tracking-[0.16em] text-white/35">Projects</h2>
          <div className="divide-y divide-white/[0.06]">
            {results.projects.map((project) => (
              <Link
                key={project.id}
                href={project.ownerUsername ? profileHref(project.ownerUsername) : "#"}
                className="block py-4"
              >
                <p className="text-white">{project.name}</p>
                <p className="mt-1 text-sm text-white/40">{project.ownerName}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {results.categories.length ? (
        <section className="mt-10">
          <h2 className="mb-2 text-[11px] uppercase tracking-[0.16em] text-white/35">Categories</h2>
          <div className="divide-y divide-white/[0.06]">
            {results.categories.map((cat) => (
              <Link key={cat.id} href={categoryHref(cat.slug)} className="flex items-baseline justify-between py-4">
                <span className="text-lg text-white">{cat.name}</span>
                <span className="text-sm text-white/35">Open</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
