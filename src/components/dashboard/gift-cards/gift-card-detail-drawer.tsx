"use client";

import { useEffect, useRef, useState } from "react";
import { Ban, Copy, Download, ExternalLink, Mail, RefreshCw, RotateCcw, ScanLine, X } from "lucide-react";
import GiftCardStatusBadge from "@/src/components/dashboard/gift-cards/gift-card-status-badge";
import GiftCardTypeBadge from "@/src/components/dashboard/gift-cards/gift-card-type-badge";
import GiftVoucherQr from "@/src/components/dashboard/gift-cards/gift-voucher-qr";
import type { GiftCardDrawerAction, GiftCardRecord } from "@/src/components/dashboard/gift-cards/types";
import { isExperienceGiftCard } from "@/src/components/dashboard/gift-cards/types";
import { useDashboardToast } from "@/src/components/dashboard/dashboard-toast-provider";
import { formatChf } from "@/src/lib/gift-vouchers/money";
import { giftVoucherPublicUrl } from "@/src/lib/gift-vouchers/public-token";
import { canRedeem } from "@/src/lib/gift-vouchers/redeem";
import { canDisable, canReactivate } from "@/src/lib/gift-vouchers/status";
import { useDialogFocusTrap } from "@/src/components/dashboard/reservations/hooks/use-dialog-focus-trap";
import DashboardPortal from "@/src/components/dashboard/ui/dashboard-portal";
import Button from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";

type GiftCardDetailDrawerProps = {
  card: GiftCardRecord | null;
  onClose: () => void;
  onAction: (action: GiftCardDrawerAction) => void;
  busyAction?: GiftCardDrawerAction | null;
};

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <p className="text-sm text-zg-text-muted">{label}</p>
      <p className="max-w-[60%] text-right text-sm font-medium break-words text-zg-fg">{value}</p>
    </div>
  );
}

export default function GiftCardDetailDrawer({
  card,
  onClose,
  onAction,
  busyAction = null,
}: GiftCardDetailDrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const showToast = useDashboardToast();
  const [confirmRotate, setConfirmRotate] = useState(false);
  const open = card != null;
  const busy = busyAction != null;
  const cardIdentity = card ? `${card.id}:${card.publicToken ?? ""}` : "";
  const [seenCardIdentity, setSeenCardIdentity] = useState(cardIdentity);
  if (seenCardIdentity !== cardIdentity) {
    setSeenCardIdentity(cardIdentity);
    setConfirmRotate(false);
  }

  useDialogFocusTrap(open, panelRef);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !busy) onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose, busy]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!card) return null;

  const canUse = canRedeem(card.status, Math.round(card.balanceChf * 100), card.expiresAt ?? null);
  const publicUrl = card.publicToken ? giftVoucherPublicUrl(card.publicToken) : "";

  async function copyPublicLink() {
    if (!publicUrl) return;
    try {
      await navigator.clipboard.writeText(publicUrl);
      showToast({ message: "Lien du bon copié." });
    } catch {
      showToast({ message: "Impossible de copier le lien." });
    }
  }

  return (
    <DashboardPortal>
      <div
        className="fixed inset-0 z-50 flex justify-end bg-black/40 max-md:items-end max-md:justify-center"
        role="presentation"
        onClick={() => {
          if (!busy) onClose();
        }}
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
              disabled={busy}
              className="rounded-lg p-2 text-zg-text-muted transition-colors hover:bg-zg-card-hover hover:text-zg-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zg-accent/25 disabled:opacity-50"
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
                <DetailRow label="Email" value={card.buyerEmail.trim() || "—"} />
                <DetailRow label="Destinataire" value={card.recipientName?.trim() || "Non renseigné"} />
                <DetailRow label="Type" value={card.type === "digital" ? "Digital" : "Papier"} />
                {card.offerTitle ? <DetailRow label="Offre" value={card.offerTitle} /> : null}
                {isExperienceGiftCard(card) ? (
                  <DetailRow label="Prestation" value={card.experienceLabel || card.offerTitle || "Expérience"} />
                ) : (
                  <>
                    <DetailRow label="Montant initial" value={formatChf(card.amountChf)} />
                    <DetailRow label="Solde restant" value={formatChf(card.balanceChf)} />
                  </>
                )}
                <DetailRow label="Date d'émission" value={card.purchasedLabel} />
                <DetailRow label="Date d'expiration" value={card.expiresLabel} />
                <DetailRow label="Message" value={card.message?.trim() || "—"} />
              </div>
            </section>

            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zg-text-muted">Code / QR</h3>
              <div className="mt-3 rounded-2xl border border-zg-border bg-zg-surface-elevated/50 p-4">
                {publicUrl ? (
                  <div className="flex flex-col items-center">
                    <GiftVoucherQr value={publicUrl} size={168} label={`QR du bon ${card.code}`} />
                    <p className="mt-3 font-mono text-sm font-semibold tracking-wide text-zg-fg">{card.code}</p>
                  </div>
                ) : (
                  <p className="text-sm text-zg-text-muted">Le QR sera disponible après mise à jour de la base.</p>
                )}
                <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <Button type="button" variant="secondary" size="sm" className="w-full" disabled={busy || !publicUrl} onClick={() => void copyPublicLink()}>
                    <Copy className="h-4 w-4" strokeWidth={2} aria-hidden />
                    Copier le lien
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    disabled={busy || !publicUrl}
                    onClick={() => window.open(publicUrl, "_blank", "noopener,noreferrer")}
                  >
                    <ExternalLink className="h-4 w-4" strokeWidth={2} aria-hidden />
                    Ouvrir le bon
                  </Button>
                </div>
                {confirmRotate ? (
                  <div className="mt-3 rounded-xl border border-zg-border bg-zg-surface px-3 py-3">
                    <p className="text-sm text-zg-fg">L’ancien QR et le lien actuel deviendront invalides.</p>
                    <div className="mt-3 flex gap-2">
                      <Button type="button" size="sm" className="flex-1" disabled={busy} onClick={() => onAction("rotate_qr")}>
                        Confirmer
                      </Button>
                      <Button type="button" variant="ghost" size="sm" className="flex-1" disabled={busy} onClick={() => setConfirmRotate(false)}>
                        Annuler
                      </Button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="mt-3 w-full text-center text-xs font-medium text-zg-text-muted hover:text-zg-fg disabled:opacity-50"
                    disabled={busy || !publicUrl}
                    onClick={() => setConfirmRotate(true)}
                  >
                    <RefreshCw className="mr-1 inline h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                    {busyAction === "rotate_qr" ? "Régénération…" : "Regénérer le QR"}
                  </button>
                )}
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
                      <p className="mt-0.5 text-sm text-zg-fg">{event.title ?? event.label ?? "Mouvement"}</p>
                      {event.amountLabel ? (
                        <p
                          className={cn(
                            "mt-0.5 text-sm font-semibold tabular-nums",
                            event.kind === "redemption" ? "text-zg-danger" : "text-emerald-700",
                          )}
                        >
                          {event.amountLabel}
                        </p>
                      ) : null}
                      <p className="mt-1 text-sm text-zg-text-muted">Solde : {formatChf(event.remainingBalanceChf)}</p>
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-3 text-sm font-medium text-zg-fg">
                Solde restant : {formatChf(card.balanceChf)}
              </p>
            </section>
          </div>

          <footer className="flex flex-col gap-2 border-t border-zg-border px-5 py-4 sm:flex-row sm:flex-wrap">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="w-full sm:w-auto"
              disabled={busy}
              onClick={() => onAction("download_pdf")}
            >
              <Download className="h-4 w-4" strokeWidth={2} aria-hidden />
              {busyAction === "download_pdf" ? "Préparation…" : "Télécharger le bon en PDF"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="w-full sm:w-auto"
              disabled={busy}
              onClick={() => onAction("resend")}
            >
              <Mail className="h-4 w-4" strokeWidth={2} aria-hidden />
              {busyAction === "resend" ? "…" : "Renvoyer le bon"}
            </Button>
            {canUse ? (
              <Button
                type="button"
                variant="primary"
                size="sm"
                className="w-full sm:w-auto"
                disabled={busy}
                onClick={() => onAction("redeem")}
              >
                <ScanLine className="h-4 w-4" strokeWidth={2} aria-hidden />
                {busyAction === "redeem" ? "…" : "Utiliser le bon"}
              </Button>
            ) : null}
            {canDisable(card.status) ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full sm:w-auto"
                disabled={busy}
                onClick={() => onAction("disable")}
              >
                <Ban className="h-4 w-4" strokeWidth={2} aria-hidden />
                {busyAction === "disable" ? "…" : "Désactiver"}
              </Button>
            ) : null}
            {canReactivate(card.status) ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="w-full sm:w-auto"
                disabled={busy}
                onClick={() => onAction("reactivate")}
              >
                <RotateCcw className="h-4 w-4" strokeWidth={2} aria-hidden />
                {busyAction === "reactivate" ? "…" : "Réactiver"}
              </Button>
            ) : null}
          </footer>
        </div>
      </div>
    </DashboardPortal>
  );
}
