"use client";

import { useEffect, useRef } from "react";
import { Ban, Mail, QrCode, X } from "lucide-react";
import GiftCardStatusBadge from "@/src/components/dashboard/gift-cards/gift-card-status-badge";
import GiftCardTypeBadge from "@/src/components/dashboard/gift-cards/gift-card-type-badge";
import { formatChf } from "@/src/components/dashboard/gift-cards/mock-data";
import type { GiftCardRecord } from "@/src/components/dashboard/gift-cards/types";
import { useDialogFocusTrap } from "@/src/components/dashboard/reservations/hooks/use-dialog-focus-trap";
import DashboardPortal from "@/src/components/dashboard/ui/dashboard-portal";
import Button from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";

type GiftCardDetailDrawerProps = {
  card: GiftCardRecord | null;
  onClose: () => void;
  onAction: (label: string) => void;
};

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <p className="text-sm text-zg-text-muted">{label}</p>
      <p className="text-right text-sm font-medium text-zg-fg">{value}</p>
    </div>
  );
}

export default function GiftCardDetailDrawer({ card, onClose, onAction }: GiftCardDetailDrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const open = card != null;

  useDialogFocusTrap(open, panelRef);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!card) return null;

  const latestBalance =
    card.usageHistory.length > 0
      ? card.usageHistory[card.usageHistory.length - 1]!.remainingBalanceChf
      : card.balanceChf;

  return (
    <DashboardPortal>
      <div
        className="fixed inset-0 z-50 flex justify-end bg-black/40 max-md:items-end max-md:justify-center"
        role="presentation"
        onClick={onClose}
      >
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="gift-card-detail-title"
          className={cn(
            "flex w-full max-w-md flex-col border-zg-border bg-zg-surface shadow-xl",
            "h-full border-l max-md:max-h-[min(92dvh,720px)] max-md:rounded-t-2xl max-md:border-l-0 max-md:border-t",
          )}
          onClick={(event) => event.stopPropagation()}
        >
          <header className="flex items-start justify-between gap-3 border-b border-zg-border px-5 py-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 id="gift-card-detail-title" className="text-lg font-semibold text-zg-fg">
                  {card.code}
                </h2>
                <GiftCardTypeBadge type={card.type} />
                <GiftCardStatusBadge status={card.status} />
              </div>
              <p className="mt-1 text-sm text-zg-text-muted">Détail du bon cadeau</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-zg-text-muted transition-colors hover:bg-zg-card-hover hover:text-zg-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zg-accent/25"
              aria-label="Fermer"
            >
              <X className="h-5 w-5" strokeWidth={2} />
            </button>
          </header>

          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5">
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zg-text-muted">Informations</h3>
              <div className="mt-1 divide-y divide-zg-border/80">
                <DetailRow label="Numéro du bon" value={card.code} />
                <DetailRow label="Acheteur" value={card.buyerName} />
                <DetailRow label="Destinataire" value={card.recipientName ?? "Non renseigné"} />
                <DetailRow label="Type" value={card.type === "digital" ? "Digital" : "Papier"} />
                <DetailRow label="Montant initial" value={formatChf(card.amountChf)} />
                <DetailRow label="Solde restant" value={formatChf(card.balanceChf)} />
                <DetailRow label="Date d'achat" value={card.purchasedLabel} />
                <DetailRow label="Date d'expiration" value={card.expiresLabel} />
              </div>
            </section>

            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zg-text-muted">Code / QR</h3>
              <div className="mt-3 flex items-center gap-4 rounded-2xl border border-dashed border-zg-border bg-zg-surface-elevated/50 p-4">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-zg-border bg-zg-surface">
                  <QrCode className="h-10 w-10 text-zg-text-muted" strokeWidth={1.5} aria-hidden />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-zg-fg">{card.qrPlaceholder}</p>
                  <p className="mt-1 text-xs text-zg-text-muted">
                    Aperçu du QR — la génération réelle arrivera plus tard.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zg-text-muted">
                Historique d&apos;utilisation
              </h3>
              {card.usageHistory.length === 0 ? (
                <p className="mt-3 text-sm text-zg-text-muted">Aucune utilisation enregistrée.</p>
              ) : (
                <ul className="mt-3 space-y-3">
                  {card.usageHistory.map((event) => (
                    <li
                      key={event.id}
                      className="rounded-xl border border-zg-border bg-zg-surface-elevated/40 px-4 py-3"
                    >
                      <p className="text-sm font-medium text-zg-fg">{event.dateLabel}</p>
                      <p className="mt-0.5 text-sm text-zg-text-muted">
                        {formatChf(event.amountUsedChf)} utilisés
                      </p>
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-3 text-sm font-medium text-zg-fg">
                Solde restant : {formatChf(latestBalance)}
              </p>
            </section>
          </div>

          <footer className="flex flex-col gap-2 border-t border-zg-border px-5 py-4 sm:flex-row sm:flex-wrap">
            <Button type="button" variant="secondary" size="sm" className="w-full sm:w-auto" onClick={() => onAction("Renvoyer le bon")}>
              <Mail className="h-4 w-4" strokeWidth={2} aria-hidden />
              Renvoyer le bon
            </Button>
            <Button type="button" variant="secondary" size="sm" className="w-full sm:w-auto" onClick={() => onAction("Marquer comme utilisé")}>
              Marquer comme utilisé
            </Button>
            <Button type="button" variant="ghost" size="sm" className="w-full sm:w-auto" onClick={() => onAction("Désactiver")}>
              <Ban className="h-4 w-4" strokeWidth={2} aria-hidden />
              Désactiver
            </Button>
          </footer>
        </div>
      </div>
    </DashboardPortal>
  );
}
