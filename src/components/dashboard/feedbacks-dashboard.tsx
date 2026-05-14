"use client";

import { useMemo, useState } from "react";
import { Star } from "lucide-react";
import EmptyState from "@/src/components/ui/empty-state";
import Input from "@/src/components/ui/input";
import Select from "@/src/components/ui/select";
import { cn } from "@/src/lib/utils";

export type FeedbackDashboardRow = {
  id: string;
  created_at: string;
  customer_name: string | null;
  customer_email: string | null;
  rating: number;
  message: string | null;
};

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("fr-CH", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function Stars({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${value} sur 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={16}
          strokeWidth={2}
          className={cn(i < value ? "fill-amber-400 text-amber-400" : "text-zg-border")}
        />
      ))}
    </div>
  );
}

type Period = "all" | "7d" | "30d" | "90d";

export default function FeedbacksDashboard({ initialRows }: { initialRows: FeedbackDashboardRow[] }) {
  const [period, setPeriod] = useState<Period>("all");
  const [minRating, setMinRating] = useState<string>("1");
  const [maxRating, setMaxRating] = useState<string>("5");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const min = Math.min(5, Math.max(1, Number(minRating) || 1));
    const max = Math.min(5, Math.max(1, Number(maxRating) || 5));
    const lo = Math.min(min, max);
    const hi = Math.max(min, max);
    const now = Date.now();
    let fromMs = 0;
    if (period === "7d") fromMs = now - 7 * 24 * 60 * 60 * 1000;
    if (period === "30d") fromMs = now - 30 * 24 * 60 * 60 * 1000;
    if (period === "90d") fromMs = now - 90 * 24 * 60 * 60 * 1000;
    const q = query.trim().toLowerCase();

    return initialRows.filter((row) => {
      if (period !== "all" && new Date(row.created_at).getTime() < fromMs) return false;
      if (row.rating < lo || row.rating > hi) return false;
      if (q) {
        const name = (row.customer_name ?? "").toLowerCase();
        const mail = (row.customer_email ?? "").toLowerCase();
        if (!name.includes(q) && !mail.includes(q)) return false;
      }
      return true;
    });
  }, [initialRows, period, minRating, maxRating, query]);

  const hasAny = initialRows.length > 0;
  const hasFiltered = filtered.length > 0;

  if (!hasAny) {
    return (
      <EmptyState
        icon={Star}
        title="Aucun retour client pour l’instant."
        description="Les premiers arriveront après la mise en place de l’automatisation (Paramètres → Avis Google)."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-zg-border bg-zg-surface-elevated p-4 md:flex-row md:flex-wrap md:items-end md:gap-6 md:p-5">
        <div className="min-w-[180px]">
          <label className="dashboard-field-label">Période</label>
          <Select className="mt-2" value={period} onChange={(e) => setPeriod(e.target.value as Period)}>
            <option value="all">Toutes</option>
            <option value="7d">7 derniers jours</option>
            <option value="30d">30 derniers jours</option>
            <option value="90d">90 derniers jours</option>
          </Select>
        </div>
        <div>
          <label className="dashboard-field-label">Note min.</label>
          <Select className="mt-2 w-28" value={minRating} onChange={(e) => setMinRating(e.target.value)}>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={String(n)}>
                {n}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <label className="dashboard-field-label">Note max.</label>
          <Select className="mt-2 w-28" value={maxRating} onChange={(e) => setMaxRating(e.target.value)}>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={String(n)}>
                {n}
              </option>
            ))}
          </Select>
        </div>
        <div className="min-w-[200px] flex-1 md:max-w-sm">
          <label className="dashboard-field-label">Client (nom ou e-mail)</label>
          <Input className="mt-2" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filtrer…" />
        </div>
      </div>

      {!hasFiltered ? (
        <p className="rounded-xl border border-dashed border-zg-border bg-zg-surface/60 px-4 py-6 text-center text-sm text-zg-muted">
          Aucun retour ne correspond à ces filtres.
        </p>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-2xl border border-zg-border md:block">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-zg-surface-elevated text-xs font-semibold uppercase tracking-wide text-zg-text-muted">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Note</th>
                  <th className="px-4 py-3">Commentaire privé</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.id} className="border-t border-zg-border/80 bg-zg-surface/40 hover:bg-zg-surface-soft/80">
                    <td className="whitespace-nowrap px-4 py-3 text-zg-text-secondary">{formatDate(row.created_at)}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-zg-fg">{row.customer_name?.trim() || "Client"}</p>
                      {row.customer_email ? <p className="text-xs text-zg-text-muted">{row.customer_email}</p> : null}
                    </td>
                    <td className="px-4 py-3">
                      <Stars value={row.rating} />
                    </td>
                    <td className="max-w-md px-4 py-3 text-zg-text-secondary">
                      <p className="line-clamp-4 whitespace-pre-wrap">{row.message?.trim() || "—"}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 md:hidden">
            {filtered.map((row) => (
              <div key={row.id} className="rounded-2xl border border-zg-border bg-zg-surface p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-zg-text-muted">{formatDate(row.created_at)}</p>
                    <p className="mt-1 font-semibold text-zg-fg">{row.customer_name?.trim() || "Client"}</p>
                    {row.customer_email ? <p className="text-xs text-zg-muted">{row.customer_email}</p> : null}
                  </div>
                  <Stars value={row.rating} />
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-zg-text-secondary">{row.message?.trim() || "—"}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
