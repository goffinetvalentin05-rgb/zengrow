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
      <header className="border-b border-gray-100 pb-6">
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
            <p className="rounded-xl border border-dashed border-gray-200 bg-gray-50/80 py-10 text-center text-sm text-gray-500 shadow-sm">
              Aucun retour pour le moment.
            </p>
          ) : (
            <div className="space-y-4">
              {feedbacks.map((item) => (
                <article
                  key={item.id}
                  className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm md:p-6"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-[15px] font-semibold text-gray-900">{item.customer_name || "Client"}</p>
                    <time className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800 ring-1 ring-green-200/80">
                      {formatDate(item.created_at)}
                    </time>
                  </div>
                  <p className="mt-3 text-sm text-gray-600">
                    <span className="font-medium text-gray-700">Note</span> {item.rating ?? 0}/5
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-gray-800">{item.message || "(Aucun message)"}</p>
                  <p className="mt-3 text-xs text-gray-500">{item.customer_email || "Email non renseigné"}</p>
                </article>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
