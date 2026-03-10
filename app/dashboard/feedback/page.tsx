import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { requireRestaurant } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-CH", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export default async function DashboardFeedbackPage() {
  const supabase = await createClient();
  const restaurant = await requireRestaurant();

  const { data: feedbacks } = await supabase
    .from("feedbacks")
    .select("id, reservation_id, customer_name, customer_email, rating, message, created_at")
    .eq("restaurant_id", restaurant.id)
    .order("created_at", { ascending: false });

  return (
    <section className="space-y-6">
      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle>Feedback clients</CardTitle>
          <CardDescription>Tous les feedbacks prives recus depuis les demandes d&apos;avis.</CardDescription>
        </CardHeader>
        <CardContent>
          {!feedbacks || feedbacks.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-muted)] p-4 text-sm text-[var(--muted-foreground)]">
              Aucun feedback pour le moment.
            </p>
          ) : (
            <div className="space-y-3">
              {feedbacks.map((item) => (
                <article key={item.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
                  <p className="text-sm font-semibold text-[var(--foreground)]">Feedback #{item.id.slice(0, 8)}</p>
                  <p className="mt-1 text-sm text-[var(--foreground)]/85">Rating : {item.rating ?? 0}/5</p>
                  <p className="mt-1 text-sm text-[var(--foreground)]/85">Message : {item.message || "(Aucun message)"}</p>
                  <p className="mt-1 text-sm text-[var(--foreground)]/85">Customer : {item.customer_name || "Client"}</p>
                  <p className="mt-1 text-sm text-[var(--foreground)]/85">
                    Email : {item.customer_email || "Non renseigne"}
                  </p>
                  <p className="mt-1 text-sm text-[var(--foreground)]/85">Date : {formatDate(item.created_at)}</p>
                </article>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
