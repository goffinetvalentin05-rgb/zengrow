import { Calendar, CalendarDays, Clock, Users } from "lucide-react";
import StatCard, { StatCardSkeleton } from "@/src/components/dashboard/stat-card";
import { isoWeekUtcBounds } from "@/src/lib/date/iso-week";
import { createClient } from "@/src/lib/supabase/server";

const EMPTY = "—";

const TODAY_COUNT_STATUSES = ["pending", "confirmed", "completed"] as const;
const COUVERTS_STATUSES = ["pending", "confirmed"] as const;
const WEEK_COUNT_STATUSES = ["pending", "confirmed", "completed", "no-show"] as const;
const NEXT_STATUSES = ["pending", "confirmed"] as const;

function reservationStartsAtMs(reservationDate: string, reservationTime: string): number {
  const hm = reservationTime.trim().slice(0, 5);
  return Date.parse(`${reservationDate}T${hm}:00.000Z`);
}

function formatTimeLabel(reservationTime: string): string {
  const t = reservationTime.trim();
  return t.length >= 5 ? t.slice(0, 5) : t;
}

export function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }, (_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
  );
}

export async function DashboardStats({ restaurantId }: { restaurantId: string }) {
  const supabase = await createClient();
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const { start: weekStart, end: weekEnd } = isoWeekUtcBounds(now);
  const nowMs = now.getTime();

  const [
    { data: todayForCount, error: errTodayCount },
    { data: todayForCovers, error: errCovers },
    { data: nextCandidates, error: errNext },
    { count: weekCount, error: errWeek },
  ] = await Promise.all([
    supabase
      .from("reservations")
      .select("id")
      .eq("restaurant_id", restaurantId)
      .eq("reservation_date", today)
      .in("status", [...TODAY_COUNT_STATUSES]),
    supabase
      .from("reservations")
      .select("guests")
      .eq("restaurant_id", restaurantId)
      .eq("reservation_date", today)
      .in("status", [...COUVERTS_STATUSES]),
    supabase
      .from("reservations")
      .select("guest_name, reservation_time, reservation_date")
      .eq("restaurant_id", restaurantId)
      .in("status", [...NEXT_STATUSES])
      .gte("reservation_date", today)
      .order("reservation_date", { ascending: true })
      .order("reservation_time", { ascending: true })
      .limit(80),
    supabase
      .from("reservations")
      .select("id", { count: "exact", head: true })
      .eq("restaurant_id", restaurantId)
      .gte("reservation_date", weekStart)
      .lte("reservation_date", weekEnd)
      .in("status", [...WEEK_COUNT_STATUSES]),
  ]);

  const reservationsToday =
    errTodayCount || todayForCount == null ? null : todayForCount.length;
  const couvertsSoir =
    errCovers || todayForCovers == null
      ? null
      : todayForCovers.reduce((sum, row) => sum + (row.guests ?? 0), 0);

  let nextLine: string | null = null;
  if (!errNext && nextCandidates?.length) {
    const next = nextCandidates.find(
      (r) => reservationStartsAtMs(r.reservation_date, r.reservation_time) >= nowMs,
    );
    if (next) {
      const name = (next.guest_name ?? "").trim() || EMPTY;
      const time = formatTimeLabel(next.reservation_time);
      nextLine = `${name} · ${time}`;
    }
  }

  const reservationsWeek = errWeek ? null : (weekCount ?? 0);

  const kpis: {
    label: string;
    value: string | number;
    icon: typeof Calendar;
    accent: "primary" | "amber" | "stone";
  }[] = [
    {
      label: "Réservations aujourd'hui",
      value: reservationsToday === null ? EMPTY : reservationsToday,
      icon: Calendar,
      accent: "primary",
    },
    {
      label: "Couverts attendus ce soir",
      value: couvertsSoir === null ? EMPTY : couvertsSoir,
      icon: Users,
      accent: "amber",
    },
    {
      label: "Prochaine réservation",
      value: errNext ? EMPTY : (nextLine ?? EMPTY),
      icon: Clock,
      accent: "stone",
    },
    {
      label: "Réservations cette semaine",
      value: reservationsWeek === null ? EMPTY : reservationsWeek,
      icon: CalendarDays,
      accent: "primary",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => (
        <StatCard key={kpi.label} label={kpi.label} value={kpi.value} icon={kpi.icon} accent={kpi.accent} />
      ))}
    </div>
  );
}
