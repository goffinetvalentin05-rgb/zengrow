"use client";

import { useMemo, useState } from "react";
import FilterBar from "@/src/components/dashboard/ui/filter-bar";
import Button from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import EmptyState from "@/src/components/ui/empty-state";
import Input from "@/src/components/ui/input";
import Select from "@/src/components/ui/select";
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
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return customers.filter((c) => {
      if (!matchesVisitCount(c.totalVisits, visitFilter)) return false;
      if (!matchesInactive(c.lastVisit, c.totalVisits, inactiveFilter)) return false;
      if (!matchesAvgCovers(c.avgCovers, avgFilter)) return false;
      if (q) {
        const hay = `${c.name} ${c.email ?? ""} ${c.phone ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [customers, visitFilter, inactiveFilter, avgFilter, query]);

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle>Liste des clients</CardTitle>
          <CardDescription>Historique, segmentation et export (plan Pro).</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <FilterBar
          right={
            <Button type="button" variant="secondary" size="sm" onClick={() => downloadCsv(filtered)}>
              Exporter CSV
            </Button>
          }
        >
          <div className="min-w-[240px] flex-1">
            <label className="dashboard-field-label">Recherche</label>
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Nom, email, téléphone…"
            />
          </div>
          <div className="w-[210px]">
            <label className="dashboard-field-label">Visites</label>
            <Select value={visitFilter} onChange={(e) => setVisitFilter(e.target.value as VisitFilter)}>
              <option value="all">Tous</option>
              <option value="gt3">Plus de 3 visites</option>
              <option value="gt5">Plus de 5 visites</option>
            </Select>
          </div>
          <div className="w-[220px]">
            <label className="dashboard-field-label">Inactifs</label>
            <Select value={inactiveFilter} onChange={(e) => setInactiveFilter(e.target.value as InactiveFilter)}>
              <option value="all">Tous</option>
              <option value="gt30">≥ 30 jours</option>
              <option value="gt60">≥ 60 jours</option>
              <option value="gt90">≥ 90 jours</option>
            </Select>
          </div>
          <div className="w-[210px]">
            <label className="dashboard-field-label">Couverts moyens</label>
            <Select value={avgFilter} onChange={(e) => setAvgFilter(e.target.value as AvgCoversFilter)}>
              <option value="all">Tous</option>
              <option value="gte2">≥ 2</option>
              <option value="gte3">≥ 3</option>
              <option value="gte4">≥ 4</option>
            </Select>
          </div>
        </FilterBar>

        {filtered.length === 0 ? (
          customers.length === 0 ? (
            <EmptyState title="Aucun client" description="Les fiches apparaîtront après des réservations." />
          ) : (
            <EmptyState title="Aucun client" description="Aucun client ne correspond à ces filtres." />
          )
        ) : (
          <div className="overflow-hidden rounded-2xl border border-zg-border-strong/85 bg-zg-surface/92 shadow-zg-soft backdrop-blur-sm">
            <div className="grid grid-cols-[minmax(180px,1.3fr)_minmax(160px,1fr)_minmax(140px,0.9fr)_90px_110px_90px] gap-3 border-b border-zg-border/80 bg-zg-surface-elevated/65 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-zg-fg/55">
              <div>Client</div>
              <div>Email</div>
              <div>Téléphone</div>
              <div className="text-right">Visites</div>
              <div className="text-right">Dernière</div>
              <div className="text-right">Couv.</div>
            </div>
            <div className="divide-y divide-zg-border/75">
              {filtered.map((c) => (
                <div
                  key={c.id}
                  className="grid grid-cols-[minmax(180px,1.3fr)_minmax(160px,1fr)_minmax(140px,0.9fr)_90px_110px_90px] items-center gap-3 px-4 py-3 text-sm hover:bg-zg-highlight/35"
                >
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-zg-fg">{c.name}</div>
                    <div className="mt-0.5 text-xs text-zg-fg/52">{c.reservations} réservation{c.reservations > 1 ? "s" : ""}</div>
                  </div>
                  <div className="min-w-0 truncate text-zg-fg/62">{c.email || "—"}</div>
                  <div className="min-w-0 truncate text-zg-fg/62">{c.phone || "—"}</div>
                  <div className="text-right tabular-nums text-zg-fg/72">{c.totalVisits}</div>
                  <div className="text-right tabular-nums text-zg-fg/62">{c.lastVisit ? c.lastVisit.slice(0, 10) : "—"}</div>
                  <div className="text-right tabular-nums text-zg-fg/62">{c.avgCovers != null ? c.avgCovers.toFixed(1) : "—"}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
