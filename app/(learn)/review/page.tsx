import ReviewSession from "@/src/components/learn/review-session";
import { DataError } from "@/src/components/learn/states";
import { listDueItems } from "@/src/lib/learn/db";
import { requireLearnDb } from "@/src/lib/learn/page-db";

export default async function ReviewPage() {
  const db = await requireLearnDb();
  try {
    const items = await listDueItems(db);
    return <ReviewSession items={items} />;
  } catch (error) {
    return <DataError message={error instanceof Error ? error.message : "Could not load reviews."} />;
  }
}
