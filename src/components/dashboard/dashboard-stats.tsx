import { Calendar, CalendarDays, Moon, Sun } from "lucide-react";
import StatCard, { StatCardSkeleton } from "@/src/components/dashboard/stat-card";
import {
  calendarYmdInBusinessTz,
  isoWeekBoundsInBusinessTz,
} from "@/src/lib/date/business-calendar";
import { getLunchDinnerMinuteWindowsForYmd, sumExpectedCoversByService } from "@/src/lib/restaurant/service-windows";
import { createClient } from "@/src/lib/supabase/server";
import type { OpeningHours } from "@/src/lib/utils";

const EMPTY = "—";

const TODAY_COUNT_STATUSES = ["pending", "confirmed", "completed"] as const;
const COUVERTS_STATUSES = ["pending", "confirmed"] as const;
const WEEK_COUNT_STATUSES = ["pending", "confirmed", "completed", "no-show"] as const;

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
  const today = calendarYmdInBusinessTz(now);
  const { start: weekStart, end: weekEnd } = isoWeekBoundsInBusinessTz(now);

  const [
    { data: todayForCount, error: errTodayCount },
    { data: todayForCovers, error: errCovers },
    { data: settingsRow },
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
      .select("id", { count: "exact", head: true })
      .eq("restaurant_id", restaurantId)
      .gte("reservation_date", weekStart)
      .lte("reservation_date", weekEnd)
      .in("status", [...WEEK_COUNT_STATUSES]),
  ]);

  const reservationsToday = errTodayCount || todayForCount == null ? null : todayForCount.length;

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

  const reservationsWeek = errWeek ? null : (weekCount ?? 0);

  const lunchValue =
    !lunchWindow ? EMPTY : expectedLunchCovers === null ? EMPTY : expectedLunchCovers;
  const dinnerValue =
    !dinnerWindow ? EMPTY : expectedDinnerCovers === null ? EMPTY : expectedDinnerCovers;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Réservations aujourd'hui"
        value={reservationsToday === null ? EMPTY : reservationsToday}
        icon={Calendar}
      />
      <StatCard label="Couverts attendus ce midi" value={lunchValue} icon={Sun} />
      <StatCard label="Couverts attendus ce soir" value={dinnerValue} icon={Moon} />
      <StatCard
        label="Réservations cette semaine"
        value={reservationsWeek === null ? EMPTY : reservationsWeek}
        icon={CalendarDays}
      />
    </div>
  );
}
