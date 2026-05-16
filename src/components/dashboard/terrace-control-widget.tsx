"use client";

import { useCallback, useState } from "react";
import { Trees } from "lucide-react";
import Toggle from "@/src/components/ui/toggle";
import TerraceDisableDialog, {
  type TerraceDisableDisposition,
} from "@/src/components/dashboard/terrace-disable-dialog";
import { useDashboardToast } from "@/src/components/dashboard/dashboard-toast-provider";
import { normalizeTerraceLabel } from "@/src/lib/reservation/terrace-settings";
import { cn } from "@/src/lib/utils";

type TerraceControlWidgetProps = {
  initialEnabled: boolean;
  terraceCapacity: number;
  terraceLabel: string;
  terraceOccupiedCovers: number;
  interiorOccupiedCovers: number;
  interiorCapacity: number;
  className?: string;
};

export default function TerraceControlWidget({
  initialEnabled,
  terraceCapacity,
  terraceLabel,
  terraceOccupiedCovers,
  interiorOccupiedCovers,
  interiorCapacity,
  className,
}: TerraceControlWidgetProps) {
  const showToast = useDashboardToast();
  const [enabled, setEnabled] = useState(initialEnabled);
  const [saving, setSaving] = useState(false);
  const [disableDialogOpen, setDisableDialogOpen] = useState(false);
  const [pendingDisableCount, setPendingDisableCount] = useState(0);

  const label = normalizeTerraceLabel(terraceLabel);

  const patchTerraceEnabled = useCallback(
    async (next: boolean, disposition?: TerraceDisableDisposition) => {
      const res = await fetch("/api/restaurant-settings/terrace-enabled", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          terrace_enabled: next,
          ...(disposition ? { disposition } : {}),
        }),
      });

      const payload = (await res.json().catch(() => null)) as {
        error?: string;
        requiresDisposition?: boolean;
        reservationCount?: number;
      } | null;

      if (res.status === 409 && payload?.requiresDisposition) {
        return { needsDisposition: true as const, count: payload.reservationCount ?? 0 };
      }

      if (!res.ok) {
        throw new Error(payload?.error ?? "Impossible de mettre à jour la terrasse.");
      }

      return { needsDisposition: false as const };
    },
    [],
  );

  const handleToggle = useCallback(
    async (next: boolean) => {
      if (next) {
        const previous = enabled;
        setEnabled(true);
        setSaving(true);
        try {
          await patchTerraceEnabled(true);
          showToast({ message: "Terrasse activée" });
        } catch (err) {
          setEnabled(previous);
          showToast({
            message: err instanceof Error ? err.message : "Erreur lors de la mise à jour.",
          });
        } finally {
          setSaving(false);
        }
        return;
      }

      setSaving(true);
      try {
        const result = await patchTerraceEnabled(false);
        if (result.needsDisposition) {
          setPendingDisableCount(result.count);
          setDisableDialogOpen(true);
          return;
        }
        setEnabled(false);
        showToast({
          message: "Terrasse désactivée — les nouvelles réservations seront en salle uniquement",
        });
      } catch (err) {
        showToast({
          message: err instanceof Error ? err.message : "Erreur lors de la mise à jour.",
        });
      } finally {
        setSaving(false);
      }
    },
    [enabled, patchTerraceEnabled, showToast],
  );

  const handleDisableConfirm = useCallback(
    async (disposition: TerraceDisableDisposition) => {
      setSaving(true);
      try {
        await patchTerraceEnabled(false, disposition);
        setEnabled(false);
        setDisableDialogOpen(false);
        showToast({
          message: "Terrasse désactivée — les nouvelles réservations seront en salle uniquement",
        });
      } catch (err) {
        showToast({
          message: err instanceof Error ? err.message : "Erreur lors de la mise à jour.",
        });
      } finally {
        setSaving(false);
      }
    },
    [patchTerraceEnabled, showToast],
  );

  const liveCounters = (
    <p className="mt-1 text-xs tabular-nums text-zg-text-muted">
      Salle : {interiorOccupiedCovers}/{interiorCapacity} couverts
      <span className="mx-1.5 text-zg-border">·</span>
      {enabled ? (
        <>
          {label} : {terraceOccupiedCovers}/{terraceCapacity} couverts
        </>
      ) : (
        <span>{label} : désactivée</span>
      )}
    </p>
  );

  return (
    <>
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
              <p className="mt-0.5 text-sm tabular-nums text-zg-muted">
                {enabled
                  ? `${terraceOccupiedCovers}/${terraceCapacity} couverts occupés maintenant`
                  : terraceOccupiedCovers > 0
                    ? `Désactivée · ${terraceOccupiedCovers}/${terraceCapacity} couverts aujourd\u2019hui`
                    : "Désactivée"}
              </p>
              {liveCounters}
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

      <TerraceDisableDialog
        open={disableDialogOpen}
        reservationCount={pendingDisableCount}
        terraceLabel={label}
        saving={saving}
        onClose={() => setDisableDialogOpen(false)}
        onConfirm={handleDisableConfirm}
      />
    </>
  );
}
