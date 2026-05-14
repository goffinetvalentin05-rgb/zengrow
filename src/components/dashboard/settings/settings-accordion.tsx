"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/src/lib/utils";

type SettingsAccordionProps = {
  title: string;
  children: React.ReactNode;
  /** Bordure rouge subtile (zone sensible). */
  danger?: boolean;
  className?: string;
};

export function SettingsAccordion({ title, children, danger, className }: SettingsAccordionProps) {
  const [open, setOpen] = useState(false);
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
          "hover:bg-[#1F1A15]",
        )}
      >
        <span className="text-base font-medium text-zg-fg">{title}</span>
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
