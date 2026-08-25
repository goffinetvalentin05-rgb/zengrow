"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Gift, Mail, Printer, X } from "lucide-react";
import { useDialogFocusTrap } from "@/src/components/dashboard/reservations/hooks/use-dialog-focus-trap";
import DashboardPortal from "@/src/components/dashboard/ui/dashboard-portal";
import Button from "@/src/components/ui/button";
import Input from "@/src/components/ui/input";
import Textarea from "@/src/components/ui/textarea";
import Toggle from "@/src/components/ui/toggle";
import { cn } from "@/src/lib/utils";
import type { GiftCardType } from "@/src/components/dashboard/gift-cards/types";
import type { GiftVoucherBrandingSettings } from "@/src/lib/gift-vouchers/branding";
import {
  DEFAULT_GIFT_VOUCHER_SUGGESTED_AMOUNTS,
  DEFAULT_GIFT_VOUCHER_VALIDITY_MONTHS,
  defaultGiftVoucherExpiryDate,
} from "@/src/lib/gift-vouchers/defaults";
import { formatCentsAsChf } from "@/src/lib/gift-vouchers/money";
import { offerKindLabel } from "@/src/lib/gift-vouchers/offers/map";
import type { GiftVoucherOffer } from "@/src/lib/gift-vouchers/offers/types";

type CreateGiftCardModalProps = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void | Promise<void>;
};

type FormState = {
  amount: string;
  buyerName: string;
  buyerEmail: string;
  recipientName: string;
  message: string;
  expiresAt: string;
  generatePdf: boolean;
};

const EMPTY_FORM: FormState = {
  amount: String(DEFAULT_GIFT_VOUCHER_SUGGESTED_AMOUNTS[1] ?? 100),
  buyerName: "",
  buyerEmail: "",
  recipientName: "",
  message: "",
  expiresAt: defaultGiftVoucherExpiryDate(DEFAULT_GIFT_VOUCHER_VALIDITY_MONTHS),
  generatePdf: true,
};

function offerPrice(offer: GiftVoucherOffer): string {
  if (offer.kind === "monetary") return formatCentsAsChf(offer.faceValueCents ?? offer.salePriceCents);
  return offer.salePriceCents > 0 ? formatCentsAsChf(offer.salePriceCents) : "Prestation";
}

export default function CreateGiftCardModal({ open, onClose, onCreated }: CreateGiftCardModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState<"offer" | "type" | "form">("offer");
  const [selectedType, setSelectedType] = useState<GiftCardType | null>(null);
  const [selectedOfferId, setSelectedOfferId] = useState<string | "free" | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [suggestedAmounts, setSuggestedAmounts] = useState<number[]>([...DEFAULT_GIFT_VOUCHER_SUGGESTED_AMOUNTS]);
  const [allowFreeAmount, setAllowFreeAmount] = useState(true);
  const [offers, setOffers] = useState<GiftVoucherOffer[]>([]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    void (async () => {
      try {
        const [settingsRes, offersRes] = await Promise.all([
          fetch("/api/gift-vouchers/settings"),
          fetch("/api/gift-voucher-offers"),
        ]);
        const settingsPayload = (await settingsRes.json().catch(() => null)) as {
          settings?: GiftVoucherBrandingSettings;
        } | null;
        const offersPayload = (await offersRes.json().catch(() => null)) as { offers?: GiftVoucherOffer[] } | null;
        if (cancelled) return;
        const amounts = settingsPayload?.settings?.suggestedAmounts ?? [...DEFAULT_GIFT_VOUCHER_SUGGESTED_AMOUNTS];
        const validity = settingsPayload?.settings?.defaultValidityMonths ?? DEFAULT_GIFT_VOUCHER_VALIDITY_MONTHS;
        setSuggestedAmounts(amounts);
        setAllowFreeAmount(settingsPayload?.settings?.allowFreeAmount !== false);
        setOffers((offersPayload?.offers ?? []).filter((offer) => offer.status === "active"));
        setForm((current) => ({
          ...current,
          amount: current.amount === EMPTY_FORM.amount ? String(amounts[1] ?? amounts[0] ?? 100) : current.amount,
          expiresAt: current.expiresAt === EMPTY_FORM.expiresAt ? defaultGiftVoucherExpiryDate(validity) : current.expiresAt,
        }));
      } catch {
        /* conservation des valeurs par défaut */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);

  const selectedOffer = offers.find((offer) => offer.id === selectedOfferId) ?? null;

  const resetAndClose = useCallback(() => {
    if (submitting) return;
    setStep("offer");
    setSelectedType(null);
    setSelectedOfferId(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    onClose();
  }, [onClose, submitting]);

  useDialogFocusTrap(open, panelRef);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") resetAndClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, resetAndClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  function chooseOffer(id: string | "free") {
    setSelectedOfferId(id);
    const offer = offers.find((item) => item.id === id);
    if (offer) {
      setForm((current) => ({
        ...current,
        expiresAt: defaultGiftVoucherExpiryDate(offer.validityMonths),
      }));
    }
    setStep("type");
  }

  function chooseType(type: GiftCardType) {
    setSelectedType(type);
    setStep("form");
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedType || submitting) return;
    setSubmitting(true);
    setFormError(null);
    try {
      const body: Record<string, unknown> = {
        type: selectedType,
        buyerName: form.buyerName,
        buyerEmail: form.buyerEmail,
        recipientName: form.recipientName,
        message: form.message,
        expiresAt: form.expiresAt,
        generatePdf: selectedType === "paper" ? form.generatePdf : undefined,
      };
      if (selectedOfferId && selectedOfferId !== "free") {
        body.offerId = selectedOfferId;
      } else {
        body.amount = Number(form.amount);
      }
      const response = await fetch("/api/gift-vouchers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        setFormError(payload?.error ?? "Impossible de créer le bon cadeau.");
        return;
      }
      setStep("offer");
      setSelectedType(null);
      setSelectedOfferId(null);
      setForm(EMPTY_FORM);
      await onCreated();
    } catch {
      setFormError("Impossible de créer le bon cadeau. Vérifiez votre connexion.");
    } finally {
      setSubmitting(false);
    }
  }

  const title =
    step === "offer"
      ? "Créer un bon"
      : step === "type"
        ? "Type de bon"
        : selectedType === "paper"
          ? "Bon papier"
          : "Bon digital";

  return (
    <DashboardPortal>
      <div
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-0 sm:items-center sm:p-4"
        role="presentation"
        onClick={resetAndClose}
      >
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-gift-card-title"
          className={cn(
            "flex max-h-[min(92dvh,840px)] w-full max-w-2xl flex-col overflow-hidden border-zg-border bg-zg-surface shadow-2xl",
            "rounded-t-2xl border-t sm:rounded-2xl sm:border",
          )}
          onClick={(event) => event.stopPropagation()}
        >
          <header className="flex items-start justify-between gap-3 border-b border-zg-border px-5 py-4">
            <div className="min-w-0">
              <h2 id="create-gift-card-title" className="text-lg font-semibold text-zg-fg">
                {title}
              </h2>
              <p className="mt-1 text-sm text-zg-text-muted">
                {step === "offer"
                  ? "Choisissez une offre du catalogue, ou un montant libre."
                  : step === "type"
                    ? "Quel support souhaitez-vous créer ?"
                    : "Le bon sera enregistré dans votre établissement."}
              </p>
            </div>
            <button
              type="button"
              onClick={resetAndClose}
              className="rounded-lg p-2 text-zg-text-muted transition-colors hover:bg-zg-card-hover hover:text-zg-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zg-accent/25"
              aria-label="Fermer"
            >
              <X className="h-5 w-5" strokeWidth={2} />
            </button>
          </header>

          {step === "offer" ? (
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-5">
              {offers.length === 0 ? (
                <p className="text-sm text-zg-text-muted">
                  Aucune offre active. Créez d’abord une offre, ou utilisez un montant libre.
                </p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {offers.map((offer) => (
                    <button
                      key={offer.id}
                      type="button"
                      onClick={() => chooseOffer(offer.id)}
                      className="overflow-hidden rounded-2xl border border-zg-border text-left hover:border-zg-accent/40"
                    >
                      {offer.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={offer.imageUrl} alt="" className="h-28 w-full object-cover" />
                      ) : (
                        <div className="flex h-28 items-center justify-center bg-zg-accent-soft-bg text-sm font-semibold text-zg-accent">
                          {offerKindLabel(offer.kind)}
                        </div>
                      )}
                      <div className="p-3">
                        <p className="font-semibold text-zg-fg">{offer.title}</p>
                        <p className="mt-1 text-sm text-zg-accent">{offerPrice(offer)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {allowFreeAmount ? (
                <button
                  type="button"
                  onClick={() => chooseOffer("free")}
                  className="w-full rounded-2xl border border-dashed border-zg-border p-4 text-left hover:border-zg-accent/40"
                >
                  <p className="font-semibold text-zg-fg">Montant libre</p>
                  <p className="mt-1 text-sm text-zg-text-muted">
                    Utilise les montants proposés ({suggestedAmounts.join(" / ")} CHF), hors catalogue.
                  </p>
                </button>
              ) : null}
            </div>
          ) : null}

          {step === "type" ? (
            <div className="grid gap-4 overflow-y-auto p-5 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => chooseType("digital")}
                className="group flex h-full flex-col rounded-2xl border border-zg-border bg-zg-surface p-5 text-left transition-all hover:border-zg-accent/40 hover:bg-zg-card-hover"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-zg-accent-soft-bg text-zg-accent">
                  <Mail className="h-5 w-5" strokeWidth={2} aria-hidden />
                </span>
                <p className="mt-4 text-base font-semibold text-zg-fg">Bon digital</p>
                <p className="mt-1.5 text-sm leading-relaxed text-zg-text-muted">
                  Envoyé par e-mail et utilisable via QR code ou Wallet.
                </p>
              </button>
              <button
                type="button"
                onClick={() => chooseType("paper")}
                className="group flex h-full flex-col rounded-2xl border border-zg-border bg-zg-surface p-5 text-left transition-all hover:border-zg-accent/40 hover:bg-zg-card-hover"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-zg-premium-soft-bg text-zg-premium">
                  <Printer className="h-5 w-5" strokeWidth={2} aria-hidden />
                </span>
                <p className="mt-4 text-base font-semibold text-zg-fg">Bon papier</p>
                <p className="mt-1.5 text-sm leading-relaxed text-zg-text-muted">
                  Créez un bon physique tout en gardant son suivi dans ZenGrow.
                </p>
              </button>
              <div className="sm:col-span-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => setStep("offer")}>
                  Retour
                </Button>
              </div>
            </div>
          ) : null}

          {step === "form" ? (
            <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5">
                {formError ? (
                  <p className="rounded-xl border border-zg-danger/30 bg-zg-danger-soft-bg px-3 py-2 text-sm text-zg-danger" role="alert">
                    {formError}
                  </p>
                ) : null}
                {selectedOffer ? (
                  <div className="flex gap-3 rounded-2xl border border-zg-border p-3">
                    {selectedOffer.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={selectedOffer.imageUrl} alt="" className="h-16 w-20 rounded-xl object-cover" />
                    ) : null}
                    <div className="min-w-0">
                      <p className="font-semibold text-zg-fg">{selectedOffer.title}</p>
                      <p className="text-sm text-zg-accent">{offerPrice(selectedOffer)}</p>
                      {selectedOffer.shortDescription ? (
                        <p className="mt-1 line-clamp-2 text-sm text-zg-text-muted">{selectedOffer.shortDescription}</p>
                      ) : null}
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="dashboard-field-label" htmlFor="gift-amount">
                      Montant
                    </label>
                    <Input
                      id="gift-amount"
                      type="number"
                      min={10}
                      step={10}
                      required
                      value={form.amount}
                      onChange={(event) => setForm((prev) => ({ ...prev, amount: event.target.value }))}
                      className="mt-1.5"
                    />
                    <div className="mt-2 flex flex-wrap gap-2">
                      {suggestedAmounts.map((amount) => (
                        <button
                          key={amount}
                          type="button"
                          onClick={() => setForm((prev) => ({ ...prev, amount: String(amount) }))}
                          className={cn(
                            "rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
                            form.amount === String(amount)
                              ? "border-zg-accent bg-zg-accent/10 text-zg-accent"
                              : "border-zg-border text-zg-text-muted hover:border-zg-accent/40",
                          )}
                        >
                          {amount} CHF
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="dashboard-field-label" htmlFor="gift-buyer-name">
                      Nom de l&apos;acheteur
                    </label>
                    <Input
                      id="gift-buyer-name"
                      required
                      value={form.buyerName}
                      onChange={(event) => setForm((prev) => ({ ...prev, buyerName: event.target.value }))}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <label className="dashboard-field-label" htmlFor="gift-buyer-email">
                      Email acheteur
                    </label>
                    <Input
                      id="gift-buyer-email"
                      type="email"
                      required
                      value={form.buyerEmail}
                      onChange={(event) => setForm((prev) => ({ ...prev, buyerEmail: event.target.value }))}
                      className="mt-1.5"
                    />
                  </div>
                </div>
                <div>
                  <label className="dashboard-field-label" htmlFor="gift-recipient">
                    Nom du destinataire (optionnel)
                  </label>
                  <Input
                    id="gift-recipient"
                    value={form.recipientName}
                    onChange={(event) => setForm((prev) => ({ ...prev, recipientName: event.target.value }))}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <label className="dashboard-field-label" htmlFor="gift-message">
                    Message (optionnel)
                  </label>
                  <Textarea
                    id="gift-message"
                    rows={3}
                    value={form.message}
                    onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <label className="dashboard-field-label" htmlFor="gift-expires">
                    Date d&apos;expiration
                  </label>
                  <Input
                    id="gift-expires"
                    type="date"
                    required
                    value={form.expiresAt}
                    onChange={(event) => setForm((prev) => ({ ...prev, expiresAt: event.target.value }))}
                    className="mt-1.5"
                  />
                </div>
                {selectedType === "paper" ? (
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-zg-border px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-zg-fg">Générer un PDF imprimable</p>
                      <p className="mt-0.5 text-xs text-zg-text-muted">Aperçu uniquement pour cette étape.</p>
                    </div>
                    <Toggle
                      checked={form.generatePdf}
                      onChange={(checked) => setForm((prev) => ({ ...prev, generatePdf: checked }))}
                    />
                  </div>
                ) : null}
              </div>
              <footer className="flex flex-col gap-2 border-t border-zg-border px-5 py-4 sm:flex-row sm:justify-between">
                <Button type="button" variant="ghost" size="sm" onClick={() => setStep("type")} disabled={submitting}>
                  Retour
                </Button>
                <Button type="submit" size="sm" disabled={submitting}>
                  <Gift className="h-4 w-4" strokeWidth={2} aria-hidden />
                  {submitting ? "Création…" : "Créer le bon"}
                </Button>
              </footer>
            </form>
          ) : null}
        </div>
      </div>
    </DashboardPortal>
  );
}
