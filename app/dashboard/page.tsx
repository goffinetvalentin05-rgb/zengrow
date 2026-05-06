import { headers } from "next/headers";
import Link from "next/link";
import { Suspense } from "react";
import { CalendarDays, ExternalLink, LayoutGrid, Link2, Plus, Settings } from "lucide-react";
import ReservationListRow from "@/src/components/dashboard/reservation-list-row";
import { DashboardStats, DashboardStatsSkeleton } from "@/src/components/dashboard/dashboard-stats";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { calendarYmdInBusinessTz, reservationIsAtOrAfterNow } from "@/src/lib/date/business-calendar";
import { requireRestaurant } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";
import PageHeader from "@/src/components/dashboard/page-header";
import DashboardContent from "@/src/components/dashboard/ui/dashboard-content";
import Button from "@/src/components/ui/button";

const sectionIntroClass =
  "text-xl font-bold tracking-[-0.02em] text-zg-fg md:text-[1.375rem] md:leading-snug";
const sectionDescClass = "mt-2 text-sm leading-relaxed text-zg-fg/58";

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
    <DashboardContent>
      <PageHeader
        kicker="Tableau de bord"
        title={restaurant.name}
        subtitle="Vue d’ensemble de votre activité."
        secondaryActions={[
          {
            kind: "external",
            href: publicLink,
            label: "Page publique",
            icon: <ExternalLink className="h-4 w-4" strokeWidth={2} />,
          },
          {
            kind: "copy",
            label: "Copier le lien",
            icon: <Link2 className="h-4 w-4" strokeWidth={2} />,
            value: publicLink,
          },
        ]}
        primaryAction={{
          kind: "link",
          href: "/dashboard/reservations?new=1",
          label: "Nouvelle réservation",
          icon: <Plus className="h-4 w-4" strokeWidth={2} />,
        }}
      />

      <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
        <Card className="lg:col-span-7">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>Service d&apos;aujourd&apos;hui</CardTitle>
              <CardDescription>Réservations du jour, par heure de passage.</CardDescription>
            </div>
            {fullFromSlot ? (
              <div className="shrink-0 rounded-full border border-amber-200/90 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-950">
                Complet dès {fullFromSlot}
              </div>
            ) : null}
          </CardHeader>
          <CardContent>
            {timelineReservations.length === 0 ? (
              <p className="py-14 text-center text-sm text-zg-fg/48">Aucune réservation aujourd&apos;hui.</p>
            ) : (
              <div className="-mx-2">
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
            <Link
              href="/dashboard/reservations"
              className="mt-7 inline-flex text-sm font-semibold text-zg-teal transition hover:text-zg-fg hover:underline"
            >
              Voir toutes les réservations →
            </Link>
          </CardContent>
        </Card>

        <div className="space-y-6 lg:col-span-5">
          <section aria-labelledby="dashboard-stats-heading">
            <div className="mb-3">
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
              <CardDescription>Réservations à venir (confirmées ou en attente).</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingReservations.length === 0 ? (
                <p className="py-10 text-center text-sm text-zg-fg/48">Rien de prévu pour l&apos;instant.</p>
              ) : (
                <div className="-mx-2">
                  {upcomingReservations.slice(0, 8).map((reservation) => (
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Raccourcis</CardTitle>
              <CardDescription>Accédez vite aux sections clés du dashboard.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Link href="/dashboard/reservations" className="inline-flex">
                <Button type="button" variant="secondary" className="w-full justify-between">
                  <span className="inline-flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-zg-teal/70" strokeWidth={2} />
                    Réservations
                  </span>
                  <span className="text-zg-fg/45">→</span>
                </Button>
              </Link>
              <Link href="/dashboard/floor-plan" className="inline-flex">
                <Button type="button" variant="secondary" className="w-full justify-between">
                  <span className="inline-flex items-center gap-2">
                    <LayoutGrid className="h-4 w-4 text-zg-teal/70" strokeWidth={2} />
                    Plan de salle
                  </span>
                  <span className="text-zg-fg/45">→</span>
                </Button>
              </Link>
              <Link href="/dashboard/settings" className="inline-flex">
                <Button type="button" variant="secondary" className="w-full justify-between">
                  <span className="inline-flex items-center gap-2">
                    <Settings className="h-4 w-4 text-zg-teal/70" strokeWidth={2} />
                    Paramètres
                  </span>
                  <span className="text-zg-fg/45">→</span>
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardContent>
  );
}
