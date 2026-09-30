import LibraryView from "@/src/components/learn/library-view";
import { DataError } from "@/src/components/learn/states";
import { ensureStarterCategories, listCategories, listItems, listRecentReviewLogs } from "@/src/lib/learn/db";
import { requireLearnDb } from "@/src/lib/learn/page-db";

export default async function LibraryPage() {
  const db = await requireLearnDb();
  try {
    const categories = await ensureStarterCategories(db);
    const [items, logsByItem] = await Promise.all([listItems(db), listRecentReviewLogs(db)]);
    return <LibraryView items={items} categories={categories} logsByItem={logsByItem} />;
  } catch (error) {
    return <DataError message={error instanceof Error ? error.message : "Could not load the library."} />;
  }
}
