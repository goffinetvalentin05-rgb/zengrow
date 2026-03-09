import { headers } from "next/headers";
import PublicLinkCard from "@/src/components/dashboard/public-link-card";
import StatusBadge from "@/src/components/dashboard/status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
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
    { label: "Reservations aujourd'hui", value: reservationsToday ?? 0 },
    { label: "Reservations a venir", value: upcomingReservations ?? 0 },
    { label: "Clients servis", value: servedGuestsTotal },
    { label: "Avis recus", value: reviewsReceived ?? 0 },
  ];

  return (
    <section className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="rounded-3xl">
            <CardContent className="space-y-1 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
                {kpi.label}
              </p>
              <p className="text-4xl font-semibold text-[var(--foreground)]">{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_0.95fr]">
        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>Prochaines reservations</CardTitle>
            <CardDescription>Liste simple des prochaines tables a servir.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {(upcomingData ?? []).length === 0 ? (
              <p className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-muted)] p-5 text-sm text-[var(--muted-foreground)]">
                Aucune reservation a venir pour le moment.
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
                      {reservation.reservation_date} a {reservation.reservation_time} - {reservation.guests} couverts
                    </p>
                  </div>
                  <StatusBadge status={(reservation.status as "pending" | "confirmed") ?? "confirmed"} />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <PublicLinkCard link={publicLink} />
        </div>
      </div>
    </section>
  );
}
