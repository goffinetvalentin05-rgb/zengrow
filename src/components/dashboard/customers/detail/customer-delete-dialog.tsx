"use client";

import DashboardPortal from "@/src/components/dashboard/ui/dashboard-portal";
import Button from "@/src/components/ui/button";

type CustomerDeleteDialogProps = {
  customerName: string;
  open: boolean;
  saving: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function CustomerDeleteDialog({
  customerName,
  open,
  saving,
  onClose,
  onConfirm,
}: CustomerDeleteDialogProps) {
  if (!open) return null;

  return (
    <DashboardPortal>
      <div
        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4"
        role="presentation"
        onClick={() => !saving && onClose()}
      >
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="customer-delete-title"
          aria-describedby="customer-delete-desc"
          className="w-full max-w-md rounded-2xl border border-zg-border bg-zg-surface p-6 shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 id="customer-delete-title" className="text-lg font-semibold text-zg-fg">
            Supprimer ce client ?
          </h2>
          <p id="customer-delete-desc" className="mt-2 text-sm leading-relaxed text-zg-text-muted">
            <span className="font-medium text-zg-fg">{customerName}</span> sera retiré de votre base.
            Son historique de réservations associé sera également supprimé — cette action est
            irréversible.
          </p>
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="ghost" disabled={saving} onClick={onClose}>
              Annuler
            </Button>
            <Button type="button" variant="danger" disabled={saving} onClick={onConfirm}>
              {saving ? "Suppression…" : "Supprimer définitivement"}
            </Button>
          </div>
        </div>
      </div>
    </DashboardPortal>
  );
}
