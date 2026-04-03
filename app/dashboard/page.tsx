import { headers } from "next/headers";
import Link from "next/link";
import { Armchair, Calendar, LayoutDashboard, Star, Users } from "lucide-react";
import PublicLinkCard from "@/src/components/dashboard/public-link-card";
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
    { label: "Réservations aujourd'hui", value: reservationsTodayCount, icon: Calendar, accent: "primary" as const },
    { label: "Personnes attendues", value: peopleExpectedToday, icon: Users, accent: "amber" as const },
    { label: "Tables restantes", value: tablesRemainingToday, icon: Armchair, accent: "stone" as const },
    { label: "Avis Google reçus", value: reviewsReceived ?? 0, icon: Star, accent: "primary" as const },
  ];

  return (
    <section className="space-y-12">
      <div className="flex flex-wrap items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--primary-muted)] text-[var(--primary)]">
          <LayoutDashboard size={22} strokeWidth={1.75} />
        </span>
        <div>
          <p className="text-[13px] font-medium text-[var(--muted-foreground)]">Tableau de bord</p>
          <h1 className="dashboard-page-title mt-1">{restaurant.name}</h1>
          <p className="dashboard-section-subtitle mt-2 max-w-xl">
            Voici votre journée en un coup d&apos;œil — réservations, couverts et lien public.
          </p>
        </div>
      </div>

      <div>
        <div className="mb-8 flex flex-wrap items-start justify-between gap-5">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-[var(--foreground)]">Service d&apos;aujourd&apos;hui</h2>
            <p className="dashboard-section-subtitle mt-2 max-w-xl">
              Suivez les réservations prévues pour ce service, heure par heure.
            </p>
          </div>
          <Link
            href="/dashboard/reservations?new=1"
            className="inline-flex min-h-[44px] items-center rounded-lg bg-[var(--primary)] px-5 py-2.5 text-sm font-medium text-[var(--primary-foreground)] shadow-sm transition duration-200 hover:bg-[var(--primary-hover)] hover:shadow-[0_4px_14px_rgba(26,107,80,0.3)]"
          >
            Nouvelle réservation
          </Link>
        </div>

        {timelineReservations.length === 0 ? (
          <div className="rounded-[20px] border border-dashed border-[var(--border)] bg-[var(--surface-muted)]/60 px-6 py-14 text-center">
            <p className="text-[15px] font-medium text-[var(--foreground)]">Aucune réservation aujourd&apos;hui</p>
            <p className="mt-2 text-[13px] text-[var(--muted-foreground)]">
              Les prochains créneaux apparaîtront ici automatiquement.
            </p>
          </div>
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
      </div>

      {fullFromSlot ? (
        <div className="rounded-[20px] border border-amber-200/80 bg-[#fffbeb] px-5 py-4 text-[14px] font-medium text-amber-950 shadow-[var(--card-shadow)]">
          <span className="font-semibold">Complet</span> à partir de {fullFromSlot} — capacité maximale atteinte sur ce
          créneau.
        </div>
      ) : null}

      <div>
        <div className="mb-8">
          <h2 className="text-xl font-semibold tracking-tight text-[var(--foreground)]">Vue d&apos;ensemble</h2>
          <p className="dashboard-section-subtitle mt-2">Les chiffres clés de votre journée.</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map((kpi) => (
            <StatCard key={kpi.label} label={kpi.label} value={kpi.value} icon={kpi.icon} accent={kpi.accent} />
          ))}
        </div>
      </div>

      <div className="grid gap-12 xl:grid-cols-[1.55fr_1fr]">
        <section className="space-y-5 xl:border-r xl:border-[var(--border-soft)] xl:pr-12">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-[var(--foreground)]">Prochaines tables</h2>
            <p className="dashboard-section-subtitle mt-2">À servir dans l&apos;ordre d&apos;arrivée prévu.</p>
          </div>
          {activeTodayReservations.length === 0 ? (
            <div className="rounded-[20px] border border-dashed border-[var(--border)] bg-[var(--surface-muted)]/60 px-6 py-12 text-center">
              <p className="text-[15px] font-medium text-[var(--foreground)]">Rien à venir pour l&apos;instant</p>
              <p className="mt-2 text-[13px] text-[var(--muted-foreground)]">
                Les réservations confirmées ou en attente s&apos;affichent ici.
              </p>
            </div>
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
            className="inline-flex items-center gap-2 text-[14px] font-semibold text-[var(--primary)] transition hover:text-[var(--primary-hover)]"
          >
            Voir toutes les réservations
            <span aria-hidden>→</span>
          </Link>
        </section>

        <section>
          <PublicLinkCard link={publicLink} />
        </section>
      </div>
    </section>
  );
}
