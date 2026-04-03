import { headers } from "next/headers";
import Link from "next/link";
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

  const [{ data: todayReservations }, { data: settings }, { count: reviewsReceived }] = await Promise.all([
    supabase
      .from("reservations")
      .select("id, guest_name, guests, reservation_time, status")
      .eq("restaurant_id", restaurant.id)
      .eq("reservation_date", today)
      .in("status", ["pending", "confirmed", "completed"]),
    supabase
      .from("restaurant_settings")
      .select("restaurant_capacity, table_count")
      .eq("restaurant_id", restaurant.id)
      .maybeSingle(),
    supabase
      .from("feedbacks")
      .select("id", { count: "exact", head: true })
      .eq("restaurant_id", restaurant.id)
      .gte("created_at", `${today}T00:00:00`)
      .lte("created_at", `${today}T23:59:59`),
  ]);

  const restaurantCapacity = settings?.restaurant_capacity ?? 40;
  const tableCount = settings?.table_count ?? 12;
  const timelineReservations = [...(todayReservations ?? [])].sort((a, b) =>
    a.reservation_time.localeCompare(b.reservation_time),
  );
  const activeTodayReservations = timelineReservations.filter((reservation) =>
    ["pending", "confirmed"].includes(reservation.status),
  );
  const reservationsTodayCount = activeTodayReservations.length;
  const peopleExpectedToday = activeTodayReservations.reduce((sum, row) => sum + (row.guests ?? 0), 0);
  const tablesRemainingToday = Math.max(tableCount - reservationsTodayCount, 0);

  const slotCapacityMap = new Map<string, number>();
  for (const reservation of activeTodayReservations) {
    const current = slotCapacityMap.get(reservation.reservation_time) ?? 0;
    slotCapacityMap.set(reservation.reservation_time, current + (reservation.guests ?? 0));
  }
  const fullFromSlot =
    [...slotCapacityMap.entries()]
      .filter(([, guests]) => guests >= restaurantCapacity)
      .sort((a, b) => a[0].localeCompare(b[0]))[0]?.[0] ?? null;

  const kpis = [
    { label: "Réservations aujourd'hui", value: reservationsTodayCount },
    { label: "Personnes attendues aujourd'hui", value: peopleExpectedToday },
    { label: "Tables restantes aujourd'hui", value: tablesRemainingToday },
    { label: "Avis Google reçus", value: reviewsReceived ?? 0 },
  ];

  return (
    <section className="space-y-10">
      <div className="rounded-xl border border-[rgba(0,0,0,0.07)] bg-[var(--surface)] p-6 shadow-sm md:p-7">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="dashboard-page-title">Service d&apos;aujourd&apos;hui</h2>
            <p className="mt-1.5 text-sm text-[var(--muted-foreground)]">
              Timeline des réservations prévues aujourd&apos;hui.
            </p>
          </div>
          <Link
            href="/dashboard/reservations?new=1"
            className="inline-flex min-h-[42px] items-center rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-medium text-[var(--primary-foreground)] shadow-sm transition hover:bg-[var(--primary-hover)]"
          >
            Ajouter une réservation
          </Link>
        </div>

        {timelineReservations.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[rgba(0,0,0,0.08)] bg-[var(--surface-muted)]/60 p-5 text-sm text-[var(--muted-foreground)]">
            Aucune réservation aujourd&apos;hui.
          </p>
        ) : (
          <div className="space-y-2">
            {timelineReservations.map((reservation) => (
              <div
                key={reservation.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[rgba(0,0,0,0.07)] bg-[var(--surface-muted)]/50 px-4 py-3 shadow-sm"
              >
                <p className="text-sm text-[var(--foreground)]">
                  <span className="font-semibold">{reservation.reservation_time}</span> —{" "}
                  {reservation.guest_name ?? "Client"} — {reservation.guests} personnes
                </p>
                <StatusBadge status={reservation.status as "pending" | "confirmed" | "completed"} />
              </div>
            ))}
          </div>
        )}
      </div>

      {fullFromSlot ? (
        <div className="rounded-xl border border-amber-200/90 bg-amber-50/90 px-4 py-3 text-sm font-medium text-amber-900">
          Restaurant complet à partir de {fullFromSlot}
        </div>
      ) : null}

      <div className="border-b border-[rgba(0,0,0,0.06)] pb-10">
        <div className="mb-6">
          <h2 className="dashboard-page-title">Vue d&apos;ensemble</h2>
          <p className="mt-1.5 text-sm text-[var(--muted-foreground)]">
            Statistiques clés du service d&apos;aujourd&apos;hui.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map((kpi) => (
            <div
              key={kpi.label}
              className="rounded-xl border border-[rgba(0,0,0,0.07)] bg-[var(--surface-muted)]/50 px-5 py-5 shadow-sm"
            >
              <p className="dashboard-section-kicker">{kpi.label}</p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-[var(--foreground)]">{kpi.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-10 xl:grid-cols-[1.6fr_0.95fr]">
        <section className="space-y-4 border-b border-[rgba(0,0,0,0.06)] pb-10 xl:border-b-0 xl:border-r xl:pb-0 xl:pr-10">
          <div>
            <h3 className="dashboard-page-title">Prochaines réservations</h3>
            <p className="mt-1.5 text-sm text-[var(--muted-foreground)]">
              Liste simple des prochaines tables à servir aujourd&apos;hui.
            </p>
          </div>
          {activeTodayReservations.length === 0 ? (
            <p className="rounded-xl border border-dashed border-[rgba(0,0,0,0.08)] bg-[var(--surface-muted)]/60 p-6 text-sm text-[var(--muted-foreground)]">
              Aucune réservation à venir pour le moment.
            </p>
          ) : (
            activeTodayReservations.map((reservation) => (
              <div
                key={reservation.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[rgba(0,0,0,0.07)] bg-[var(--surface-muted)]/50 p-4 shadow-sm"
              >
                <div>
                  <p className="font-semibold text-[var(--foreground)]">{reservation.guest_name ?? "Client"}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {reservation.reservation_time} — {reservation.guests} couverts
                  </p>
                </div>
                <StatusBadge status={reservation.status as "pending" | "confirmed"} />
              </div>
            ))
          )}

          <Link
            href="/dashboard/reservations"
            className="inline-flex text-sm font-medium text-[var(--primary)] underline decoration-[var(--primary)]/25 underline-offset-4 transition hover:decoration-[var(--primary)]/50"
          >
            Voir toutes les réservations
          </Link>
        </section>

        <section className="space-y-4">
          <PublicLinkCard link={publicLink} />
        </section>
      </div>
    </section>
  );
}
