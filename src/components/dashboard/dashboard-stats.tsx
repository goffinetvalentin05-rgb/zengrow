import { Calendar, CalendarDays, Clock, Users } from "lucide-react";
import StatCard, { StatCardSkeleton } from "@/src/components/dashboard/stat-card";
import {
  calendarYmdInBusinessTz,
  isoWeekBoundsInBusinessTz,
  reservationIsAtOrAfterNow,
} from "@/src/lib/date/business-calendar";
import { getLunchDinnerMinuteWindowsForYmd, sumExpectedCoversByService } from "@/src/lib/restaurant/service-windows";
import { createClient } from "@/src/lib/supabase/server";
import type { OpeningHours } from "@/src/lib/utils";

const EMPTY = "—";

const TODAY_COUNT_STATUSES = ["pending", "confirmed", "completed"] as const;
const COUVERTS_STATUSES = ["pending", "confirmed"] as const;
const WEEK_COUNT_STATUSES = ["pending", "confirmed", "completed", "no-show"] as const;
const NEXT_STATUSES = ["pending", "confirmed"] as const;

function formatTimeLabel(reservationTime: string): string {
  const t = reservationTime.trim();
  return t.length >= 5 ? t.slice(0, 5) : t;
}

export function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {Array.from({ length: 5 }, (_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
  );
}

type Kpi = {
  label: string;
  value: string | number;
  icon: typeof Calendar;
  accent: "primary" | "amber" | "stone";
};

export async function DashboardStats({ restaurantId }: { restaurantId: string }) {
  const supabase = await createClient();
  const now = new Date();
  const today = calendarYmdInBusinessTz(now);
  const { start: weekStart, end: weekEnd } = isoWeekBoundsInBusinessTz(now);

  const [
    { data: todayForCount, error: errTodayCount },
    { data: todayForCovers, error: errCovers },
    { data: settingsRow },
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
      .select("guests, reservation_time")
      .eq("restaurant_id", restaurantId)
      .eq("reservation_date", today)
      .in("status", [...COUVERTS_STATUSES]),
    supabase.from("restaurant_settings").select("opening_hours").eq("restaurant_id", restaurantId).maybeSingle(),
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

  const openingHours = (settingsRow?.opening_hours as OpeningHours | null | undefined) ?? null;
  const { lunch: lunchWindow, dinner: dinnerWindow } = getLunchDinnerMinuteWindowsForYmd(today, openingHours);

  const { expectedLunchCovers, expectedDinnerCovers } =
    errCovers || todayForCovers == null
      ? { expectedLunchCovers: null as number | null, expectedDinnerCovers: null as number | null }
      : sumExpectedCoversByService({
          rows: todayForCovers,
          lunch: lunchWindow,
          dinner: dinnerWindow,
        });

  let nextLine: string | null = null;
  if (!errNext && nextCandidates?.length) {
    const next = nextCandidates.find((r) => reservationIsAtOrAfterNow(r.reservation_date, r.reservation_time, now));
    if (next) {
      const name = (next.guest_name ?? "").trim() || EMPTY;
      const time = formatTimeLabel(next.reservation_time);
      nextLine = `${name} · ${time}`;
    }
  }

  const reservationsWeek = errWeek ? null : (weekCount ?? 0);

  const kpis: Kpi[] = [
    {
      label: "Réservations aujourd'hui",
      value: reservationsToday === null ? EMPTY : reservationsToday,
      icon: Calendar,
      accent: "primary",
    },
  ];

  if (lunchWindow) {
    kpis.push({
      label: "Couverts attendus ce midi",
      value: expectedLunchCovers === null ? EMPTY : expectedLunchCovers,
      icon: Users,
      accent: "amber",
    });
  }

  if (dinnerWindow) {
    kpis.push({
      label: "Couverts attendus ce soir",
      value: expectedDinnerCovers === null ? EMPTY : expectedDinnerCovers,
      icon: Users,
      accent: "amber",
    });
  }

  kpis.push(
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
  );

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {kpis.map((kpi) => (
        <StatCard key={kpi.label} label={kpi.label} value={kpi.value} icon={kpi.icon} accent={kpi.accent} />
      ))}
    </div>
  );
}
