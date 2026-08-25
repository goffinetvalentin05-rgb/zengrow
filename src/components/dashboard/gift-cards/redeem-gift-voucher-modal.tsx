"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2, ScanLine, X } from "lucide-react";
import GiftCardStatusBadge from "@/src/components/dashboard/gift-cards/gift-card-status-badge";
import type { GiftCardRecord } from "@/src/components/dashboard/gift-cards/types";
import { useDialogFocusTrap } from "@/src/components/dashboard/reservations/hooks/use-dialog-focus-trap";
import DashboardPortal from "@/src/components/dashboard/ui/dashboard-portal";
import Button from "@/src/components/ui/button";
import Input from "@/src/components/ui/input";
import { formatChf } from "@/src/lib/gift-vouchers/money";
import { getRedeemBlockReason, redeemErrorMessage } from "@/src/lib/gift-vouchers/redeem";
import { cn } from "@/src/lib/utils";

type RedeemStep = "code" | "amount" | "confirm" | "success";

type RedeemGiftVoucherModalProps = {
  open: boolean;
  onClose: () => void;
  onRedeemed: (voucher: GiftCardRecord) => void | Promise<void>;
  onViewVoucher?: (voucher: GiftCardRecord) => void;
  initialCode?: string;
  initialVoucher?: GiftCardRecord | null;
  onScanRequest?: () => void;
};

type LookupPayload = {
  voucher?: GiftCardRecord;
  redeemable?: boolean;
  error?: string;
};

type RedeemPayload = {
  voucher?: GiftCardRecord;
  error?: string;
};

function formatAmountInput(value: number): string {
  return value.toFixed(2);
}

function parseAmountInput(value: string): number | null {
  const normalized = value.trim().replace(/\s/g, "").replace(",", ".");
  if (!normalized) return null;
  const amount = Number(normalized);
  if (!Number.isFinite(amount)) return null;
  return amount;
}

function VoucherPreview({ card }: { card: GiftCardRecord }) {
  return (
    <div className="rounded-2xl border border-zg-border bg-zg-surface-elevated/50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-mono text-lg font-semibold tracking-wide text-zg-fg">{card.code}</p>
        <GiftCardStatusBadge status={card.status} />
      </div>
      <dl className="mt-3 space-y-2 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-zg-text-muted">Montant initial</dt>
          <dd className="font-medium text-zg-fg">{formatChf(card.amountChf)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-zg-text-muted">Solde restant</dt>
          <dd className="text-base font-semibold text-zg-fg">{formatChf(card.balanceChf)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-zg-text-muted">Acheteur</dt>
          <dd className="max-w-[60%] text-right font-medium break-words text-zg-fg">{card.buyerName}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-zg-text-muted">Destinataire</dt>
          <dd className="max-w-[60%] text-right font-medium break-words text-zg-fg">
            {card.recipientName?.trim() || "—"}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-zg-text-muted">Expiration</dt>
          <dd className="font-medium text-zg-fg">{card.expiresLabel}</dd>
        </div>
      </dl>
    </div>
  );
}

export default function RedeemGiftVoucherModal({
  open,
  onClose,
  onRedeemed,
  onViewVoucher,
  initialCode = "",
  initialVoucher = null,
  onScanRequest,
}: RedeemGiftVoucherModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState<RedeemStep>("code");
  const [code, setCode] = useState(initialCode);
  const [voucher, setVoucher] = useState<GiftCardRecord | null>(null);
  const [blockError, setBlockError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [usedAmountChf, setUsedAmountChf] = useState(0);

  const resetState = useCallback((nextCode = "", nextVoucher: GiftCardRecord | null = null) => {
    setCode(nextCode);
    setVoucher(nextVoucher);
    setFormError(null);
    setAmount("");
    setUsedAmountChf(0);
    setBusy(false);
    if (nextVoucher) {
      const block = getRedeemBlockReason({
        status: nextVoucher.status,
        remainingAmountCents: Math.round(nextVoucher.balanceChf * 100),
        expiresAt: nextVoucher.expiresAt ?? null,
      });
      setStep("amount");
      setBlockError(block ? redeemErrorMessage(block) : null);
    } else {
      setStep("code");
      setBlockError(null);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    resetState(initialCode, initialVoucher);
  }, [open, initialCode, initialVoucher, resetState]);

  useDialogFocusTrap(open, panelRef);

  const handleClose = useCallback(() => {
    if (busy) return;
    onClose();
  }, [busy, onClose]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") handleClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, handleClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  async function lookupCode(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setFormError(null);
    setBlockError(null);
    try {
      const response = await fetch(`/api/gift-vouchers/lookup?code=${encodeURIComponent(code.trim())}`);
      const payload = (await response.json().catch(() => null)) as LookupPayload | null;
      if (!response.ok || !payload?.voucher) {
        setFormError(payload?.error ?? "Ce bon n’existe pas.");
        setVoucher(null);
        return;
      }
      setVoucher(payload.voucher);
      setStep("amount");
      setAmount("");
      setBlockError(payload.redeemable ? null : (payload.error ?? "Impossible d’utiliser ce bon."));
    } catch {
      setFormError("Impossible de rechercher ce bon. Vérifiez votre connexion.");
    } finally {
      setBusy(false);
    }
  }

  function goToConfirm() {
    if (!voucher) return;
    const parsed = parseAmountInput(amount);
    if (parsed == null || parsed <= 0) {
      setFormError("Le montant doit être supérieur à 0.");
      return;
    }
    if (parsed > voucher.balanceChf + 1e-9) {
      setFormError("Le montant dépasse le solde restant.");
      return;
    }
    setFormError(null);
    setStep("confirm");
  }

  async function confirmRedeem() {
    if (!voucher || busy) return;
    const parsed = parseAmountInput(amount);
    if (parsed == null) return;
    setBusy(true);
    setFormError(null);
    try {
      const response = await fetch("/api/gift-vouchers/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voucherId: voucher.id,
          code: voucher.code,
          amount: parsed,
        }),
      });
      const payload = (await response.json().catch(() => null)) as RedeemPayload | null;
      if (!response.ok || !payload?.voucher) {
        setFormError(payload?.error ?? "Impossible d’utiliser ce bon.");
        setStep("amount");
        return;
      }
      setUsedAmountChf(parsed);
      setVoucher(payload.voucher);
      setStep("success");
      await onRedeemed(payload.voucher);
    } catch {
      setFormError("Impossible d’utiliser ce bon. Vérifiez votre connexion.");
      setStep("amount");
    } finally {
      setBusy(false);
    }
  }

  if (!open) return null;

  const parsedAmount = parseAmountInput(amount);
  const remainingAfter =
    voucher && parsedAmount != null ? Math.max(0, voucher.balanceChf - parsedAmount) : null;
  const title =
    step === "success" ? "Bon utilisé avec succès" : step === "confirm" ? "Confirmer l’utilisation" : "Utiliser un bon";

  return (
    <DashboardPortal>
      <div
        className="fixed inset-0 z-[60] flex items-end justify-center bg-black/45 p-0 sm:items-center sm:p-4"
        role="presentation"
        onClick={handleClose}
      >
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="redeem-gift-voucher-title"
          className={cn(
            "flex max-h-[min(94dvh,760px)] w-full max-w-lg flex-col overflow-hidden border-zg-border bg-zg-surface shadow-2xl",
            "rounded-t-2xl border-t sm:rounded-2xl sm:border",
          )}
          onClick={(event) => event.stopPropagation()}
        >
          <header className="flex items-start justify-between gap-3 border-b border-zg-border px-5 py-4">
            <div className="min-w-0">
              <h2 id="redeem-gift-voucher-title" className="text-lg font-semibold text-zg-fg">
                {title}
              </h2>
              <p className="mt-1 text-sm text-zg-text-muted">
                {step === "success"
                  ? "Le solde a été mis à jour."
                  : step === "confirm"
                    ? "Vérifiez le montant avant de valider."
                    : "Recherchez un bon de votre établissement, puis encaissez un montant."}
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              disabled={busy}
              className="rounded-lg p-2 text-zg-text-muted transition-colors hover:bg-zg-card-hover hover:text-zg-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zg-accent/25 disabled:opacity-50"
              aria-label="Fermer"
            >
              <X className="h-5 w-5" strokeWidth={2} />
            </button>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
            {step === "success" && voucher ? (
              <div className="space-y-5">
                <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-4">
                  <CheckCircle2 className="h-7 w-7 shrink-0 text-emerald-600" strokeWidth={2} aria-hidden />
                  <p className="text-base font-semibold text-zg-fg">Bon utilisé avec succès</p>
                </div>
                <dl className="space-y-3 text-base">
                  <div className="flex justify-between gap-3">
                    <dt className="text-zg-text-muted">Montant utilisé</dt>
                    <dd className="font-semibold text-zg-fg">{formatChf(usedAmountChf)}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-zg-text-muted">Solde restant</dt>
                    <dd className="font-semibold text-zg-fg">{formatChf(voucher.balanceChf)}</dd>
                  </div>
                </dl>
              </div>
            ) : null}

            {step === "code" ? (
              <form className="space-y-4" onSubmit={lookupCode}>
                <div>
                  <label htmlFor="gift-voucher-code" className="text-sm font-medium text-zg-fg">
                    Code du bon
                  </label>
                  <Input
                    id="gift-voucher-code"
                    value={code}
                    onChange={(event) => setCode(event.target.value.toUpperCase())}
                    placeholder="ZG-8K4M-2P7Q"
                    autoComplete="off"
                    autoCapitalize="characters"
                    autoCorrect="off"
                    spellCheck={false}
                    inputMode="text"
                    className="mt-2 min-h-14 font-mono text-lg tracking-[0.18em]"
                    aria-invalid={formError ? true : undefined}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => onScanRequest?.()}
                  className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-zg-border bg-zg-surface-elevated/40 px-4 text-sm font-semibold text-zg-fg hover:bg-zg-card-hover"
                >
                  <ScanLine className="h-5 w-5" strokeWidth={2} aria-hidden />
                  Scanner un QR code
                </button>
                <p className="text-xs text-zg-text-muted">Pointez la caméra vers le QR du bon cadeau.</p>
                {formError ? <p className="text-sm font-medium text-zg-danger">{formError}</p> : null}
                <Button type="submit" size="lg" className="min-h-12 w-full text-base" disabled={busy || !code.trim()}>
                  {busy ? "Recherche…" : "Rechercher le bon"}
                </Button>
              </form>
            ) : null}

            {step !== "code" && step !== "success" && voucher ? (
              <div className="space-y-5">
                <VoucherPreview card={voucher} />
                {blockError ? <p className="text-sm font-medium text-zg-danger">{blockError}</p> : null}

                {!blockError && step === "amount" ? (
                  <div className="space-y-3">
                    <label htmlFor="redeem-amount" className="text-sm font-medium text-zg-fg">
                      Montant utilisé aujourd’hui
                    </label>
                    <div className="relative">
                      <Input
                        id="redeem-amount"
                        value={amount}
                        onChange={(event) => setAmount(event.target.value)}
                        placeholder="35.00"
                        inputMode="decimal"
                        className="min-h-14 pr-16 text-lg tabular-nums"
                        aria-invalid={formError ? true : undefined}
                      />
                      <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm font-semibold text-zg-text-muted">
                        CHF
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      className="min-h-12 w-full"
                      onClick={() => setAmount(formatAmountInput(voucher.balanceChf))}
                    >
                      Utiliser tout le solde
                    </Button>
                    {formError ? <p className="text-sm font-medium text-zg-danger">{formError}</p> : null}
                  </div>
                ) : null}

                {!blockError && step === "confirm" && parsedAmount != null && remainingAfter != null ? (
                  <div className="space-y-3">
                    <div className="rounded-2xl border border-zg-border bg-zg-surface-elevated/40 px-4 py-4 text-base">
                      <div className="flex justify-between gap-3 py-1.5">
                        <span className="text-zg-text-muted">Solde actuel</span>
                        <span className="font-semibold text-zg-fg">{formatChf(voucher.balanceChf)}</span>
                      </div>
                      <div className="flex justify-between gap-3 py-1.5">
                        <span className="text-zg-text-muted">Montant utilisé</span>
                        <span className="font-semibold text-zg-fg">{formatChf(parsedAmount)}</span>
                      </div>
                      <div className="mt-1 flex justify-between gap-3 border-t border-zg-border pt-3">
                        <span className="text-zg-text-muted">Nouveau solde</span>
                        <span className="text-lg font-semibold text-zg-fg">{formatChf(remainingAfter)}</span>
                      </div>
                    </div>
                    {formError ? <p className="text-sm font-medium text-zg-danger">{formError}</p> : null}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>

          <footer className="flex flex-col gap-2 border-t border-zg-border px-5 py-4">
            {step === "success" && voucher ? (
              <>
                <Button type="button" size="lg" className="min-h-12 w-full text-base" onClick={handleClose}>
                  Terminer
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  className="min-h-12 w-full text-base"
                  onClick={() => {
                    onViewVoucher?.(voucher);
                    onClose();
                  }}
                >
                  Voir le bon
                </Button>
              </>
            ) : null}

            {step === "amount" && voucher ? (
              blockError ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  className="min-h-12 w-full text-base"
                  onClick={() => resetState()}
                >
                  Rechercher un autre bon
                </Button>
              ) : (
                <>
                  <Button
                    type="button"
                    size="lg"
                    className="min-h-12 w-full text-base"
                    disabled={busy}
                    onClick={goToConfirm}
                  >
                    Continuer
                  </Button>
                  {!initialVoucher ? (
                    <Button type="button" variant="ghost" className="min-h-11 w-full" onClick={() => resetState()}>
                      Changer de code
                    </Button>
                  ) : null}
                </>
              )
            ) : null}

            {step === "confirm" ? (
              <>
                <Button
                  type="button"
                  size="lg"
                  className="min-h-12 w-full text-base"
                  disabled={busy}
                  onClick={confirmRedeem}
                >
                  {busy ? "Validation…" : "Confirmer l’utilisation"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="min-h-11 w-full"
                  disabled={busy}
                  onClick={() => {
                    setFormError(null);
                    setStep("amount");
                  }}
                >
                  Modifier le montant
                </Button>
              </>
            ) : null}
          </footer>
        </div>
      </div>
    </DashboardPortal>
  );
}
