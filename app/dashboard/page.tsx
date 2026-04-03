import { headers } from "next/headers";
import Link from "next/link";
import { Armchair, Calendar, Star, Users } from "lucide-react";
import ReservationListRow from "@/src/components/dashboard/reservation-list-row";
import StatCard from "@/src/components/dashboard/stat-card";
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
    supabase.from("restaurant_settings").select("restaurant_capacity, table_count").eq("restaurant_id", restaurant.id).maybeSingle(),
    supabase
      .from("feedbacks")
      .select("id", { count: "exact", head: true })
      .eq("restaurant_id", restaurant.id)
      .gte("created_at", `${today}T00:00:00`)
      .lte("created_at", `${today}T23:59:59`),
  ]);

  const restaurantCapacity = settings?.restaurant_capacity ?? 40;
  const tableCount = settings?.table_count ?? 12;
  const timelineReservations = [...(todayReservations ?? [])].sort((a, b) => a.reservation_time.localeCompare(b.reservation_time));
  const activeTodayReservations = timelineReservations.filter((r) => ["pending", "confirmed"].includes(r.status));
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
    { label: "Réservations aujourd'hui", value: reservationsTodayCount, icon: Calendar, accent: "primary" as const },
    { label: "Personnes attendues", value: peopleExpectedToday, icon: Users, accent: "amber" as const },
    { label: "Tables restantes", value: tablesRemainingToday, icon: Armchair, accent: "stone" as const },
    { label: "Avis reçus aujourd'hui", value: reviewsReceived ?? 0, icon: Star, accent: "primary" as const },
  ];

  return (
    <div className="space-y-16">
      <header>
        <h1 className="dashboard-page-title">{restaurant.name}</h1>
        <p className="dashboard-section-subtitle mt-2 max-w-lg">
          Aujourd&apos;hui · Lien public :{" "}
          <a href={publicLink} className="font-medium text-green-700 hover:underline" target="_blank" rel="noreferrer">
            ouvrir
          </a>
        </p>
      </header>

      <section>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Service d&apos;aujourd&apos;hui</h2>
            <p className="mt-1 text-sm text-gray-500">Par heure de passage.</p>
          </div>
          <Link
            href="/dashboard/reservations?new=1"
            className="inline-flex items-center rounded-lg bg-green-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-800"
          >
            Nouvelle réservation
          </Link>
        </div>

        {timelineReservations.length === 0 ? (
          <p className="py-8 text-sm text-gray-500">Aucune réservation aujourd&apos;hui.</p>
        ) : (
          <div className="divide-y divide-gray-100 border-t border-gray-100">
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
      </section>

      {fullFromSlot ? (
        <p className="text-sm text-amber-800">
          <span className="font-medium">Complet</span> à partir de {fullFromSlot}.
        </p>
      ) : null}

      <section>
        <h2 className="text-lg font-semibold text-gray-900">En chiffres</h2>
        <div className="mt-6 grid gap-0 sm:grid-cols-2 xl:grid-cols-4 xl:divide-x xl:divide-gray-100">
          {kpis.map((kpi) => (
            <StatCard key={kpi.label} label={kpi.label} value={kpi.value} icon={kpi.icon} accent={kpi.accent} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-900">Prochaines tables</h2>
        <p className="mt-1 text-sm text-gray-500">Confirmées ou en attente.</p>
        {activeTodayReservations.length === 0 ? (
          <p className="mt-6 text-sm text-gray-500">Rien de prévu pour l&apos;instant.</p>
        ) : (
          <div className="mt-6 divide-y divide-gray-100 border-t border-gray-100">
            {activeTodayReservations.map((reservation) => (
              <ReservationListRow
                key={reservation.id}
                guestName={reservation.guest_name ?? "Client"}
                timeLabel={reservation.reservation_time}
                subtitle={`${reservation.guests} couverts`}
                status={reservation.status as "pending" | "confirmed"}
              />
            ))}
          </div>
        )}
        <Link href="/dashboard/reservations" className="mt-6 inline-block text-sm font-medium text-green-700 hover:underline">
          Toutes les réservations →
        </Link>
      </section>
    </div>
  );
}
