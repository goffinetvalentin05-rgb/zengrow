"use client";

import { useMemo, useState } from "react";
import { BarChart3, ChevronDown } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/src/lib/utils";
import { buttonClassName } from "@/src/components/ui/button";
import EmptyState from "@/src/components/ui/empty-state";

export type DashboardChartDay = {
  ymd: string;
  label: string;
  reservations: number;
  covers: number;
  newClients: number;
};

type Period = 7 | 30 | 90;

const PERIODS: { id: Period; label: string }[] = [
  { id: 7, label: "7 jours" },
  { id: 30, label: "30 jours" },
  { id: 90, label: "90 jours" },
];

function hasAnyData(rows: DashboardChartDay[]) {
  return rows.some((r) => r.reservations > 0 || r.covers > 0 || r.newClients > 0);
}

export default function DashboardHomeChart({ series }: { series: DashboardChartDay[] }) {
  const [period, setPeriod] = useState<Period>(30);
  const [menuOpen, setMenuOpen] = useState(false);

  const data = useMemo(() => series.slice(-period), [series, period]);
  const empty = !hasAnyData(data);

  return (
    <div className="rounded-2xl border border-zg-border bg-zg-surface p-6 transition-all duration-200 ease-out">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-zg-fg">Évolution des réservations</h2>
          <p className="mt-1 text-sm text-zg-text-muted">Réservations, couverts et nouveaux clients.</p>
        </div>
        <div className="relative shrink-0">
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

      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-medium text-zg-text-muted">
        <span className="inline-flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-zg-accent" aria-hidden />
          Réservations
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-zg-premium" aria-hidden />
          Couverts
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-zg-info" aria-hidden />
          Nouveaux clients
        </span>
      </div>

      <div className="mt-6 min-w-0 overflow-x-auto md:overflow-x-visible">
        {empty ? (
          <div className="h-[320px] w-full min-w-0">
            <EmptyState
              className="h-full py-8"
              icon={BarChart3}
              title="Pas encore de données"
              description="Tes premières réservations apparaîtront ici. Partage ton lien showroom pour remplir ce graphique."
            />
          </div>
        ) : (
          <div className="h-[320px] w-full min-w-[540px] md:min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barGap={4} barCategoryGap="18%">
                <CartesianGrid strokeDasharray="3 6" stroke="var(--zg-border)" vertical={false} opacity={0.85} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "#6B6258", fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: "#2A1F17" }}
                />
                <YAxis
                  tick={{ fill: "#6B6258", fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: "#2A1F17" }}
                  allowDecimals={false}
                  width={36}
                />
                <Tooltip
                  cursor={{ fill: "rgba(255,255,255,0.04)" }}
                  contentStyle={{
                    background: "#1C1612",
                    border: "1px solid rgba(232, 93, 44, 0.25)",
                    borderRadius: "12px",
                    fontSize: "12px",
                    color: "#FAF7F2",
                  }}
                  labelStyle={{ color: "#B5ABA0", marginBottom: 4 }}
                />
                <Bar dataKey="reservations" name="Réservations" fill="#E85D2C" radius={[6, 6, 0, 0]} maxBarSize={28} />
                <Bar dataKey="covers" name="Couverts" fill="#A855F7" radius={[6, 6, 0, 0]} maxBarSize={28} />
                <Bar dataKey="newClients" name="Nouveaux clients" fill="#3B82F6" radius={[6, 6, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
