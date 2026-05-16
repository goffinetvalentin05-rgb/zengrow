"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { CustomerRecord } from "@/src/components/dashboard/customers/types";
import { cn } from "@/src/lib/utils";
import { Mail, MoreHorizontal, Pencil, Phone } from "lucide-react";

export type CustomerListRowActionHandlers = {
  onEmail: () => void;
  onCall: () => void;
  onEdit: () => void;
};

type CustomerListRowActionsProps = {
  customer: CustomerRecord;
  handlers: CustomerListRowActionHandlers;
  className?: string;
};

type ActionItem = {
  key: string;
  label: string;
  icon: typeof Mail;
  onClick: () => void;
  disabled?: boolean;
};

function buildActions(
  customer: CustomerRecord,
  handlers: CustomerListRowActionHandlers,
): ActionItem[] {
  const hasEmail = Boolean(customer.email?.trim());
  const hasPhone = Boolean(customer.phone?.trim());

  return [
    {
      key: "email",
      label: "Envoyer email",
      icon: Mail,
      onClick: handlers.onEmail,
      disabled: !hasEmail,
    },
    {
      key: "call",
      label: "Appeler",
      icon: Phone,
      onClick: handlers.onCall,
      disabled: !hasPhone,
    },
    {
      key: "edit",
      label: "Modifier",
      icon: Pencil,
      onClick: handlers.onEdit,
    },
  ];
}

function ActionButtons({ items }: { items: ActionItem[] }) {
  return (
    <>
      {items.map(({ key, label, icon: Icon, onClick, disabled }) => (
        <button
          key={key}
          type="button"
          title={label}
          aria-label={label}
          disabled={disabled}
          onClick={onClick}
          className={cn(
            "rounded-lg p-2 text-zg-muted transition-colors duration-150 hover:bg-zg-card-hover hover:text-zg-fg",
            disabled && "cursor-not-allowed opacity-40",
          )}
        >
          <Icon className="h-4 w-4" strokeWidth={2} aria-hidden />
        </button>
      ))}
    </>
  );
}

function MobileActionsMenu({ items }: { items: ActionItem[] }) {
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
        aria-label="Actions client"
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
          {items.map(({ key, label, onClick, disabled }) => (
            <button
              key={key}
              type="button"
              role="menuitem"
              disabled={disabled}
              onClick={() => {
                onClick();
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center rounded-lg px-3 py-2 text-left text-sm font-medium text-zg-fg transition-colors hover:bg-zg-card-hover",
                disabled && "cursor-not-allowed opacity-40",
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

export default function CustomerListRowActions({
  customer,
  handlers,
  className,
}: CustomerListRowActionsProps) {
  const items = buildActions(customer, handlers);

  return (
    <div
      className={cn("flex shrink-0 items-center", className)}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <div
        className={cn(
          "hidden items-center sm:flex",
          "opacity-0 transition-opacity duration-150 group-hover:opacity-100",
        )}
      >
        <ActionButtons items={items} />
      </div>
      <div className="flex items-center sm:hidden">
        <MobileActionsMenu items={items} />
      </div>
    </div>
  );
}
