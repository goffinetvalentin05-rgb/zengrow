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
  amount: "100",
  buyerName: "",
  buyerEmail: "",
  recipientName: "",
  message: "",
  expiresAt: "2027-08-25",
  generatePdf: true,
};

export default function CreateGiftCardModal({ open, onClose, onCreated }: CreateGiftCardModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState<"type" | "form">("type");
  const [selectedType, setSelectedType] = useState<GiftCardType | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useDialogFocusTrap(open, panelRef);

  const resetAndClose = useCallback(() => {
    if (submitting) return;
    setStep("type");
    setSelectedType(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    onClose();
  }, [onClose, submitting]);

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
      const response = await fetch("/api/gift-vouchers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: selectedType,
          amount: Number(form.amount),
          buyerName: form.buyerName,
          buyerEmail: form.buyerEmail,
          recipientName: form.recipientName,
          message: form.message,
          expiresAt: form.expiresAt,
          generatePdf: selectedType === "paper" ? form.generatePdf : undefined,
        }),
      });
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        setFormError(payload?.error ?? "Impossible de créer le bon cadeau.");
        return;
      }
      setStep("type");
      setSelectedType(null);
      setForm(EMPTY_FORM);
      await onCreated();
    } catch {
      setFormError("Impossible de créer le bon cadeau. Vérifiez votre connexion.");
    } finally {
      setSubmitting(false);
    }
  }

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
                {step === "type" ? "Créer un bon" : selectedType === "paper" ? "Bon papier" : "Bon digital"}
              </h2>
              <p className="mt-1 text-sm text-zg-text-muted">
                {step === "type"
                  ? "Quel type de bon souhaitez-vous créer ?"
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
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5">
                {formError ? (
                  <p className="rounded-xl border border-zg-danger/30 bg-zg-danger-soft-bg px-3 py-2 text-sm text-zg-danger" role="alert">
                    {formError}
                  </p>
                ) : null}
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
                </div>
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
          )}
        </div>
      </div>
    </DashboardPortal>
  );
}
