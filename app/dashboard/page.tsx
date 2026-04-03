import { headers } from "next/headers";
import Link from "next/link";
import { Armchair, Calendar, Star, Users } from "lucide-react";
import ReservationListRow from "@/src/components/dashboard/reservation-list-row";
import StatCard from "@/src/components/dashboard/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { requireRestaurant } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";
import { cn } from "@/src/lib/utils";

const linkPrimaryClass =
  "inline-flex min-h-9 items-center justify-center rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-green-800";

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
    <div className="space-y-10 md:space-y-12">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-500">Tableau de bord</p>
        <p className="mt-2 max-w-xl text-sm text-gray-600">
          Activité du jour pour {restaurant.name}. Lien public :{" "}
          <a href={publicLink} className="font-medium text-green-700 hover:underline" target="_blank" rel="noreferrer">
            ouvrir
          </a>
          .
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <CardTitle>Service d&apos;aujourd&apos;hui</CardTitle>
            <CardDescription>Réservations du jour, par heure de passage.</CardDescription>
          </div>
          <Link href="/dashboard/reservations?new=1" className={cn(linkPrimaryClass, "shrink-0")}>
            Nouvelle réservation
          </Link>
        </CardHeader>
        <CardContent>
          {timelineReservations.length === 0 ? (
            <p className="rounded-lg bg-gray-50/90 py-10 text-center text-sm text-gray-500">Aucune réservation aujourd&apos;hui.</p>
          ) : (
            <div className="space-y-3">
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
        </CardContent>
      </Card>

      {fullFromSlot ? (
        <div className="rounded-xl border border-amber-200/90 bg-amber-50/90 px-5 py-4 text-sm text-amber-950 shadow-sm">
          <span className="font-semibold">Complet</span> à partir de {fullFromSlot}.
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>En chiffres</CardTitle>
          <CardDescription>Vue synthétique de votre journée.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {kpis.map((kpi) => (
              <StatCard key={kpi.label} label={kpi.label} value={kpi.value} icon={kpi.icon} accent={kpi.accent} />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Prochaines tables</CardTitle>
          <CardDescription>Réservations confirmées ou en attente.</CardDescription>
        </CardHeader>
        <CardContent>
          {activeTodayReservations.length === 0 ? (
            <p className="rounded-lg bg-gray-50/90 py-10 text-center text-sm text-gray-500">Rien de prévu pour l&apos;instant.</p>
          ) : (
            <div className="space-y-3">
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
          <Link
            href="/dashboard/reservations"
            className="mt-8 inline-flex text-sm font-semibold text-green-700 hover:text-green-800 hover:underline"
          >
            Toutes les réservations →
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
