"use client";

import { useMemo, useState } from "react";
import { ChevronDown, TrendingUp } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useFeedbacks } from "@/src/components/dashboard/feedbacks/context/use-feedbacks";
import {
  buildFeedbackTrendSeries,
  hasEnoughFeedbacksForTrend,
  type FeedbackTrendPeriod,
  trendSeriesHasPlottableAverage,
} from "@/src/components/dashboard/feedbacks/utils/feedback-trend";
import { buttonClassName } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";

const PERIODS: { id: FeedbackTrendPeriod; label: string }[] = [
  { id: 30, label: "30 jours" },
  { id: 90, label: "90 jours" },
  { id: 365, label: "1 an" },
];

const ACCENT_STROKE = "#E85D2C";

type ChartRow = {
  label: string;
  averageRating: number | null;
  count: number;
};

export default function FeedbacksTrendChart() {
  const { feedbacks } = useFeedbacks();
  const [period, setPeriod] = useState<FeedbackTrendPeriod>(30);
  const [menuOpen, setMenuOpen] = useState(false);

  const enoughData = hasEnoughFeedbacksForTrend(feedbacks.length);

  const { points, granularity } = useMemo(
    () => buildFeedbackTrendSeries(feedbacks, period),
    [feedbacks, period],
  );

  const chartData = useMemo<ChartRow[]>(
    () =>
      points.map((p) => ({
        label: p.label,
        averageRating: p.averageRating,
        count: p.count,
      })),
    [points],
  );

  const empty = !trendSeriesHasPlottableAverage(points);

  if (!enoughData) {
    return (
      <div
        className="flex min-h-[140px] flex-col items-center justify-center rounded-2xl border border-dashed border-zg-border bg-zg-surface/60 px-6 py-8 text-center"
        role="status"
      >
        <TrendingUp className="h-8 w-8 text-zg-text-muted" strokeWidth={1.75} aria-hidden />
        <p className="mt-3 text-sm leading-relaxed text-zg-text-muted">
          Pas encore assez de données pour afficher la tendance.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zg-border bg-zg-surface p-4 transition-all duration-200 ease-out sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div>
          <h2 className="text-sm font-semibold text-zg-fg">Tendance de satisfaction</h2>
          <p className="mt-0.5 text-xs text-zg-text-muted">
            Note moyenne par {granularity === "week" ? "semaine" : "jour"}
          </p>
        </div>
        <div className="relative shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className={buttonClassName({
              variant: "secondary",
              size: "sm",
              className: "min-w-[9.5rem] justify-between gap-2",
            })}
            aria-expanded={menuOpen}
            aria-haspopup="listbox"
          >
            {PERIODS.find((p) => p.id === period)?.label}
            <ChevronDown className={cn("h-4 w-4 transition-transform", menuOpen && "rotate-180")} aria-hidden />
          </button>
          {menuOpen ? (
            <>
              <button
                type="button"
                className="fixed inset-0 z-10 cursor-default bg-transparent"
                aria-label="Fermer"
                onClick={() => setMenuOpen(false)}
              />
              <ul
                role="listbox"
                className="absolute right-0 z-20 mt-1 min-w-[10rem] overflow-hidden rounded-xl border border-zg-border bg-zg-surface-elevated py-1 shadow-2xl shadow-black/30"
              >
                {PERIODS.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={period === p.id}
                      className={cn(
                        "flex w-full px-3 py-2 text-left text-sm font-medium transition-colors duration-200 ease-out",
                        period === p.id ? "bg-white/5 text-zg-accent" : "text-zg-fg hover:bg-zg-card-hover",
                      )}
                      onClick={() => {
                        setPeriod(p.id);
                        setMenuOpen(false);
                      }}
                    >
                      {p.label}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </div>
      </div>

      <div className="mt-4 min-w-0 overflow-x-auto">
        {empty ? (
          <div
            className="flex h-[140px] items-center justify-center text-center text-sm text-zg-text-muted"
            role="status"
          >
            Aucune note sur cette période.
          </div>
        ) : (
          <div className="h-[140px] w-full min-w-[280px] sm:min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 6" stroke="var(--zg-border)" vertical={false} opacity={0.6} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "#6B6258", fontSize: 10 }}
                  tickLine={false}
                  axisLine={{ stroke: "#2A1F17" }}
                  interval="preserveStartEnd"
                  minTickGap={24}
                />
                <YAxis
                  domain={[1, 5]}
                  ticks={[1, 2, 3, 4, 5]}
                  tick={{ fill: "#6B6258", fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  width={28}
                />
                <Tooltip
                  cursor={{ stroke: "rgba(124, 92, 255, 0.25)", strokeWidth: 1 }}
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    const row = payload[0]?.payload as ChartRow | undefined;
                    const avg = row?.averageRating;
                    const count = row?.count ?? 0;
                    return (
                      <div className="rounded-xl border border-zg-accent/25 bg-[#1C1612] px-3 py-2 text-xs shadow-lg">
                        <p className="font-medium text-zg-text-muted">{label}</p>
                        <p className="mt-1 text-zg-fg">
                          {avg != null ? `${avg.toLocaleString("fr-CH")} / 5` : "—"}
                          {count > 0 ? ` · ${count} avis` : ""}
                        </p>
                      </div>
                    );
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="averageRating"
                  stroke={ACCENT_STROKE}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: ACCENT_STROKE, stroke: "#1C1612", strokeWidth: 2 }}
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
