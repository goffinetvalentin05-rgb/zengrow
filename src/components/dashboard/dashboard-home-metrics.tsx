import { Calendar, Moon, Star, Sun, TrendingUp, Users } from "lucide-react";
import StatCard, { StatCardHighlight, StatCardSkeleton } from "@/src/components/dashboard/stat-card";
import {
  calendarYmdInBusinessTz,
  lastNYmdDaysInBusinessTz,
  monthBoundsInBusinessTz,
  startOfBusinessYmdAsUtcIso,
  endOfBusinessYmdAsUtcIso,
} from "@/src/lib/date/business-calendar";
import { getLunchDinnerMinuteWindowsForYmd, sumExpectedCoversByService } from "@/src/lib/restaurant/service-windows";
import { createClient } from "@/src/lib/supabase/server";
import type { OpeningHours } from "@/src/lib/utils";

const EMPTY = "—";
const TODAY_COUNT_STATUSES = ["pending", "confirmed", "completed"] as const;
const COUVERTS_STATUSES = ["pending", "confirmed"] as const;
const MONTH_COUNT_STATUSES = ["pending", "confirmed", "completed", "no-show"] as const;

function trendFromDelta(current: number, previous: number): { label: string; tone: "success" | "danger" | "muted" } {
  if (current === previous) return { label: "+0%", tone: "muted" };
  if (previous <= 0) {
    if (current <= 0) return { label: "—", tone: "muted" };
    return { label: "+100%", tone: "success" };
  }
  const raw = ((current - previous) / previous) * 100;
  const rounded = Math.round(raw);
  if (rounded > 0) return { label: `+${rounded}%`, tone: "success" };
  if (rounded < 0) return { label: `${rounded}%`, tone: "danger" };
  return { label: "+0%", tone: "muted" };
}

export function DashboardHomeMetricsSkeleton() {
  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-12 row-span-2 min-h-[240px] lg:col-span-4">
        <div className="h-full min-h-[220px] animate-pulse rounded-2xl bg-zg-surface" />
      </div>
      <div className="col-span-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-8 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export async function DashboardHomeMetrics({
  restaurantId,
  restaurantCapacity,
}: {
  restaurantId: string;
  restaurantCapacity: number;
}) {
  const supabase = await createClient();
  const now = new Date();
  const today = calendarYmdInBusinessTz(now);
  const month = monthBoundsInBusinessTz(now);
  const monthTitle = month.label.charAt(0).toUpperCase() + month.label.slice(1);
  const recentTwo = lastNYmdDaysInBusinessTz(2, now);
  const yesterday = recentTwo[0] ?? today;

  const [
    { data: todayForCount, error: errTodayCount },
    { data: todayForCovers, error: errCovers },
    { data: settingsRow },
    { count: monthReservationsCount, error: errMonth },
    { count: yesterdayCount, error: errYesterday },
    { count: newCustomersMonth, error: errNewCustomers },
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
      .gte("reservation_date", month.startYmd)
      .lte("reservation_date", month.endYmd)
      .in("status", [...MONTH_COUNT_STATUSES]),
    supabase
      .from("reservations")
      .select("id", { count: "exact", head: true })
      .eq("restaurant_id", restaurantId)
      .eq("reservation_date", yesterday)
      .in("status", [...TODAY_COUNT_STATUSES]),
    supabase
      .from("customers")
      .select("id", { count: "exact", head: true })
      .eq("restaurant_id", restaurantId)
      .gte("created_at", startOfBusinessYmdAsUtcIso(month.startYmd))
      .lte("created_at", endOfBusinessYmdAsUtcIso(month.endYmd)),
  ]);

  const reservationsToday = errTodayCount || todayForCount == null ? null : todayForCount.length;
  const reservationsThisMonth = errMonth || monthReservationsCount == null ? null : monthReservationsCount;
  const yesterdayReservations = errYesterday ? null : (yesterdayCount ?? 0);
  const newClientsMonthVal = errNewCustomers ? null : (newCustomersMonth ?? 0);

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

  const lunchValue =
    !lunchWindow ? EMPTY : expectedLunchCovers === null ? EMPTY : expectedLunchCovers;
  const dinnerValue =
    !dinnerWindow ? EMPTY : expectedDinnerCovers === null ? EMPTY : expectedDinnerCovers;

  const lunchNum = typeof lunchValue === "number" ? lunchValue : null;
  const dinnerNum = typeof dinnerValue === "number" ? dinnerValue : null;
  const denom = Math.max(1, restaurantCapacity * 2);
  const fillPct =
    lunchNum != null && dinnerNum != null
      ? Math.min(100, Math.round(((lunchNum + dinnerNum) / denom) * 100))
      : 0;

  const trendToday =
    reservationsToday != null && yesterdayReservations != null
      ? trendFromDelta(reservationsToday, yesterdayReservations)
      : { label: "—", tone: "muted" as const };

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-12 row-span-2 lg:col-span-4">
        <StatCardHighlight
          label="Réservations ce mois"
          value={reservationsThisMonth === null ? EMPTY : reservationsThisMonth}
          subInfo={monthTitle}
          variant="accent"
          className="h-full min-h-[240px]"
        />
      </div>
      <div className="col-span-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-8 lg:grid-cols-3">
        <StatCard
          label="Réservations aujourd'hui"
          value={reservationsToday === null ? EMPTY : reservationsToday}
          icon={Calendar}
          dataTone="accent"
          trend={trendToday.label}
          trendTone={trendToday.tone}
        />
        <StatCard
          label="Couverts midi"
          value={lunchValue}
          icon={Sun}
          dataTone="warning"
          trend="—"
          trendTone="muted"
        />
        <StatCard
          label="Couverts soir"
          value={dinnerValue}
          icon={Moon}
          dataTone="premium"
          trend="—"
          trendTone="muted"
        />
        <StatCard
          label="Nouveaux clients"
          value={newClientsMonthVal === null ? EMPTY : newClientsMonthVal}
          icon={Users}
          dataTone="info"
          trend="—"
          trendTone="muted"
        />
        <StatCard
          label="Note Google"
          value="—"
          icon={Star}
          dataTone="warning"
          trend="—"
          trendTone="muted"
        />
        <StatCard
          label="Taux de remplissage"
          value={`${fillPct}%`}
          icon={TrendingUp}
          dataTone="success"
          trend="—"
          trendTone="muted"
        />
      </div>
    </div>
  );
}
