import { notFound } from "next/navigation";
import { PublicHeader } from "@/src/components/discovery/public-header";
import { ProfileCard } from "@/src/components/discovery/profile-card";
import { ProfileRail } from "@/src/components/discovery/profile-rail";
import { AppAmbientBackground } from "@/src/components/app/app-ambient-background";
import { getOptionalDiscoverySession } from "@/src/lib/discovery/auth";
import { getCategoryBySlug, getExplorePayload } from "@/src/lib/discovery/queries";
import { zgBody } from "@/components/zg-landing/fonts";
import { createClient } from "@/src/lib/supabase/server";
import { cn } from "@/src/lib/utils";

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const session = await getOptionalDiscoverySession();
  const category = await getCategoryBySlug(supabase, slug);
  if (!category) notFound();
  const payload = await getExplorePayload(supabase, {
    viewer: session?.profile ?? null,
    favoriteSlugs: [slug],
    filters: { niche: slug },
    viewerLocation: session?.profile.location,
  });

  return (
    <div className={cn(zgBody.className, "relative min-h-dvh bg-[#08070b] text-white")}>
      <AppAmbientBackground />
      <div className="relative z-10">
        <PublicHeader loggedIn={Boolean(session)} />
        <main className="mx-auto flex max-w-6xl flex-col gap-10 px-5 py-10 md:px-10">
          <header>
            <h1 className="font-[family-name:var(--font-zg-display)] text-5xl text-white">{category.name}</h1>
            <p className="mt-2 text-sm text-white/45">People building in {category.name}.</p>
          </header>
          <ProfileRail title="Rising" profiles={payload.rising} source="category" />
          <ProfileRail title="New" profiles={payload.newProfiles} source="category" variant="compact" />
          <ProfileRail title="Popular" profiles={payload.popular} source="category" />
          <section>
            <h2 className="mb-4 font-[family-name:var(--font-zg-display)] text-2xl text-white">All profiles</h2>
            {payload.all.length ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {payload.all.map((profile) => (
                  <ProfileCard key={profile.id} profile={profile} source="category" />
                ))}
              </div>
            ) : (
              <p className="text-sm text-white/40">No public profiles in this niche yet.</p>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
