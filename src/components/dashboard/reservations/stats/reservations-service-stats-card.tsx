"use client";

import type { ServiceSlotStats } from "@/src/components/dashboard/reservations/utils/reservation-slot-stats";
import { cn } from "@/src/lib/utils";
import type { LucideIcon } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, Tooltip } from "recharts";

type ReservationsServiceStatsCardProps = {
  stats: ServiceSlotStats;
  icon: LucideIcon;
  iconToneClass: string;
};

export default function ReservationsServiceStatsCard({
  stats,
  icon: Icon,
  iconToneClass,
}: ReservationsServiceStatsCardProps) {
  const chartData = stats.buckets.map((b) => ({
    label: b.label,
    covers: b.covers,
  }));

  const hasChartData = chartData.some((d) => d.covers > 0);
  const maxBucketCovers = Math.max(1, ...chartData.map((d) => d.covers));

  return (
    <article
      className={cn(
        "flex min-h-[200px] flex-col rounded-2xl border border-zg-border bg-zg-surface p-5 transition-all duration-200",
        !stats.active && "opacity-70",
      )}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full",
              iconToneClass,
            )}
          >
            <Icon className="h-[18px] w-[18px]" strokeWidth={1.85} aria-hidden />
          </span>
          <h3 className="text-sm font-semibold text-zg-fg">{stats.title}</h3>
        </div>
        {!stats.active ? (
          <span className="text-xs font-medium text-zg-text-muted">Fermé</span>
        ) : null}
      </header>

      {!stats.active ? (
        <p className="mt-4 text-sm text-zg-text-muted">Pas de service ce jour.</p>
      ) : (
        <>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-zg-text-muted">Couverts</p>
              <p className="mt-1 text-lg font-semibold tabular-nums text-zg-fg">
                {stats.covers}
                <span className="text-sm font-normal text-zg-text-muted">/{stats.maxCovers}</span>
                <span className="ml-1.5 text-sm font-medium text-zg-accent">({stats.fillPercent}%)</span>
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-zg-text-muted">Groupes</p>
              <p className="mt-1 text-lg font-semibold tabular-nums text-zg-fg">{stats.groupCount}</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-zg-text-muted">
            Pic d&apos;affluence :{" "}
            <span className="font-semibold text-zg-fg">{stats.peakLabel}</span>
          </p>
          <div className="mt-4 h-[72px] w-full min-w-0">
            {hasChartData ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                  <Tooltip
                    cursor={{ fill: "rgba(255,255,255,0.04)" }}
                    contentStyle={{
                      background: "#1C1612",
                      border: "1px solid rgba(124, 92, 255, 0.3)",
                      borderRadius: "8px",
                      fontSize: "11px",
                      color: "#FAF7F2",
                    }}
                    formatter={(value) => [`${value ?? 0} couverts`, "Affluence"]}
                    labelFormatter={(label) => String(label)}
                  />
                  <Bar
                    dataKey="covers"
                    fill="#E85D2C"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={14}
                    isAnimationActive={false}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-end gap-1">
                {chartData.map((slot) => (
                  <div
                    key={slot.label}
                    className="flex-1 rounded-t bg-zg-border/60"
                    style={{
                      height: `${Math.max(12, Math.round((slot.covers / maxBucketCovers) * 100))}%`,
                    }}
                    title={`${slot.label} · ${slot.covers} couverts`}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </article>
  );
}
