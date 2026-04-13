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
    .not("responded_at", "is", null)
    .order("created_at", { ascending: false });

  return (
    <section className="space-y-10">
      <header className="border-b border-zg-border/80 pb-7">
        <h1 className="dashboard-section-heading">Retours clients</h1>
        <p className="dashboard-section-subtitle mt-2 max-w-xl">
          Messages privés envoyés après votre demande d&apos;avis.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Historique</CardTitle>
          <CardDescription>Retours en dehors des avis publics.</CardDescription>
        </CardHeader>
        <CardContent>
          {!feedbacks || feedbacks.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-zg-border-strong bg-zg-surface-elevated/85 py-10 text-center text-sm text-zg-fg/52 shadow-zg-soft backdrop-blur-sm">
              Aucun retour pour le moment.
            </p>
          ) : (
            <div className="space-y-4">
              {feedbacks.map((item) => (
                <article
                  key={item.id}
                  className="rounded-2xl border border-zg-border/90 bg-zg-surface/95 p-5 shadow-zg-soft backdrop-blur-sm md:p-6"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-[15px] font-semibold text-zg-fg">{item.customer_name || "Client"}</p>
                    <time className="rounded-full bg-zg-highlight px-3 py-1 text-xs font-semibold text-zg-teal ring-1 ring-zg-border-accent/80">
                      {formatDate(item.created_at)}
                    </time>
                  </div>
                  <p className="mt-3 text-sm text-zg-fg/62">
                    <span className="font-semibold text-zg-fg/72">Note</span> {item.rating ?? 0}/5
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-zg-fg/82">{item.message || "(Aucun message)"}</p>
                  <p className="mt-3 text-xs text-zg-fg/52">{item.customer_email || "Email non renseigné"}</p>
                </article>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
