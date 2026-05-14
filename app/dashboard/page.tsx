import { headers } from "next/headers";
import Link from "next/link";
import { Suspense } from "react";
import { Calendar, Copy, ExternalLink, Plus } from "lucide-react";
import ReservationListRow from "@/src/components/dashboard/reservation-list-row";
import { DashboardStats, DashboardStatsSkeleton } from "@/src/components/dashboard/dashboard-stats";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import EmptyState from "@/src/components/ui/empty-state";
import { calendarYmdInBusinessTz, reservationIsAtOrAfterNow } from "@/src/lib/date/business-calendar";
import { requireRestaurant } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";
import PageHeader from "@/src/components/dashboard/page-header";
import DashboardContent from "@/src/components/dashboard/ui/dashboard-content";
import Button from "@/src/components/ui/button";

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
        title="Tableau de bord"
        subtitle="Vue d'ensemble de votre activité"
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
            icon: <Copy className="h-4 w-4" strokeWidth={2} />,
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

      <section aria-labelledby="dashboard-stats-heading" className="space-y-3">
        <div>
          <h2 id="dashboard-stats-heading" className="dashboard-section-heading">
            En chiffres
          </h2>
          <p className="dashboard-section-subtitle mt-1">Vue synthétique de votre journée.</p>
        </div>
        <Suspense fallback={<DashboardStatsSkeleton />}>
          <DashboardStats restaurantId={restaurant.id} />
        </Suspense>
      </section>

      <div className="grid gap-6 lg:grid-cols-2 lg:items-stretch">
        <Card className="flex h-full min-h-0 flex-col">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>Service d&apos;aujourd&apos;hui</CardTitle>
              <CardDescription>Réservations du jour, par heure.</CardDescription>
            </div>
            {fullFromSlot ? (
              <div className="shrink-0 rounded-full border border-amber-200/90 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-950">
                Complet dès {fullFromSlot}
              </div>
            ) : null}
          </CardHeader>
          <CardContent className="flex flex-1 flex-col">
            {timelineReservations.length === 0 ? (
              <EmptyState
                className="flex-1 py-12"
                icon={Calendar}
                title="Journée tranquille"
                description="Aucune réservation aujourd'hui — profite du calme avant l'orage 🍽️"
                action={
                  <Link href="/dashboard/reservations?new=1" className="inline-flex w-full max-w-xs">
                    <Button type="button" variant="secondary" className="w-full">
                      Nouvelle réservation
                    </Button>
                  </Link>
                }
              />
            ) : (
              <div className="-mx-2 flex-1">
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
              className="mt-6 inline-flex text-sm font-medium text-zg-accent transition-all duration-150 hover:text-zg-accent-hover"
            >
              Voir toutes les réservations →
            </Link>
          </CardContent>
        </Card>

        <Card className="flex h-full min-h-0 flex-col">
          <CardHeader>
            <CardTitle>Prochaines tables</CardTitle>
            <CardDescription>Réservations à venir.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col">
            {upcomingReservations.length === 0 ? (
              <EmptyState
                className="flex-1 py-12"
                icon={Calendar}
                title="Rien à l’horizon"
                description="Pas de réservation à venir pour l’instant — ton planning se remplira bientôt."
              />
            ) : (
              <div className="-mx-2 flex-1">
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
      </div>
    </DashboardContent>
  );
}
