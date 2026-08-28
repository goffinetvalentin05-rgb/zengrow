"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Gift, X } from "lucide-react";
import GiftVoucherQr from "@/src/components/dashboard/gift-cards/gift-voucher-qr";
import { useDashboardToast } from "@/src/components/dashboard/dashboard-toast-provider";
import { useDialogFocusTrap } from "@/src/components/dashboard/reservations/hooks/use-dialog-focus-trap";
import DashboardPortal from "@/src/components/dashboard/ui/dashboard-portal";
import Badge from "@/src/components/ui/badge";
import Button from "@/src/components/ui/button";
import { formatPoints, formatPointsProgress } from "@/src/lib/loyalty/points";
import type { LoyaltyCardRecord } from "@/src/lib/loyalty/types";
import { cn } from "@/src/lib/utils";

type LoyaltyDetailDrawerProps = {
  card: LoyaltyCardRecord | null;
  onClose: () => void;
  onCardUpdated: (card: LoyaltyCardRecord) => void;
};

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <p className="text-sm text-zg-text-muted">{label}</p>
      <p className="max-w-[60%] text-right text-sm font-medium break-words text-zg-fg">{value}</p>
    </div>
  );
}

export default function LoyaltyDetailDrawer({ card, onClose, onCardUpdated }: LoyaltyDetailDrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const showToast = useDashboardToast();
  const [redeemingId, setRedeemingId] = useState<string | null>(null);
  const open = card != null;

  useDialogFocusTrap(open, panelRef);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !redeemingId) onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose, redeemingId]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!card) return null;

  const next = card.rewardState.next;
  const progressTarget = next?.pointsRequired ?? card.rewardState.bestAvailable?.pointsRequired ?? null;
  const progressRatio =
    progressTarget && progressTarget > 0 ? Math.min(1, card.pointsBalance / progressTarget) : card.pointsBalance > 0 ? 1 : 0;

  async function redeem(rewardId: string) {
    if (!card || redeemingId) return;
    const cardId = card.id;
    setRedeemingId(rewardId);
    try {
      const response = await fetch(`/api/loyalty/cards/${cardId}/redeem`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rewardId }),
      });
      const payload = (await response.json().catch(() => null)) as { card?: LoyaltyCardRecord; error?: string } | null;
      if (!response.ok || !payload?.card) {
        showToast({ message: payload?.error ?? "Impossible d’utiliser cette récompense." });
        return;
      }
      onCardUpdated(payload.card);
      showToast({ message: "Récompense utilisée.", icon: CheckCircle2 });
    } catch {
      showToast({ message: "Impossible d’utiliser cette récompense." });
    } finally {
      setRedeemingId(null);
    }
  }

  return (
    <DashboardPortal>
      <div
        className="fixed inset-0 z-50 flex justify-end bg-black/40 max-md:items-end max-md:justify-center"
        role="presentation"
        onClick={() => {
          if (!redeemingId) onClose();
        }}
      >
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="loyalty-card-detail-title"
          className={cn(
            "flex w-full max-w-md flex-col border-zg-border bg-zg-surface shadow-xl",
            "h-full border-l max-md:max-h-[min(92dvh,720px)] max-md:rounded-t-2xl max-md:border-l-0 max-md:border-t",
          )}
          onClick={(event) => event.stopPropagation()}
        >
          <header className="flex items-start justify-between gap-3 border-b border-zg-border px-5 py-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 id="loyalty-card-detail-title" className="text-lg font-semibold text-zg-fg">
                  {card.customerName}
                </h2>
                <Badge tone={card.status === "active" ? "success" : "neutral"}>
                  {card.status === "active" ? "Actif" : "Désactivé"}
                </Badge>
              </div>
              <p className="mt-1 font-mono text-sm text-zg-text-muted">{card.cardCode}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={Boolean(redeemingId)}
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
                <DetailRow label="Nom" value={card.customerName} />
                <DetailRow label="E-mail" value={card.customerEmail || "—"} />
                <DetailRow label="Téléphone" value={card.customerPhone || "—"} />
                <DetailRow label="Numéro de carte" value={card.cardCode} />
                <DetailRow label="Statut" value={card.status === "active" ? "Actif" : "Désactivé"} />
                <DetailRow label="Dernière visite" value={card.lastVisitLabel} />
              </div>
            </section>

            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zg-text-muted">Solde</h3>
              <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-zg-fg">
                {formatPoints(card.pointsBalance)}
              </p>
              {progressTarget ? (
                <div className="mt-3">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-zg-text-muted">
                      {next ? `Prochaine récompense : ${next.title}` : "Palier atteint"}
                    </span>
                    <span className="font-medium tabular-nums text-zg-fg">
                      {formatPointsProgress(card.pointsBalance, progressTarget)}
                    </span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-zg-border">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#7c5cff] to-[#6366f1]"
                      style={{ width: `${Math.round(progressRatio * 100)}%` }}
                    />
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-sm text-zg-text-muted">Aucun palier configuré pour le moment.</p>
              )}
            </section>

            {card.rewardState.available.length > 0 ? (
              <section className="rounded-2xl border border-zg-accent/25 bg-zg-accent/5 p-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-zg-fg">
                  <Gift className="h-4 w-4 text-zg-accent" strokeWidth={2} aria-hidden />
                  Récompense disponible
                </p>
                <ul className="mt-3 space-y-3">
                  {card.rewardState.available.map((reward) => (
                    <li key={reward.id} className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-zg-fg">{reward.title}</p>
                        <p className="text-xs text-zg-text-muted">{formatPoints(reward.pointsRequired)}</p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        disabled={Boolean(redeemingId)}
                        onClick={() => void redeem(reward.id)}
                      >
                        {redeemingId === reward.id ? "…" : "Utiliser"}
                      </Button>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zg-text-muted">Carte à scanner</h3>
              <div className="mt-3 flex justify-center">
                <GiftVoucherQr value={card.cardCode} size={160} label={`QR de la carte ${card.cardCode}`} />
              </div>
            </section>

            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zg-text-muted">Historique</h3>
              {card.history.length === 0 ? (
                <p className="mt-2 text-sm text-zg-text-muted">Aucune opération pour l’instant.</p>
              ) : (
                <ul className="mt-2 divide-y divide-zg-border/80">
                  {card.history.map((event) => (
                    <li key={event.id} className="py-3">
                      <p
                        className={cn(
                          "text-sm font-medium",
                          event.pointsDelta < 0 ? "text-zg-fg" : "text-zg-fg",
                        )}
                      >
                        {event.title}
                      </p>
                      <p className="mt-0.5 text-xs text-zg-text-muted">{event.dateLabel}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      </div>
    </DashboardPortal>
  );
}
