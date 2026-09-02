import { SearchView } from "@/src/components/discovery/search-view";
import { requireOnboardedSession } from "@/src/lib/discovery/auth";
import { getCategories, getCategoryProfileCounts, searchDiscovery } from "@/src/lib/discovery/queries";
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

  return (
    <SearchView
      query={query}
      results={results}
      categories={categories}
      counts={Object.fromEntries(counts)}
    />
  );
}
