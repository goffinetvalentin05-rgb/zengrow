"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { ReservationRow } from "@/src/components/dashboard/reservations/types";
import { isArrivalWindowOpen } from "@/src/components/dashboard/reservations/utils/reservation-list-metadata";
import { useIsMdUp } from "@/src/hooks/use-is-md-up";
import { cn } from "@/src/lib/utils";
import { Check, MoreHorizontal, Pencil, Phone, X } from "lucide-react";

export type ReservationListRowActionHandlers = {
  onArrived: () => void;
  onCancel: () => void;
  onCall: () => void;
  onEdit: () => void;
};

type ReservationListRowActionsProps = {
  reservation: ReservationRow;
  handlers: ReservationListRowActionHandlers;
  disabled?: boolean;
  className?: string;
};

type ActionItem = {
  key: string;
  label: string;
  icon: typeof Check;
  onClick: () => void;
  tone?: "default" | "success" | "danger";
  visible: boolean;
  disabled?: boolean;
};

function actionButtonClass(tone: ActionItem["tone"]) {
  return cn(
    "rounded-lg p-2 transition-colors duration-150",
    tone === "success" && "text-zg-success hover:bg-zg-success-soft-bg",
    tone === "danger" && "text-zg-danger hover:bg-zg-danger-soft-bg",
    (!tone || tone === "default") && "text-zg-muted hover:bg-zg-card-hover hover:text-zg-fg",
  );
}

function buildVisibleActions(
  reservation: ReservationRow,
  handlers: ReservationListRowActionHandlers,
): ActionItem[] {
  const hasPhone = Boolean(reservation.guest_phone?.trim());
  const showArrival =
    isArrivalWindowOpen(reservation) &&
    reservation.status !== "cancelled" &&
    reservation.status !== "completed";

  const items: ActionItem[] = [
    {
      key: "arrived",
      label: "Marquer arrivée",
      icon: Check,
      onClick: handlers.onArrived,
      tone: "success",
      visible: showArrival,
    },
    {
      key: "cancel",
      label: "Annuler",
      icon: X,
      onClick: handlers.onCancel,
      tone: "danger",
      visible: reservation.status !== "cancelled" && reservation.status !== "completed",
    },
    {
      key: "call",
      label: "Appeler",
      icon: Phone,
      onClick: handlers.onCall,
      visible: true,
      disabled: !hasPhone,
    },
    {
      key: "edit",
      label: "Modifier",
      icon: Pencil,
      onClick: handlers.onEdit,
      visible: true,
    },
  ];
  return items.filter((item) => item.visible);
}

function ActionButtons({
  items,
  disabled,
}: {
  items: ActionItem[];
  disabled?: boolean;
}) {
  return (
    <>
      {items.map(({ key, label, icon: Icon, onClick, tone, disabled: itemDisabled }) => (
        <button
          key={key}
          type="button"
          title={label}
          aria-label={label}
          disabled={disabled || itemDisabled}
          onClick={onClick}
          className={cn(
            actionButtonClass(tone),
            itemDisabled && "cursor-not-allowed opacity-40",
          )}
        >
          <Icon className="h-4 w-4" strokeWidth={2} aria-hidden />
        </button>
      ))}
    </>
  );
}

function MobileActionsMenu({
  items,
  disabled,
}: {
  items: ActionItem[];
  disabled?: boolean;
}) {
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (!open) return;
      if (rootRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (open && e.key === "Escape") setOpen(false);
    }
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        aria-haspopup="menu"
        aria-controls={menuId}
        aria-expanded={open}
        aria-label="Actions"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className="rounded-lg p-2 text-zg-muted transition-colors hover:bg-zg-card-hover hover:text-zg-fg"
      >
        <MoreHorizontal className="h-4 w-4" strokeWidth={2} aria-hidden />
      </button>
      {open ? (
        <div
          id={menuId}
          role="menu"
          className="absolute right-0 z-50 mt-1 min-w-44 overflow-hidden rounded-xl border border-zg-border bg-zg-surface p-1 shadow-zg-sidebar"
        >
          {items.map(({ key, label, onClick, tone, disabled: itemDisabled }) => (
            <button
              key={key}
              type="button"
              role="menuitem"
              disabled={disabled || itemDisabled}
              onClick={() => {
                onClick();
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors duration-150",
                tone === "danger"
                  ? "text-zg-danger hover:bg-zg-danger-soft-bg"
                  : tone === "success"
                    ? "text-zg-success hover:bg-zg-success-soft-bg"
                    : "text-zg-fg hover:bg-zg-card-hover",
                itemDisabled && "cursor-not-allowed opacity-40",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function ReservationListRowActions({
  reservation,
  handlers,
  disabled = false,
  className,
}: ReservationListRowActionsProps) {
  const isMdUp = useIsMdUp();
  const items = buildVisibleActions(reservation, handlers);

  if (items.length === 0) return null;

  return (
    <div
      className={cn(
        "flex shrink-0 items-center",
        isMdUp &&
          "opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100",
        className,
      )}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      {isMdUp ? (
        <ActionButtons items={items} disabled={disabled} />
      ) : (
        <MobileActionsMenu items={items} disabled={disabled} />
      )}
    </div>
  );
}
