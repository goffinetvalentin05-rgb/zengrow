import { headers } from "next/headers";
import PublicLinkCard from "@/src/components/dashboard/public-link-card";
import StatusBadge from "@/src/components/dashboard/status-badge";
import { requireRestaurant } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const restaurant = await requireRestaurant();
  const headerList = await headers();
  const host = headerList.get("host");
  const protocol = headerList.get("x-forwarded-proto") ?? "http";
  const publicLink = host ? `${protocol}://${host}/r/${restaurant.slug}` : `/r/${restaurant.slug}`;
  const today = new Date().toISOString().split("T")[0];

  const [{ count: reservationsToday }, { count: upcomingReservations }, { data: guestsServed }] =
    await Promise.all([
      supabase
        .from("reservations")
        .select("id", { count: "exact", head: true })
        .eq("restaurant_id", restaurant.id)
        .eq("reservation_date", today),
      supabase
        .from("reservations")
        .select("id", { count: "exact", head: true })
        .eq("restaurant_id", restaurant.id)
        .gte("reservation_date", today)
        .in("status", ["pending", "confirmed"]),
      supabase
        .from("reservations")
        .select("guests")
        .eq("restaurant_id", restaurant.id)
        .eq("status", "completed"),
    ]);

  const [{ count: reviewsReceived }, { data: upcomingData }] =
    await Promise.all([
      supabase
        .from("review_requests")
        .select("id", { count: "exact", head: true })
        .eq("restaurant_id", restaurant.id)
        .eq("status", "sent"),
      supabase
        .from("reservations")
        .select("id, guest_name, guests, reservation_time, reservation_date, status")
        .eq("restaurant_id", restaurant.id)
        .in("status", ["pending", "confirmed"])
        .gte("reservation_date", today)
        .order("reservation_date", { ascending: true })
        .order("reservation_time", { ascending: true })
        .limit(8),
    ]);

  const servedGuestsTotal = (guestsServed ?? []).reduce((sum, row) => sum + (row.guests ?? 0), 0);

  const kpis = [
    { label: "Réservations aujourd'hui", value: reservationsToday ?? 0 },
    { label: "Réservations à venir", value: upcomingReservations ?? 0 },
    { label: "Clients servis", value: servedGuestsTotal },
    { label: "Avis reçus", value: reviewsReceived ?? 0 },
  ];

  return (
    <section className="space-y-6">
      <div className="border-b border-[var(--border)] pb-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Vue d&apos;ensemble</h2>
          <p className="text-sm text-[var(--muted-foreground)]">Statistiques clés de votre activité du jour.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
                {kpi.label}
              </p>
              <p className="text-4xl font-semibold text-[var(--foreground)]">{kpi.value}</p>
          </div>
        ))}
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.6fr_0.95fr]">
        <section className="space-y-3 border-b border-[var(--border)] pb-6 xl:border-b-0 xl:border-r xl:pb-0 xl:pr-5">
          <div>
            <h3 className="text-lg font-semibold text-[var(--foreground)]">Prochaines réservations</h3>
            <p className="text-sm text-[var(--muted-foreground)]">Liste simple des prochaines tables à servir.</p>
          </div>
            {(upcomingData ?? []).length === 0 ? (
              <p className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-muted)] p-5 text-sm text-[var(--muted-foreground)]">
                Aucune réservation à venir pour le moment.
              </p>
            ) : (
              (upcomingData ?? []).map((reservation) => (
                <div
                  key={reservation.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-3"
                >
                  <div>
                    <p className="font-semibold text-[var(--foreground)]">{reservation.guest_name ?? "Client"}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {reservation.reservation_date} à {reservation.reservation_time} - {reservation.guests} couverts
                    </p>
                  </div>
                  <StatusBadge status={(reservation.status as "pending" | "confirmed") ?? "confirmed"} />
                </div>
              ))
            )}
        </section>

        <section className="space-y-4">
          <PublicLinkCard link={publicLink} />
        </section>
      </div>
    </section>
  );
}
