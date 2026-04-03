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
      <header className="space-y-2">
        <p className="dashboard-section-kicker">Feedback</p>
        <h1 className="dashboard-page-title">Retours clients</h1>
        <p className="dashboard-section-subtitle max-w-xl">
          Messages privés après votre demande d&apos;avis — en dehors des avis Google publics.
        </p>
      </header>

      {!feedbacks || feedbacks.length === 0 ? (
        <p className="py-12 text-center text-sm text-gray-500">Aucun retour pour le moment.</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {feedbacks.map((item) => (
            <li key={item.id} className="py-8">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-medium text-gray-900">{item.customer_name || "Client"}</p>
                <time className="text-xs text-gray-500">{formatDate(item.created_at)}</time>
              </div>
              <p className="mt-2 text-sm text-gray-600">
                Note {item.rating ?? 0}/5
                {item.customer_email ? ` · ${item.customer_email}` : ""}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-gray-800">{item.message || "(Aucun message)"}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
