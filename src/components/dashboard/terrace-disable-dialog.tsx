"use client";

import Button from "@/src/components/ui/button";

export type TerraceDisableDisposition = "keep" | "move_interior" | "cancel";

type TerraceDisableDialogProps = {
  open: boolean;
  reservationCount: number;
  terraceLabel: string;
  saving: boolean;
  onClose: () => void;
  onConfirm: (disposition: TerraceDisableDisposition) => void;
};

export default function TerraceDisableDialog({
  open,
  reservationCount,
  terraceLabel,
  saving,
  onClose,
  onConfirm,
}: TerraceDisableDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="presentation"
      onClick={() => !saving && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="terrace-disable-title"
        className="w-full max-w-lg rounded-2xl border border-zg-border bg-zg-surface p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="terrace-disable-title" className="text-lg font-semibold text-zg-fg">
          Désactiver la {terraceLabel.toLowerCase()} ?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-zg-muted">
          Vous avez{" "}
          <strong className="font-semibold text-zg-fg">
            {reservationCount} réservation{reservationCount > 1 ? "s" : ""} en {terraceLabel.toLowerCase()}
          </strong>{" "}
          aujourd&apos;hui. Que souhaitez-vous faire ?
        </p>
        <ul className="mt-4 space-y-2 text-sm text-zg-muted">
          <li>
            <strong className="text-zg-fg">Conserver</strong> — les réservations restent en {terraceLabel.toLowerCase()}.
          </li>
          <li>
            <strong className="text-zg-fg">Déplacer en salle</strong> — zone passée en intérieur.
          </li>
          <li>
            <strong className="text-zg-fg">Annuler</strong> — les réservations sont annulées.
          </li>
        </ul>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
          <Button type="button" variant="secondary" className="min-h-11" disabled={saving} onClick={onClose}>
            Retour
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="min-h-11"
            disabled={saving}
            onClick={() => onConfirm("keep")}
          >
            Conserver telles quelles
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="min-h-11"
            disabled={saving}
            onClick={() => onConfirm("move_interior")}
          >
            Déplacer en salle
          </Button>
          <Button
            type="button"
            variant="danger"
            className="min-h-11"
            disabled={saving}
            onClick={() => onConfirm("cancel")}
          >
            Annuler les réservations
          </Button>
        </div>
      </div>
    </div>
  );
}
