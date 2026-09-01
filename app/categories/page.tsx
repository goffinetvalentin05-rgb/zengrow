import Link from "next/link";
import { PublicHeader } from "@/src/components/discovery/public-header";
import { AppAmbientBackground } from "@/src/components/app/app-ambient-background";
import { getOptionalDiscoverySession } from "@/src/lib/discovery/auth";
import { getCategories, getCategoryProfileCounts } from "@/src/lib/discovery/queries";
import { categoryHref } from "@/src/lib/discovery/routes";
import { zgBody } from "@/components/zg-landing/fonts";
import { createClient } from "@/src/lib/supabase/server";
import { cn } from "@/src/lib/utils";

export default async function CategoriesPage() {
  const supabase = await createClient();
  const session = await getOptionalDiscoverySession();
  const [categories, counts] = await Promise.all([getCategories(supabase), getCategoryProfileCounts(supabase)]);

  return (
    <div className={cn(zgBody.className, "relative min-h-dvh bg-[#08070b] text-white")}>
      <AppAmbientBackground />
      <div className="relative z-10">
        <PublicHeader loggedIn={Boolean(session)} />
        <main className="mx-auto max-w-5xl px-5 py-10 md:px-10">
          <h1 className="font-[family-name:var(--font-zg-display)] text-4xl text-white">Categories</h1>
          <p className="mt-2 text-sm text-white/45">People, organized by world.</p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={categoryHref(cat.slug)}
                className="rounded-3xl border border-white/[0.07] bg-white/[0.025] p-5 hover:border-white/15"
              >
                <h2 className="font-[family-name:var(--font-zg-display)] text-2xl text-white">{cat.name}</h2>
                <p className="mt-2 text-sm text-white/45">{cat.description}</p>
                <p className="mt-4 text-xs text-white/30">{counts.get(cat.id) ?? 0} profiles</p>
              </Link>
            ))}
          </div>
          {!categories.length ? (
            <p className="mt-8 text-sm text-white/40">
              No categories yet. Apply the discovery migration, then refresh.
            </p>
          ) : null}
        </main>
      </div>
    </div>
  );
}
