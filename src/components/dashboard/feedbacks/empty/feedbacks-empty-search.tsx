"use client";

import { useFeedbacks } from "@/src/components/dashboard/feedbacks/context/use-feedbacks";
import Button from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";
import { Search } from "lucide-react";

function FeedbacksEmptyPanel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-zg-border bg-zg-surface px-6 py-10 sm:py-14",
        className,
      )}
    >
      {children}
    </div>
  );
}

export default function FeedbacksEmptySearch() {
  const { filters, resetFilters } = useFeedbacks();
  const q = filters.query.trim();

  return (
    <FeedbacksEmptyPanel>
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zg-info-soft-bg"
          aria-hidden
        >
          <Search className="h-9 w-9 text-zg-info" strokeWidth={1.75} />
        </div>
        <h3 className="mt-5 text-lg font-semibold text-zg-fg">
          {q ? (
            <>
              Aucun feedback trouvé pour « <span className="text-zg-accent">{q}</span> »
            </>
          ) : (
            "Aucun feedback trouvé"
          )}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-zg-text-muted">
          Essayez avec d&apos;autres mots-clés ou retirez vos filtres.
        </p>
        <Button
          type="button"
          variant="secondary"
          size="md"
          className="mt-6 w-full sm:w-auto"
          onClick={resetFilters}
        >
          Effacer les filtres
        </Button>
      </div>
    </FeedbacksEmptyPanel>
  );
}
