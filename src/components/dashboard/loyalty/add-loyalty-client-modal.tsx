"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { useDialogFocusTrap } from "@/src/components/dashboard/reservations/hooks/use-dialog-focus-trap";
import DashboardPortal from "@/src/components/dashboard/ui/dashboard-portal";
import Button from "@/src/components/ui/button";
import Input from "@/src/components/ui/input";
import { cn } from "@/src/lib/utils";

type AddLoyaltyClientModalProps = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void | Promise<void>;
};

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

const EMPTY: FormState = { firstName: "", lastName: "", email: "", phone: "" };

export default function AddLoyaltyClientModal({ open, onClose, onCreated }: AddLoyaltyClientModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seenOpen, setSeenOpen] = useState(open);
  if (seenOpen !== open) {
    setSeenOpen(open);
    if (open) {
      setForm(EMPTY);
      setError(null);
      setSubmitting(false);
    }
  }

  useDialogFocusTrap(open, panelRef);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !submitting) onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose, submitting]);

  if (!open) return null;

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setError(null);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/loyalty/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone || undefined,
        }),
      });
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        setError(payload?.error ?? "Impossible d’ajouter ce client.");
        return;
      }
      await onCreated();
    } catch {
      setError("Impossible d’ajouter ce client. Vérifiez votre connexion.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <DashboardPortal>
      <div
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-0 sm:items-center sm:p-4"
        role="presentation"
        onClick={() => {
          if (!submitting) onClose();
        }}
      >
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-loyalty-client-title"
          className={cn(
            "flex max-h-[min(92dvh,720px)] w-full max-w-lg flex-col overflow-hidden border-zg-border bg-zg-surface shadow-2xl",
            "rounded-t-2xl border-t sm:rounded-2xl sm:border",
          )}
          onClick={(event) => event.stopPropagation()}
        >
          <header className="flex items-start justify-between gap-3 border-b border-zg-border px-5 py-4">
            <div className="min-w-0">
              <h2 id="add-loyalty-client-title" className="text-lg font-semibold text-zg-fg">
                Ajouter un client
              </h2>
              <p className="mt-1 text-sm text-zg-text-muted">
                Sa carte de fidélité est créée automatiquement, avec le bonus d’inscription.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-lg p-2 text-zg-text-muted transition-colors hover:bg-zg-card-hover hover:text-zg-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zg-accent/25 disabled:opacity-50"
              aria-label="Fermer"
            >
              <X className="h-5 w-5" strokeWidth={2} />
            </button>
          </header>

          <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="dashboard-field-label" htmlFor="loyalty-first-name">
                    Prénom
                  </label>
                  <Input
                    id="loyalty-first-name"
                    value={form.firstName}
                    onChange={(event) => update("firstName", event.target.value)}
                    autoComplete="given-name"
                    required
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <label className="dashboard-field-label" htmlFor="loyalty-last-name">
                    Nom
                  </label>
                  <Input
                    id="loyalty-last-name"
                    value={form.lastName}
                    onChange={(event) => update("lastName", event.target.value)}
                    autoComplete="family-name"
                    required
                    className="mt-1.5"
                  />
                </div>
              </div>
              <div>
                <label className="dashboard-field-label" htmlFor="loyalty-email">
                  E-mail
                </label>
                <Input
                  id="loyalty-email"
                  type="email"
                  value={form.email}
                  onChange={(event) => update("email", event.target.value)}
                  autoComplete="email"
                  required
                  className="mt-1.5"
                />
              </div>
              <div>
                <label className="dashboard-field-label" htmlFor="loyalty-phone">
                  Téléphone <span className="font-normal text-zg-text-muted">(facultatif)</span>
                </label>
                <Input
                  id="loyalty-phone"
                  type="tel"
                  value={form.phone}
                  onChange={(event) => update("phone", event.target.value)}
                  autoComplete="tel"
                  className="mt-1.5"
                />
              </div>
              {error ? <p className="text-sm font-medium text-zg-danger">{error}</p> : null}
            </div>
            <footer className="flex justify-end gap-2 border-t border-zg-border px-5 py-4">
              <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
                Annuler
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Création…" : "Créer la carte"}
              </Button>
            </footer>
          </form>
        </div>
      </div>
    </DashboardPortal>
  );
}
