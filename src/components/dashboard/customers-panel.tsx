"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import EmptyState from "@/src/components/ui/empty-state";
import { cn } from "@/src/lib/utils";

export type CustomerRow = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  reservations: number;
  lastVisit: string | null;
  totalVisits: number;
  avgCovers: number | null;
};

type VisitFilter = "all" | "gt3" | "gt5";
type InactiveFilter = "all" | "gt30" | "gt60" | "gt90";
type AvgCoversFilter = "all" | "gte2" | "gte3" | "gte4";

function escapeCsvCell(value: string) {
  if (value.includes(";") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function downloadCsv(rows: CustomerRow[]) {
  const header = ["Nom", "Email", "Téléphone", "Nombre de visites", "Dernière visite", "Couverts moyen"];
  const lines = rows.map((c) => {
    const last =
      c.lastVisit != null && c.lastVisit.length >= 10 ? c.lastVisit.slice(0, 10) : c.lastVisit ?? "";
    const avg =
      c.avgCovers != null
        ? String(c.avgCovers).replace(".", ",")
        : "";
    return [
      escapeCsvCell(c.name),
      escapeCsvCell(c.email ?? ""),
      escapeCsvCell(c.phone ?? ""),
      String(c.totalVisits),
      escapeCsvCell(last),
      escapeCsvCell(avg),
    ].join(";");
  });
  const csv = "\uFEFF" + [header.join(";"), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `clients-zengrow-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function pillClass(active: boolean) {
  return cn(
    "rounded-full border px-3 py-1.5 text-xs font-medium transition",
    active
      ? "border-zg-teal bg-gradient-to-r from-zg-teal to-zg-mint text-white shadow-[0_8px_24px_-12px_rgba(31,122,108,0.72)]"
      : "border-zg-border-strong bg-zg-surface/95 text-zg-fg/72 hover:border-zg-mint/35 hover:bg-zg-highlight/50",
  );
}

function matchesInactive(lastVisit: string | null, totalVisits: number, filter: InactiveFilter): boolean {
  if (filter === "all") return true;
  if (totalVisits === 0) return false;
  const days = filter === "gt30" ? 30 : filter === "gt60" ? 60 : 90;
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  if (!lastVisit) return true;
  return new Date(lastVisit).getTime() <= cutoff;
}

function matchesVisitCount(totalVisits: number, filter: VisitFilter): boolean {
  if (filter === "all") return true;
  if (filter === "gt3") return totalVisits > 3;
  return totalVisits > 5;
}

function matchesAvgCovers(avg: number | null, filter: AvgCoversFilter): boolean {
  if (filter === "all") return true;
  if (avg == null) return false;
  const min = filter === "gte2" ? 2 : filter === "gte3" ? 3 : 4;
  return avg >= min;
}

type CustomersPanelProps = {
  customers: CustomerRow[];
};

export default function CustomersPanel({ customers }: CustomersPanelProps) {
  const [visitFilter, setVisitFilter] = useState<VisitFilter>("all");
  const [inactiveFilter, setInactiveFilter] = useState<InactiveFilter>("all");
  const [avgFilter, setAvgFilter] = useState<AvgCoversFilter>("all");

  const filtered = useMemo(() => {
    return customers.filter((c) => {
      if (!matchesVisitCount(c.totalVisits, visitFilter)) return false;
      if (!matchesInactive(c.lastVisit, c.totalVisits, inactiveFilter)) return false;
      if (!matchesAvgCovers(c.avgCovers, avgFilter)) return false;
      return true;
    });
  }, [customers, visitFilter, inactiveFilter, avgFilter]);

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle>Liste des clients</CardTitle>
          <CardDescription>Historique, segmentation et export (plan Pro).</CardDescription>
        </div>
        <button
          type="button"
          onClick={() => downloadCsv(filtered)}
          className="inline-flex min-h-[40px] shrink-0 items-center justify-center rounded-xl border border-zg-border-strong bg-zg-surface/95 px-4 py-2 text-sm font-semibold text-zg-fg shadow-zg-soft transition hover:bg-zg-highlight/55"
        >
          Exporter
        </button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col gap-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zg-fg/52">Nombre de visites</p>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["all", "Tous"],
                  ["gt3", "Plus de 3 visites"],
                  ["gt5", "Plus de 5 visites"],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  className={pillClass(visitFilter === key)}
                  onClick={() => setVisitFilter(key)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zg-fg/52">Dernière visite</p>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["all", "Tous"],
                  ["gt30", "Pas venu depuis 30 jours"],
                  ["gt60", "Pas venu depuis 60 jours"],
                  ["gt90", "Pas venu depuis 90 jours"],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  className={pillClass(inactiveFilter === key)}
                  onClick={() => setInactiveFilter(key)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zg-fg/52">Couverts moyens</p>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["all", "Tous"],
                  ["gte2", "≥ 2 couverts"],
                  ["gte3", "≥ 3 couverts"],
                  ["gte4", "≥ 4 couverts"],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  className={pillClass(avgFilter === key)}
                  onClick={() => setAvgFilter(key)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          customers.length === 0 ? (
            <EmptyState title="Aucun client" description="Les fiches apparaîtront après des réservations." />
          ) : (
            <EmptyState title="Aucun client" description="Aucun client ne correspond à ces filtres." />
          )
        ) : (
          <div className="overflow-x-auto rounded-xl border border-zg-border/85">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-zg-border/80 bg-zg-surface-elevated/92 text-left">
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-zg-fg/52">Nom</th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-zg-fg/52">Email</th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-zg-fg/52">Téléphone</th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-zg-fg/52">Résa.</th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-zg-fg/52">Dernière visite</th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-zg-fg/52">Visites</th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-zg-fg/52">Couverts moy.</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((customer) => (
                  <tr
                    key={customer.id}
                    className="border-b border-zg-border/75 bg-zg-surface/96 last:border-0 hover:bg-zg-highlight/40"
                  >
                    <td className="px-5 py-3.5 font-semibold text-zg-fg">{customer.name}</td>
                    <td className="px-5 py-3.5 text-zg-fg/62">{customer.email || "—"}</td>
                    <td className="px-5 py-3.5 text-zg-fg/62">{customer.phone || "—"}</td>
                    <td className="px-5 py-3.5 tabular-nums text-zg-fg/62">{customer.reservations}</td>
                    <td className="px-5 py-3.5 tabular-nums text-zg-fg/62">
                      {customer.lastVisit ? customer.lastVisit.slice(0, 10) : "—"}
                    </td>
                    <td className="px-5 py-3.5 tabular-nums text-zg-fg/62">{customer.totalVisits}</td>
                    <td className="px-5 py-3.5 tabular-nums text-zg-fg/62">
                      {customer.avgCovers != null ? customer.avgCovers.toFixed(1) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
