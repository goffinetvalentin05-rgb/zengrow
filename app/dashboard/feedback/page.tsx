import { MessageSquareText } from "lucide-react";
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
    <section className="space-y-10">
      <div className="flex flex-wrap items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--primary-muted)] text-[var(--primary)]">
          <MessageSquareText size={22} strokeWidth={1.75} />
        </span>
        <div>
          <h1 className="dashboard-page-title">Retours clients</h1>
          <p className="dashboard-section-subtitle mt-2 max-w-xl">
            Messages privés envoyés après votre demande d&apos;avis — restez proche de vos convives.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historique des retours</CardTitle>
          <CardDescription>Ce que vos clients ont partagé en dehors des avis publics.</CardDescription>
        </CardHeader>
        <CardContent>
          {!feedbacks || feedbacks.length === 0 ? (
            <p className="rounded-[20px] border border-dashed border-[var(--border)] bg-[var(--surface-muted)]/70 p-10 text-center text-[14px] text-[var(--muted-foreground)]">
              Aucun retour pour le moment.
            </p>
          ) : (
            <div className="space-y-4">
              {feedbacks.map((item) => (
                <article
                  key={item.id}
                  className="rounded-[20px] border border-[var(--border-soft)] bg-[var(--surface-card)] p-6 shadow-[var(--card-shadow)]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-[15px] font-semibold text-[var(--foreground)]">
                      {item.customer_name || "Client"}
                    </p>
                    <span className="rounded-full bg-[var(--badge-sand-bg)] px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--badge-sand-text)]">
                      {formatDate(item.created_at)}
                    </span>
                  </div>
                  <p className="mt-3 text-[14px] text-[var(--foreground)]/85">
                    <span className="font-medium text-[var(--muted-foreground)]">Note :</span> {item.rating ?? 0}/5
                  </p>
                  <p className="mt-2 text-[14px] leading-relaxed text-[var(--foreground)]/90">
                    {item.message || "(Aucun message)"}
                  </p>
                  <p className="mt-3 text-[13px] text-[var(--muted-foreground)]">{item.customer_email || "Non renseigné"}</p>
                </article>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
