"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { useDialogFocusTrap } from "@/src/components/dashboard/reservations/hooks/use-dialog-focus-trap";
import DashboardPortal from "@/src/components/dashboard/ui/dashboard-portal";
import Button from "@/src/components/ui/button";
import Input from "@/src/components/ui/input";
import Textarea from "@/src/components/ui/textarea";
import Toggle from "@/src/components/ui/toggle";
import type { LoyaltyReward } from "@/src/lib/loyalty/types";
import { cn } from "@/src/lib/utils";

type RewardModalProps = {
  open: boolean;
  reward?: LoyaltyReward | null;
  onClose: () => void;
  onSaved: (reward: LoyaltyReward) => void | Promise<void>;
};

export default function LoyaltyRewardModal({ open, reward, onClose, onSaved }: RewardModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pointsRequired, setPointsRequired] = useState("500");
  const [active, setActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const editing = reward != null;
  const formKey = open ? (reward?.id ?? "new") : "closed";
  const [seenKey, setSeenKey] = useState(formKey);
  if (seenKey !== formKey) {
    setSeenKey(formKey);
    setTitle(reward?.title ?? "");
    setDescription(reward?.description ?? "");
    setPointsRequired(reward ? String(reward.pointsRequired) : "500");
    setActive(reward?.active ?? true);
    setError(null);
    setSubmitting(false);
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

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const body = {
        title,
        description: description || undefined,
        pointsRequired: Number(pointsRequired),
        active,
      };
      const response = await fetch(editing ? `/api/loyalty/rewards/${reward.id}` : "/api/loyalty/rewards", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = (await response.json().catch(() => null)) as { reward?: LoyaltyReward; error?: string } | null;
      if (!response.ok || !payload?.reward) {
        setError(payload?.error ?? "Impossible d’enregistrer cette récompense.");
        return;
      }
      await onSaved(payload.reward);
      onClose();
    } catch {
      setError("Impossible d’enregistrer cette récompense. Vérifiez votre connexion.");
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
          aria-labelledby="loyalty-reward-title"
          className={cn(
            "flex max-h-[min(92dvh,680px)] w-full max-w-lg flex-col overflow-hidden border-zg-border bg-zg-surface shadow-2xl",
            "rounded-t-2xl border-t sm:rounded-2xl sm:border",
          )}
          onClick={(event) => event.stopPropagation()}
        >
          <header className="flex items-start justify-between gap-3 border-b border-zg-border px-5 py-4">
            <div>
              <h2 id="loyalty-reward-title" className="text-lg font-semibold text-zg-fg">
                {editing ? "Modifier la récompense" : "Ajouter une récompense"}
              </h2>
              <p className="mt-1 text-sm text-zg-text-muted">Un palier de points, une récompense claire pour vos clients.</p>
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
              <div>
                <label className="dashboard-field-label" htmlFor="reward-title">
                  Nom
                </label>
                <Input
                  id="reward-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="5 CHF offerts"
                  required
                  className="mt-1.5"
                />
              </div>
              <div>
                <label className="dashboard-field-label" htmlFor="reward-description">
                  Description <span className="font-normal text-zg-text-muted">(facultatif)</span>
                </label>
                <Textarea
                  id="reward-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={3}
                  className="mt-1.5"
                />
              </div>
              <div>
                <label className="dashboard-field-label" htmlFor="reward-points">
                  Points nécessaires
                </label>
                <Input
                  id="reward-points"
                  type="number"
                  min={1}
                  step={1}
                  value={pointsRequired}
                  onChange={(event) => setPointsRequired(event.target.value)}
                  required
                  className="mt-1.5"
                />
              </div>
              <div className="flex items-center justify-between gap-3 rounded-xl border border-zg-border px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-zg-fg">Récompense active</p>
                  <p className="mt-0.5 text-xs text-zg-text-muted">Les paliers inactifs restent visibles ici, pas au scan.</p>
                </div>
                <Toggle checked={active} onChange={setActive} />
              </div>
              {error ? <p className="text-sm font-medium text-zg-danger">{error}</p> : null}
            </div>
            <footer className="flex justify-end gap-2 border-t border-zg-border px-5 py-4">
              <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
                Annuler
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Enregistrement…" : editing ? "Enregistrer" : "Ajouter"}
              </Button>
            </footer>
          </form>
        </div>
      </div>
    </DashboardPortal>
  );
}
