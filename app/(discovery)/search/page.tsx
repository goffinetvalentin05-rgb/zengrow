import { DiscoveryEmpty } from "@/src/components/discovery/empty-state";
import { DiscoverySearchBar } from "@/src/components/discovery/search-bar";
import { ProfileCard } from "@/src/components/discovery/profile-card";
import { requireOnboardedSession } from "@/src/lib/discovery/auth";
import { searchDiscovery } from "@/src/lib/discovery/queries";
import { categoryHref, profileHref } from "@/src/lib/discovery/routes";
import { createClient } from "@/src/lib/supabase/server";
import Link from "next/link";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await requireOnboardedSession();
  const { q = "" } = await searchParams;
  const supabase = await createClient();
  const results = await searchDiscovery(supabase, q, session.profile.id);
  const empty = q.trim().length >= 2 && !results.people.length && !results.projects.length && !results.categories.length;

  return (
    <div className="mx-auto w-full max-w-4xl">
      <h1 className="font-[family-name:var(--font-zg-display)] text-4xl text-white">Search</h1>
      <div className="mt-6">
        <DiscoverySearchBar defaultValue={q} autoFocus />
      </div>
      {empty ? (
        <DiscoveryEmpty className="mt-10" title="No people found." description="Try a name, a project, or a niche like OFM." />
      ) : null}
      {results.people.length ? (
        <section className="mt-10">
          <h2 className="mb-4 text-sm uppercase tracking-[0.16em] text-white/35">People</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {results.people.map((profile) => (
              <ProfileCard key={profile.id} profile={profile} source="search" />
            ))}
          </div>
        </section>
      ) : null}
      {results.projects.length ? (
        <section className="mt-10">
          <h2 className="mb-4 text-sm uppercase tracking-[0.16em] text-white/35">Projects</h2>
          <ul className="space-y-2">
            {results.projects.map((project) => (
              <li key={project.id}>
                <Link
                  href={project.ownerUsername ? profileHref(project.ownerUsername) : "#"}
                  className="block rounded-2xl border border-white/[0.07] p-4"
                >
                  <p className="text-white">{project.name}</p>
                  <p className="text-sm text-white/40">{project.ownerName}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {results.categories.length ? (
        <section className="mt-10">
          <h2 className="mb-4 text-sm uppercase tracking-[0.16em] text-white/35">Categories</h2>
          <div className="flex flex-wrap gap-2">
            {results.categories.map((cat) => (
              <Link
                key={cat.id}
                href={categoryHref(cat.slug)}
                className="rounded-full border border-white/[0.08] px-4 py-2 text-sm text-white/70"
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
