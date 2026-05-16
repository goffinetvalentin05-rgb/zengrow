"use client";

import CampaignDetailSection from "@/src/components/dashboard/marketing/detail/campaign-detail-section";
import type { CampaignDetailStats } from "@/src/components/dashboard/marketing/utils/campaign-detail-stats";
import { cn } from "@/src/lib/utils";

function StatBlock({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-xl border border-zg-border bg-zg-surface-elevated/60 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-zg-text-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-zg-fg">{value}</p>
      {hint ? <p className="mt-1 text-xs text-zg-text-muted">{hint}</p> : null}
    </div>
  );
}

function RateBar({
  label,
  percent,
  tone = "accent",
  unavailableLabel,
}: {
  label: string;
  percent: number | null;
  tone?: "accent" | "warning" | "danger";
  unavailableLabel?: string;
}) {
  const barClass =
    tone === "danger" ? "bg-zg-danger" : tone === "warning" ? "bg-zg-warning" : "bg-zg-accent";

  if (percent == null && unavailableLabel) {
    return (
      <div>
        <div className="flex items-center justify-between gap-2 text-sm">
          <span className="font-medium text-zg-fg">{label}</span>
          <span className="text-zg-text-muted">{unavailableLabel}</span>
        </div>
      </div>
    );
  }

  const safePercent = percent ?? 0;
  const display =
    percent != null
      ? `${percent.toLocaleString("fr-CH", { minimumFractionDigits: 0, maximumFractionDigits: 1 })} %`
      : "—";

  return (
    <div>
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="font-medium text-zg-fg">{label}</span>
        <span className="tabular-nums text-zg-text-secondary">{display}</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-zg-border/80">
        <div
          className={cn("h-full rounded-full transition-all duration-300", barClass)}
          style={{ width: `${Math.min(100, Math.max(0, safePercent))}%` }}
          role="progressbar"
          aria-valuenow={safePercent}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}

export default function CampaignDetailStatsPanel({ stats }: { stats: CampaignDetailStats }) {
  const openTone =
    stats.openRatePercent != null && stats.openRatePercent >= 30
      ? "accent"
      : stats.openRatePercent != null && stats.openRatePercent >= 20
        ? "warning"
        : "danger";

  return (
    <CampaignDetailSection title="Statistiques détaillées">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatBlock label="Envoyés" value={stats.sent} />
        <StatBlock label="Délivrés" value={stats.delivered} hint="Estimation (envoi confirmé)" />
        <StatBlock
          label="Bounces"
          value={stats.bounces ?? "—"}
          hint={stats.bounces == null ? "Tracking à activer" : undefined}
        />
        <StatBlock
          label="Spam"
          value={stats.spam ?? "—"}
          hint={stats.spam == null ? "Via Resend (V2)" : undefined}
        />
      </div>

      <div className="space-y-4 rounded-xl border border-zg-border bg-zg-surface-soft/50 p-4">
        <RateBar label="Taux d'ouverture" percent={stats.openRatePercent} tone={openTone} />
        <RateBar
          label="Taux de clic"
          percent={stats.clickRatePercent}
          unavailableLabel="Activer le tracking"
        />
        <StatBlock label="Désabonnements" value={stats.unsubscribes ?? "—"} hint="Bientôt disponible" />
      </div>
    </CampaignDetailSection>
  );
}
