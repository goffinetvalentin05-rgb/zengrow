import { headers } from "next/headers";
import Link from "next/link";
import { Suspense } from "react";
import ReservationListRow from "@/src/components/dashboard/reservation-list-row";
import { DashboardStats, DashboardStatsSkeleton } from "@/src/components/dashboard/dashboard-stats";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { calendarYmdInBusinessTz, reservationIsAtOrAfterNow } from "@/src/lib/date/business-calendar";
import { requireRestaurant } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";
import { cn } from "@/src/lib/utils";

const ctaReservationClass =
  "inline-flex min-h-9 items-center justify-center rounded-full bg-gradient-to-r from-[#1F7A6C] to-[#3DBE9F] px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_30px_-12px_rgba(31,122,108,0.75)] transition hover:scale-[1.02]";

const sectionIntroClass = "text-xl font-bold tracking-tight text-[#0F3F3A] md:text-[22px] md:leading-snug";
const sectionDescClass = "mt-2 text-sm leading-relaxed text-[#0F3F3A]/58";

export default async function DashboardPage() {
  const supabase = await createClient();
  const restaurant = await requireRestaurant();
  const headerList = await headers();
  const host = headerList.get("host");
  const protocol = headerList.get("x-forwarded-proto") ?? "http";
  const publicLink = host ? `${protocol}://${host}/r/${restaurant.slug}` : `/r/${restaurant.slug}`;
  const today = calendarYmdInBusinessTz();

  const [{ data: todayReservations }, { data: settings }, { data: upcomingRows }] = await Promise.all([
    supabase
      .from("reservations")
      .select("id, guest_name, guests, reservation_time, status, zone, reservation_type")
      .eq("restaurant_id", restaurant.id)
      .eq("reservation_date", today)
      .in("status", ["pending", "confirmed", "completed"]),
    supabase
      .from("restaurant_settings")
      .select("restaurant_capacity, terrace_enabled")
      .eq("restaurant_id", restaurant.id)
      .maybeSingle(),
    supabase
      .from("reservations")
      .select("id, guest_name, guests, reservation_date, reservation_time, status, zone, reservation_type")
      .eq("restaurant_id", restaurant.id)
      .gte("reservation_date", today)
      .in("status", ["pending", "confirmed"])
      .order("reservation_date", { ascending: true })
      .order("reservation_time", { ascending: true })
      .limit(40),
  ]);

  const restaurantCapacity = settings?.restaurant_capacity ?? 40;
  const showZoneOnDashboard = settings?.terrace_enabled === true;
  const timelineReservations = [...(todayReservations ?? [])].sort((a, b) => a.reservation_time.localeCompare(b.reservation_time));
  const activeTodayReservations = timelineReservations.filter((r) => ["pending", "confirmed"].includes(r.status));
  const now = new Date();
  const upcomingReservations = (upcomingRows ?? [])
    .filter((r) => reservationIsAtOrAfterNow(r.reservation_date, r.reservation_time, now))
    .slice(0, 12);

  const slotCapacityMap = new Map<string, number>();
  for (const reservation of activeTodayReservations) {
    const current = slotCapacityMap.get(reservation.reservation_time) ?? 0;
    slotCapacityMap.set(reservation.reservation_time, current + (reservation.guests ?? 0));
  }
  const fullFromSlot =
    [...slotCapacityMap.entries()]
      .filter(([, guests]) => guests >= restaurantCapacity)
      .sort((a, b) => a[0].localeCompare(b[0]))[0]?.[0] ?? null;

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#0F3F3A]/45">Tableau de bord</p>
        <p className="mt-2 max-w-xl text-sm text-[#0F3F3A]/65">
          Activité du jour pour {restaurant.name}. Lien public :{" "}
          <a href={publicLink} className="font-semibold text-[#1F7A6C] underline decoration-[#CBE6DF] underline-offset-2 hover:text-[#0F3F3A]" target="_blank" rel="noreferrer">
            ouvrir
          </a>
          .
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Service d&apos;aujourd&apos;hui</CardTitle>
            <CardDescription>Réservations du jour, par heure de passage.</CardDescription>
          </div>
          <Link href="/dashboard/reservations?new=1" className={cn(ctaReservationClass, "shrink-0")}>
            Nouvelle réservation
          </Link>
        </CardHeader>
        <CardContent>
          {timelineReservations.length === 0 ? (
            <p className="py-14 text-center text-sm text-[#0F3F3A]/45">Aucune réservation aujourd&apos;hui.</p>
          ) : (
            <div className="-mx-1">
              {timelineReservations.map((reservation) => (
                <ReservationListRow
                  key={reservation.id}
                  guestName={reservation.guest_name ?? "Client"}
                  timeLabel={reservation.reservation_time}
                  subtitle={`${reservation.guests} ${reservation.guests > 1 ? "personnes" : "personne"}`}
                  status={reservation.status as "pending" | "confirmed" | "completed"}
                  seatingZone={(reservation.zone === "terrace" ? "terrace" : "interior") as "interior" | "terrace"}
                  reservationType={reservation.reservation_type === "walkin" ? "walkin" : "standard"}
                  emphasizeTime
                  presentation="list"
                  showZoneBadge={showZoneOnDashboard}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {fullFromSlot ? (
        <div className="rounded-xl border border-amber-200/80 bg-white px-5 py-4 text-sm text-amber-950 shadow-md">
          <span className="font-bold text-amber-900">Complet</span> à partir de {fullFromSlot}.
        </div>
      ) : null}

      <section className="space-y-6" aria-labelledby="dashboard-stats-heading">
        <div>
          <h2 id="dashboard-stats-heading" className={sectionIntroClass}>
            En chiffres
          </h2>
          <p className={sectionDescClass}>Vue synthétique de votre journée.</p>
        </div>
        <Suspense fallback={<DashboardStatsSkeleton />}>
          <DashboardStats restaurantId={restaurant.id} />
        </Suspense>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Prochaines tables</CardTitle>
          <CardDescription>Prochaines réservations à venir (confirmées ou en attente).</CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingReservations.length === 0 ? (
            <p className="py-14 text-center text-sm text-[#0F3F3A]/45">Rien de prévu pour l&apos;instant.</p>
          ) : (
            <div className="-mx-1">
              {upcomingReservations.map((reservation) => (
                <ReservationListRow
                  key={reservation.id}
                  guestName={reservation.guest_name ?? "Client"}
                  timeLabel={
                    reservation.reservation_date === today
                      ? reservation.reservation_time
                      : `${reservation.reservation_date.slice(8, 10)}.${reservation.reservation_date.slice(5, 7)} · ${reservation.reservation_time.trim().slice(0, 5)}`
                  }
                  subtitle={`${reservation.guests} couverts`}
                  status={reservation.status as "pending" | "confirmed"}
                  seatingZone={(reservation.zone === "terrace" ? "terrace" : "interior") as "interior" | "terrace"}
                  reservationType={reservation.reservation_type === "walkin" ? "walkin" : "standard"}
                  presentation="list"
                  showZoneBadge={showZoneOnDashboard}
                />
              ))}
            </div>
          )}
          <Link
            href="/dashboard/reservations"
            className="mt-8 inline-flex text-sm font-semibold text-[#1F7A6C] transition hover:text-[#0F3F3A] hover:underline"
          >
            Toutes les réservations →
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
