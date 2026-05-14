import Link from "next/link";
import { headers } from "next/headers";
import { Suspense } from "react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { parseISO } from "date-fns";
import { Calendar, Copy, ExternalLink, Plus, Sparkles } from "lucide-react";
import ReservationListRow from "@/src/components/dashboard/reservation-list-row";
import {
  DashboardHomeMetrics,
  DashboardHomeMetricsSkeleton,
} from "@/src/components/dashboard/dashboard-home-metrics";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import EmptyState from "@/src/components/ui/empty-state";
import { calendarYmdInBusinessTz } from "@/src/lib/date/business-calendar";
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

  const [{ data: todayReservations }, { data: settings }, { data: activityRows }] = await Promise.all([
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
      .select("id, guest_name, created_at, status, reservation_date, guests")
      .eq("restaurant_id", restaurant.id)
      .order("created_at", { ascending: false })
      .limit(12),
  ]);

  const restaurantCapacity = settings?.restaurant_capacity ?? 40;
  const showZoneOnDashboard = settings?.terrace_enabled === true;
  const timelineReservations = [...(todayReservations ?? [])].sort((a, b) =>
    a.reservation_time.localeCompare(b.reservation_time),
  );
  const activeTodayReservations = timelineReservations.filter((r) =>
    ["pending", "confirmed"].includes(r.status),
  );
  const now = new Date();
  const slotCapacityMap = new Map<string, number>();
  for (const reservation of activeTodayReservations) {
    const current = slotCapacityMap.get(reservation.reservation_time) ?? 0;
    slotCapacityMap.set(reservation.reservation_time, current + (reservation.guests ?? 0));
  }
  const fullFromSlot =
    [...slotCapacityMap.entries()]
      .filter(([, guests]) => guests >= restaurantCapacity)
      .sort((a, b) => a[0].localeCompare(b[0]))[0]?.[0] ?? null;

  const activityItems = activityRows ?? [];

  return (
    <DashboardContent>
      <PageHeader
        title="Vue d'ensemble"
        subtitle="Suivi de l'activité de ton restaurant"
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

      <section aria-labelledby="dashboard-stats-heading" className="mt-2 space-y-4">
        <div className="sr-only">
          <h2 id="dashboard-stats-heading">Statistiques</h2>
        </div>
        <Suspense fallback={<DashboardHomeMetricsSkeleton />}>
          <DashboardHomeMetrics restaurantId={restaurant.id} restaurantCapacity={restaurantCapacity} />
        </Suspense>
      </section>

      <div className="mt-8 grid gap-4 lg:grid-cols-2 lg:items-stretch">
        <Card className="flex h-full min-h-0 flex-col">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>Service d&apos;aujourd&apos;hui</CardTitle>
              <CardDescription>Réservations par heure de passage.</CardDescription>
            </div>
            {fullFromSlot ? (
              <div className="shrink-0 rounded-full border border-zg-warning/35 bg-zg-warning-soft-bg px-3 py-1 text-xs font-medium text-zg-warning">
                Complet dès {fullFromSlot}
              </div>
            ) : null}
          </CardHeader>
          <CardContent className="flex flex-1 flex-col">
            {timelineReservations.length === 0 ? (
              <EmptyState
                className="flex-1 py-12"
                icon={Calendar}
                title="Journée tranquille 🌙"
                description="Aucune réservation prévue aujourd'hui. Profite du calme."
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
              className="mt-6 inline-flex text-sm font-semibold text-zg-accent transition-colors duration-200 ease-out hover:text-zg-accent-hover"
            >
              Voir tout →
            </Link>
          </CardContent>
        </Card>

        <Card className="flex h-full min-h-0 flex-col">
          <CardHeader>
            <CardTitle>Activité récente</CardTitle>
            <CardDescription>Dernières réservations enregistrées.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col">
            {activityItems.length === 0 ? (
              <EmptyState
                className="flex-1 py-12"
                icon={Sparkles}
                title="Tout est calme"
                description="Active la première fonction pour démarrer — ta page publique et tes créneaux attirent les premières résas."
                action={
                  <Link href="/dashboard/settings" className="inline-flex w-full max-w-xs">
                    <Button type="button" variant="secondary" className="w-full">
                      Paramètres
                    </Button>
                  </Link>
                }
              />
            ) : (
              <ul className="divide-y divide-zg-border">
                {activityItems.map((row) => {
                  const created = row.created_at
                    ? formatDistanceToNow(parseISO(row.created_at as string), { addSuffix: true, locale: fr })
                    : "";
                  const statusLabel =
                    row.status === "confirmed"
                      ? "Confirmée"
                      : row.status === "pending"
                        ? "En attente"
                        : row.status === "completed"
                          ? "Terminée"
                          : row.status === "cancelled"
                            ? "Annulée"
                            : row.status === "refused"
                              ? "Refusée"
                              : row.status === "no-show"
                                ? "Absent"
                                : String(row.status);
                  return (
                    <li key={row.id} className="flex gap-3 py-3 first:pt-0">
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-zg-accent" aria-hidden />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-zg-fg">
                          Réservation · {row.guest_name ?? "Client"}
                        </p>
                        <p className="mt-0.5 text-xs text-zg-text-muted">
                          {statusLabel} · {row.guests ?? 0} couvert{(row.guests ?? 0) > 1 ? "s" : ""} ·{" "}
                          {row.reservation_date} {created ? `· ${created}` : ""}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
            <Link
              href="/dashboard/reservations"
              className="mt-4 inline-flex text-sm font-semibold text-zg-accent transition-colors duration-200 ease-out hover:text-zg-accent-hover"
            >
              Voir les réservations →
            </Link>
          </CardContent>
        </Card>
      </div>
    </DashboardContent>
  );
}
