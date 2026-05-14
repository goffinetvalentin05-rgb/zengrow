"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { CheckCircle2 } from "lucide-react";

export type DashboardToastInput = {
  message: string;
  icon?: LucideIcon;
};

type ToastItem = DashboardToastInput & { id: string };

const noop = () => {};

const DashboardToastContext = createContext<(input: DashboardToastInput) => void>(noop);

export function useDashboardToast() {
  return useContext(DashboardToastContext);
}

export function DashboardToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const showToast = useCallback((input: DashboardToastInput) => {
    const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
    setItems((prev) => [...prev, { ...input, id }]);
    window.setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const value = useMemo(() => showToast, [showToast]);

  return (
    <DashboardToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[200] flex w-[min(100%,380px)] flex-col gap-2 p-3 sm:bottom-6 sm:right-6">
        <AnimatePresence initial={false} mode="popLayout">
          {items.map((t) => {
            const Icon = t.icon ?? CheckCircle2;
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ x: 48, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 48, opacity: 0 }}
                transition={{ duration: 0.2, ease: [0.33, 1, 0.68, 1] }}
                className="pointer-events-auto flex items-start gap-3 rounded-xl border border-zg-accent/30 bg-zg-surface-elevated px-4 py-3 text-sm leading-snug text-zg-fg shadow-2xl shadow-black/40 ring-1 ring-zg-accent/20"
                role="status"
              >
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-zg-accent" aria-hidden />
                <p className="min-w-0 flex-1">{t.message}</p>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </DashboardToastContext.Provider>
  );
}
