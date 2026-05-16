"use client";

import { useCallback, useState } from "react";
import { Trees } from "lucide-react";
import Toggle from "@/src/components/ui/toggle";
import { useDashboardToast } from "@/src/components/dashboard/dashboard-toast-provider";
import { normalizeTerraceLabel } from "@/src/lib/reservation/terrace-settings";
import { cn } from "@/src/lib/utils";

type TerraceControlWidgetProps = {
  initialEnabled: boolean;
  terraceCapacity: number;
  terraceLabel: string;
  initialOccupiedCovers: number;
  className?: string;
};

export default function TerraceControlWidget({
  initialEnabled,
  terraceCapacity,
  terraceLabel,
  initialOccupiedCovers,
  className,
}: TerraceControlWidgetProps) {
  const showToast = useDashboardToast();
  const [enabled, setEnabled] = useState(initialEnabled);
  const [occupiedCovers] = useState(initialOccupiedCovers);
  const [saving, setSaving] = useState(false);

  const label = normalizeTerraceLabel(terraceLabel);

  const handleToggle = useCallback(
    async (next: boolean) => {
      const previous = enabled;
      setEnabled(next);
      setSaving(true);

      try {
        const res = await fetch("/api/restaurant-settings/terrace-enabled", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ terrace_enabled: next }),
        });

        if (!res.ok) {
          const payload = (await res.json().catch(() => null)) as { error?: string } | null;
          throw new Error(payload?.error ?? "Impossible de mettre à jour la terrasse.");
        }

        showToast({
          message: next
            ? "Terrasse activée"
            : "Terrasse désactivée — les nouvelles réservations seront en salle uniquement",
        });
      } catch (err) {
        setEnabled(previous);
        showToast({
          message: err instanceof Error ? err.message : "Erreur lors de la mise à jour.",
        });
      } finally {
        setSaving(false);
      }
    },
    [enabled, showToast],
  );

  const counterText = enabled
    ? `${occupiedCovers}/${terraceCapacity} couverts occupés`
    : occupiedCovers > 0
      ? `Désactivée · ${occupiedCovers}/${terraceCapacity} couverts aujourd\u2019hui`
      : "Désactivée";

  return (
    <section
      className={cn(
        "rounded-2xl border border-zg-border bg-zg-surface p-4 shadow-sm sm:p-5",
        !enabled && "border-zg-border/80 bg-zg-surface/80",
        className,
      )}
      aria-label={`Contrôle ${label}`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
              enabled ? "bg-zg-success-soft-bg text-zg-success" : "bg-zg-neutral-badge-bg text-zg-text-muted",
            )}
            aria-hidden
          >
            <Trees className="h-5 w-5" strokeWidth={2} />
          </span>
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-zg-fg">{label}</h2>
            <p className="mt-0.5 text-sm tabular-nums text-zg-muted">{counterText}</p>
            <p className="mt-1 text-xs text-zg-text-muted">Désactivez en cas de pluie</p>
          </div>
        </div>
        <Toggle
          checked={enabled}
          onChange={handleToggle}
          disabled={saving}
          label={enabled ? "Activée" : "Désactivée"}
        />
      </div>
    </section>
  );
}
