import { headers } from "next/headers";
import Link from "next/link";
import PublicLinkCard from "@/src/components/dashboard/public-link-card";
import ReservationListRow from "@/src/components/dashboard/reservation-list-row";
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
    { label: "Personnes attendues", value: peopleExpectedToday },
    { label: "Tables restantes", value: tablesRemainingToday },
    { label: "Avis Google reçus", value: reviewsReceived ?? 0 },
  ];

  return (
    <section className="space-y-16 pb-8">
      <header className="space-y-2">
        <p className="dashboard-section-kicker">Tableau de bord</p>
        <h1 className="dashboard-page-title">{restaurant.name}</h1>
        <p className="dashboard-section-subtitle max-w-xl">
          Aujourd&apos;hui : réservations, couverts et lien public en un coup d&apos;œil.
        </p>
      </header>

      <div className="flex flex-wrap gap-x-14 gap-y-8 border-b border-gray-100 pb-12">
        {kpis.map((kpi) => (
          <div key={kpi.label}>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{kpi.label}</p>
            <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-gray-900">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Réservations du jour</h2>
            <p className="dashboard-section-subtitle mt-1">Par ordre d&apos;heure.</p>
          </div>
          <Link
            href="/dashboard/reservations?new=1"
            className="inline-flex min-h-11 items-center rounded-lg bg-[var(--primary)] px-5 text-sm font-medium text-white transition hover:bg-[var(--primary-hover)]"
          >
            Nouvelle réservation
          </Link>
        </div>

        {timelineReservations.length === 0 ? (
          <p className="py-10 text-center text-sm text-gray-500">
            Aucune réservation aujourd&apos;hui. Les créneaux apparaîtront ici automatiquement.
          </p>
        ) : (
          <div>
            {timelineReservations.map((reservation) => (
              <ReservationListRow
                key={reservation.id}
                guestName={reservation.guest_name ?? "Client"}
                timeLabel={reservation.reservation_time}
                subtitle={`${reservation.guests} ${reservation.guests > 1 ? "personnes" : "personne"}`}
                status={reservation.status as "pending" | "confirmed" | "completed"}
                emphasizeTime
              />
            ))}
          </div>
        )}

        <Link href="/dashboard/reservations" className="inline-flex text-sm font-medium text-green-700 hover:text-green-800">
          Voir toutes les réservations →
        </Link>
      </div>

      {fullFromSlot ? (
        <p className="border-l-4 border-amber-400 bg-amber-50/80 py-3 pl-4 text-sm text-amber-950">
          <span className="font-semibold">Complet</span> à partir de {fullFromSlot} — capacité maximale sur ce créneau.
        </p>
      ) : null}

      <PublicLinkCard link={publicLink} />
    </section>
  );
}
