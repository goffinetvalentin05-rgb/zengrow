"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import Button from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";

export type ActionMenuItem =
  | {
      kind: "action";
      label: string;
      onClick: () => void;
      icon?: React.ReactNode;
      tone?: "default" | "danger";
      disabled?: boolean;
    }
  | {
      kind: "link";
      label: string;
      href: string;
      icon?: React.ReactNode;
      tone?: "default" | "danger";
      disabled?: boolean;
      external?: boolean;
    };

type ActionMenuProps = {
  items: ActionMenuItem[];
  label?: string;
  className?: string;
};

export default function ActionMenu({ items, label = "Actions", className }: ActionMenuProps) {
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (!open) return;
      const root = rootRef.current;
      if (!root) return;
      if (root.contains(e.target as Node)) return;
      setOpen(false);
    }

    function onKeyDown(e: KeyboardEvent) {
      if (!open) return;
      if (e.key === "Escape") setOpen(false);
    }

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        aria-haspopup="menu"
        aria-controls={menuId}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <MoreHorizontal className="h-4 w-4" strokeWidth={2} />
        {label}
      </Button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          className="absolute right-0 z-50 mt-2 min-w-52 overflow-hidden rounded-2xl border border-zg-border bg-zg-surface p-1 shadow-zg-sidebar"
        >
          {items.map((item) => {
            const itemClass = cn(
              "flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-all duration-200 ease-out",
              item.tone === "danger"
                ? "text-zg-danger hover:bg-zg-danger-soft-bg disabled:opacity-50"
                : "text-zg-text-secondary hover:bg-zg-card-hover hover:text-zg-fg disabled:opacity-50",
            );

            if (item.kind === "link") {
              const content = (
                <>
                  {item.icon ? <span className="shrink-0">{item.icon}</span> : null}
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                </>
              );

              return item.external ? (
                <a
                  key={item.label}
                  role="menuitem"
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className={itemClass}
                  onClick={() => setOpen(false)}
                >
                  {content}
                </a>
              ) : (
                <Link key={item.label} role="menuitem" href={item.href} className={itemClass} onClick={() => setOpen(false)}>
                  {content}
                </Link>
              );
            }

            return (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                disabled={item.disabled}
                onClick={() => {
                  if (item.disabled) return;
                  item.onClick();
                  setOpen(false);
                }}
                className={itemClass}
              >
                {item.icon ? <span className="shrink-0">{item.icon}</span> : null}
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

