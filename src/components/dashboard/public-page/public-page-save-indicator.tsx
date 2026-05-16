"use client";

import { cn } from "@/src/lib/utils";

export type PublicPageSaveStatus = "idle" | "pending" | "saving" | "saved" | "error";

type PublicPageSaveIndicatorProps = {
  status: PublicPageSaveStatus;
  errorMessage?: string | null;
  className?: string;
};

export default function PublicPageSaveIndicator({
  status,
  errorMessage,
  className,
}: PublicPageSaveIndicatorProps) {
  if (status === "idle") return null;

  const label =
    status === "pending"
      ? "Enregistrement…"
      : status === "saving"
        ? "Enregistrement…"
        : status === "saved"
          ? "Enregistré"
          : errorMessage ?? "Erreur d'enregistrement";

  return (
    <p
      className={cn(
        "pointer-events-none fixed bottom-4 right-4 z-30 rounded-full border border-zg-border bg-zg-surface/95 px-3 py-1.5 text-xs font-medium shadow-lg backdrop-blur-sm",
        status === "error" ? "text-amber-700" : "text-zg-text-muted",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      {label}
    </p>
  );
}
