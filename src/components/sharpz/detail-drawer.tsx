"use client";

import { X } from "lucide-react";
import type { ReactNode } from "react";
import DashboardPortal from "@/src/components/dashboard/ui/dashboard-portal";
import { useDashboardI18n } from "@/src/components/dashboard/i18n/dashboard-locale-provider";
import { cn } from "@/src/lib/utils";

type Props = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
};

export function SharpzDetailDrawer({ open, title, onClose, children, footer }: Props) {
  const { t } = useDashboardI18n();
  if (!open) return null;

  return (
    <DashboardPortal>
      <div
        className="fixed inset-0 z-50 flex items-stretch justify-center bg-black/50 p-0 sm:items-center sm:p-4"
        role="presentation"
        onClick={onClose}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className="flex h-[100dvh] w-full max-w-[700px] flex-col overflow-hidden border-0 border-zg-border bg-zg-surface shadow-xl sm:h-auto sm:max-h-[min(92dvh,860px)] sm:rounded-2xl sm:border"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex shrink-0 items-start justify-between gap-4 px-5 pt-5 sm:px-6">
            <h2 className="min-w-0 text-xl font-semibold leading-tight text-zg-fg sm:text-2xl">{title}</h2>
            <button
              type="button"
              aria-label={t.common.close}
              onClick={onClose}
              className="rounded-lg p-2 text-zg-muted transition-colors hover:bg-zg-card-hover hover:text-zg-fg"
            >
              <X className="h-5 w-5" strokeWidth={2} />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6">{children}</div>
          {footer ? (
            <div className={cn("shrink-0 border-t border-zg-border px-5 py-4 sm:px-6")}>{footer}</div>
          ) : null}
        </div>
      </div>
    </DashboardPortal>
  );
}
