"use client";

import { useEffect, useRef, useState } from "react";
import DashboardPortal from "@/src/components/dashboard/ui/dashboard-portal";
import { useFeedbacks } from "@/src/components/dashboard/feedbacks/context/use-feedbacks";
import FeedbackRatingRange from "@/src/components/dashboard/feedbacks/toolbar/feedback-rating-range";
import type {
  FeedbackCommentFilter,
  FeedbackFilters,
  FeedbackReadStatusFilter,
} from "@/src/components/dashboard/feedbacks/utils/feedback-filters";
import { useDialogFocusTrap } from "@/src/components/dashboard/reservations/hooks/use-dialog-focus-trap";
import Button from "@/src/components/ui/button";
import Input from "@/src/components/ui/input";
import Select from "@/src/components/ui/select";
import { cn } from "@/src/lib/utils";
import { X } from "lucide-react";

type FeedbacksFiltersDrawerProps = {
  open: boolean;
  onClose: () => void;
};

export default function FeedbacksFiltersDrawer({ open, onClose }: FeedbacksFiltersDrawerProps) {
  const { filters, setFilters, resetFilters } = useFeedbacks();
  const panelRef = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState<FeedbackFilters>(filters);

  useDialogFocusTrap(open, panelRef);

  useEffect(() => {
    if (open) setDraft(filters);
  }, [open, filters]);

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

  if (!open) return null;

  function apply() {
    setFilters(draft);
    onClose();
  }

  function handleReset() {
    resetFilters();
    onClose();
  }

  return (
    <DashboardPortal>
      <div
        className="fixed inset-0 z-50 flex justify-end bg-black/40 max-md:items-end max-md:justify-center max-md:bg-black/50"
        role="presentation"
        onClick={onClose}
      >
        <div
          id="feedbacks-filters-drawer"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="feedbacks-filters-title"
          className={cn(
            "flex w-full max-w-md flex-col border-zg-border bg-zg-surface shadow-xl",
            "h-full border-l max-md:max-h-[min(92dvh,640px)] max-md:rounded-t-2xl max-md:border-l-0 max-md:border-t",
          )}
          onClick={(event) => event.stopPropagation()}
        >
          <header className="flex items-start justify-between gap-4 border-b border-zg-border px-5 py-4">
            <div>
              <h2 id="feedbacks-filters-title" className="text-lg font-semibold text-zg-fg">
                Filtres
              </h2>
              <p className="mt-1 text-sm text-zg-text-muted">Affinez votre liste de feedbacks</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-zg-text-muted transition-colors hover:bg-zg-card-hover hover:text-zg-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zg-accent/25"
              aria-label="Fermer les filtres"
            >
              <X className="h-5 w-5" strokeWidth={2} />
            </button>
          </header>

          <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
            <fieldset className="space-y-3">
              <legend className="dashboard-field-label">Période</legend>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label htmlFor="feedback-filter-from" className="text-xs text-zg-text-muted">
                    Du
                  </label>
                  <Input
                    id="feedback-filter-from"
                    type="date"
                    value={draft.periodFrom ?? ""}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        periodFrom: e.target.value || null,
                      }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="feedback-filter-to" className="text-xs text-zg-text-muted">
                    Au
                  </label>
                  <Input
                    id="feedback-filter-to"
                    type="date"
                    value={draft.periodTo ?? ""}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        periodTo: e.target.value || null,
                      }))
                    }
                  />
                </div>
              </div>
            </fieldset>

            <div className="space-y-3">
              <span className="dashboard-field-label">Note</span>
              <FeedbackRatingRange
                min={draft.ratingMin}
                max={draft.ratingMax}
                onChange={(ratingMin, ratingMax) =>
                  setDraft((prev) => ({ ...prev, ratingMin, ratingMax }))
                }
                idPrefix="feedback-filter-rating"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="feedback-filter-status" className="dashboard-field-label">
                Statut
              </label>
              <Select
                id="feedback-filter-status"
                value={draft.readStatus}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    readStatus: e.target.value as FeedbackReadStatusFilter,
                  }))
                }
              >
                <option value="all">Tous</option>
                <option value="unread">Non lus</option>
                <option value="read">Traités</option>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="feedback-filter-comment" className="dashboard-field-label">
                Commentaire
              </label>
              <Select
                id="feedback-filter-comment"
                value={draft.commentFilter}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    commentFilter: e.target.value as FeedbackCommentFilter,
                  }))
                }
              >
                <option value="all">Tous</option>
                <option value="with">Avec commentaire écrit</option>
                <option value="without">Sans commentaire</option>
              </Select>
            </div>
          </div>

          <footer className="flex flex-col gap-2 border-t border-zg-border px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:flex-row sm:pb-4">
            <Button type="button" variant="ghost" className="sm:flex-1" onClick={handleReset}>
              Réinitialiser
            </Button>
            <Button type="button" variant="primary" className="sm:flex-1" onClick={apply}>
              Appliquer
            </Button>
          </footer>
        </div>
      </div>
    </DashboardPortal>
  );
}
