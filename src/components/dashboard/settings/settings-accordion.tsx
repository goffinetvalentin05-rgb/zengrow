"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/src/lib/utils";

type SettingsAccordionProps = {
  title: string;
  /** Courte phrase d’aide sous le titre. */
  description?: string;
  children: React.ReactNode;
  /** Bordure rouge subtile (zone sensible). */
  danger?: boolean;
  className?: string;
  defaultOpen?: boolean;
};

export function SettingsAccordion({
  title,
  description,
  children,
  danger,
  className,
  defaultOpen = false,
}: SettingsAccordionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-zg-border bg-zg-surface-elevated transition-colors",
        danger && "border-red-600/30",
        className,
      )}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex w-full items-center justify-between gap-3 p-4 text-left transition-colors duration-200 ease-out",
          "hover:bg-zg-card-hover",
        )}
      >
        <span className="min-w-0">
          <span className="block text-base font-medium text-zg-fg">{title}</span>
          {description ? (
            <span className="mt-0.5 block text-xs font-normal leading-relaxed text-zg-text-muted">{description}</span>
          ) : null}
        </span>
        <ChevronDown
          className={cn("h-5 w-5 shrink-0 text-zg-text-muted transition-transform duration-200 ease-out", open && "rotate-180")}
          aria-hidden
        />
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            id={panelId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] }}
            className="overflow-hidden border-t border-zg-border/50"
          >
            <div className="p-4 pt-3">{children}</div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
