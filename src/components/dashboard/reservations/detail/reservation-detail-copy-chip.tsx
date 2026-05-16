"use client";

import { useState } from "react";
import { useDashboardToast } from "@/src/components/dashboard/dashboard-toast-provider";
import { cn } from "@/src/lib/utils";
import { Check, Copy } from "lucide-react";

type ReservationDetailCopyChipProps = {
  label: string;
  value: string;
  className?: string;
};

export default function ReservationDetailCopyChip({
  label,
  value,
  className,
}: ReservationDetailCopyChipProps) {
  const showToast = useDashboardToast();
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      showToast({ message: `${label} copié` });
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast({ message: "Impossible de copier" });
    }
  }

  return (
    <button
      type="button"
      onClick={() => void handleCopy()}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border border-zg-border px-2.5 py-1 text-xs font-medium text-zg-text-secondary transition-colors duration-150",
        "hover:border-zg-border-hover hover:bg-zg-card-hover hover:text-zg-fg",
        className,
      )}
      aria-label={`Copier ${label}`}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-zg-success" aria-hidden />
      ) : (
        <Copy className="h-3.5 w-3.5" aria-hidden />
      )}
      Copier
    </button>
  );
}
