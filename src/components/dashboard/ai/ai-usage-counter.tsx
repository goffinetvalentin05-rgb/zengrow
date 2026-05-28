"use client";

import { cn } from "@/src/lib/utils";

type AIUsageCounterProps = {
  used: number;
  limit: number;
  loading?: boolean;
  canAccess?: boolean;
  isFounder?: boolean;
  className?: string;
};

export default function AIUsageCounter({
  used,
  limit,
  loading,
  canAccess = true,
  isFounder = false,
  className,
}: AIUsageCounterProps) {
  const atLimit = canAccess && limit > 0 && used >= limit;

  return (
    <p
      className={cn(
        "text-sm",
        atLimit ? "font-medium text-amber-700 dark:text-amber-400" : "text-zg-text-muted",
        className,
      )}
      aria-live="polite"
    >
      {loading ? (
        "Chargement de l'usage IA…"
      ) : isFounder ? (
        <>
          Accès fondateur : IA activée
          <span className="mt-1 block text-zg-text-muted">
            Utilisations IA ce mois-ci : {used} / {limit}
          </span>
        </>
      ) : !canAccess || limit === 0 ? (
        "Les outils IA sont disponibles avec le plan Pro (69 CHF/mois)."
      ) : (
        <>
          Utilisations IA ce mois-ci : {used} / {limit}
          {atLimit ? (
            <span className="mt-1 block text-amber-700 dark:text-amber-400">
              Votre limite IA mensuelle est atteinte. Passez à un plan supérieur ou réessayez le mois
              prochain.
            </span>
          ) : null}
        </>
      )}
    </p>
  );
}
