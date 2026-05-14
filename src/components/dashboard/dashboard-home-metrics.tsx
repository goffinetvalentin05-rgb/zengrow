import {
  Calendar,
  Moon,
  Star,
  Sun,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { parseISO } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import StatCard, { StatCardHighlight, StatCardSkeleton } from "@/src/components/dashboard/stat-card";
import DashboardHomeChart, { type DashboardChartDay } from "@/src/components/dashboard/dashboard-home-chart";
import {
  businessCalendarTimeZone,
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
const CHART_RESERVATION_STATUSES = ["pending", "confirmed", "completed", "no-show"] as const;
const MONTH_COUNT_STATUSES = CHART_RESERVATION_STATUSES;

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

function buildDailySeries(
  ymds: string[],
  resv: { reservation_date: string; guests: number | null; status: string }[],
  customersTimestamps: string[],
): DashboardChartDay[] {
  const tz = businessCalendarTimeZone();
  const statusOk = new Set<string>([...CHART_RESERVATION_STATUSES]);
  const map = new Map<string, { r: number; c: number; nc: number }>();
  for (const d of ymds) map.set(d, { r: 0, c: 0, nc: 0 });
  for (const row of resv) {
    if (!statusOk.has(row.status)) continue;
    const e = map.get(row.reservation_date);
    if (!e) continue;
    e.r += 1;
    e.c += row.guests ?? 0;
  }
  for (const iso of customersTimestamps) {
    try {
      const ymd = formatInTimeZone(parseISO(iso), tz, "yyyy-MM-dd");
      const e = map.get(ymd);
      if (e) e.nc += 1;
    } catch {
      /* ignore invalid */
    }
  }
  return ymds.map((ymd) => {
    const b = map.get(ymd)!;
    const [, m, d] = ymd.split("-");
    return { ymd, label: `${d}/${m}`, reservations: b.r, covers: b.c, newClients: b.nc };
  });
}

export function DashboardHomeMetricsSkeleton() {
  return (
    <div className="space-y-6">
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
      <div className="h-[360px] animate-pulse rounded-2xl bg-zg-surface" />
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
  const ymds90 = lastNYmdDaysInBusinessTz(90);
  const chartStartYmd = ymds90[0]!;
  const chartStartIso = startOfBusinessYmdAsUtcIso(chartStartYmd);
  const yesterday = ymds90[ymds90.length - 2] ?? today;

  const [
    { data: todayForCount, error: errTodayCount },
    { data: todayForCovers, error: errCovers },
    { data: settingsRow },
    { count: monthReservationsCount, error: errMonth },
    { data: resv90 },
    { data: customers90 },
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
      .select("reservation_date, guests, status")
      .eq("restaurant_id", restaurantId)
      .gte("reservation_date", chartStartYmd)
      .lte("reservation_date", today),
    supabase
      .from("customers")
      .select("created_at")
      .eq("restaurant_id", restaurantId)
      .gte("created_at", chartStartIso),
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

  const customerTimestamps = (customers90 ?? []).map((c) => c.created_at as string);
  const chartSeries = buildDailySeries(ymds90, resv90 ?? [], customerTimestamps);

  const topDays = [...chartSeries]
    .slice(-30)
    .filter((d) => d.reservations > 0 || d.covers > 0)
    .sort((a, b) => b.reservations - a.reservations)
    .slice(0, 3);

  return (
    <div className="space-y-6">
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

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-9">
          <DashboardHomeChart series={chartSeries} />
        </div>
        <aside className="col-span-12 flex flex-col gap-4 lg:col-span-3">
          <div className="rounded-2xl border border-zg-border bg-zg-surface p-5 transition-all duration-200 ease-out">
            <h3 className="text-sm font-semibold text-zg-fg">Performances</h3>
            <p className="mt-1 text-xs text-zg-text-muted">Jours les plus chargés (30 derniers jours).</p>
            <ul className="mt-4 space-y-3">
              {topDays.length === 0 ? (
                <li className="text-xs text-zg-text-muted">Pas assez de données pour un top 3.</li>
              ) : (
                topDays.map((d, i) => (
                  <li key={d.ymd} className="flex items-center justify-between gap-2 text-sm">
                    <span className="text-zg-text-muted">
                      {i + 1}. {d.label}
                    </span>
                    <span className="shrink-0 font-semibold tabular-nums text-zg-fg">{d.reservations}</span>
                  </li>
                ))
              )}
            </ul>
          </div>
          <div className="rounded-2xl border border-zg-border bg-zg-surface p-5 transition-all duration-200 ease-out">
            <h3 className="text-sm font-semibold text-zg-fg">Ressources</h3>
            <p className="mt-1 text-xs text-zg-text-muted">Aller plus loin avec ZenGrow.</p>
            <ul className="mt-4 space-y-2 text-sm font-medium">
              <li>
                <Link href="/dashboard/settings" className="text-zg-accent transition-colors hover:text-zg-accent-hover">
                  Paramètres du restaurant →
                </Link>
              </li>
              <li>
                <a
                  href="https://zengrow.ch"
                  target="_blank"
                  rel="noreferrer"
                  className="text-zg-text-secondary transition-colors hover:text-zg-fg"
                >
                  Site ZenGrow →
                </a>
              </li>
              <li>
                <Link
                  href="/dashboard/marketing"
                  className="text-zg-text-secondary transition-colors hover:text-zg-fg"
                >
                  Lancer une campagne →
                </Link>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
