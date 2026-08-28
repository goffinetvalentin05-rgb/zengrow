"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/src/lib/utils";

const stepTransition = {
  duration: 0.38,
  ease: [0.22, 1, 0.36, 1] as const,
};

export function OnboardingStepFrame({
  stepKey,
  children,
}: {
  stepKey: string;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={stepKey}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={stepTransition}
        className="w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export function OnboardingProgress({ current, total, label }: { current: number; total: number; label: string }) {
  const ratio = Math.min(1, Math.max(0, current / total));
  return (
    <div className="mb-10">
      <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.18em] text-zg-text-muted">{label}</p>
      <div className="h-[2px] w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-white transition-[width] duration-500 ease-out"
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
    </div>
  );
}

export function ChoiceButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-2xl border px-4 py-3 text-left text-sm font-medium transition-all duration-200",
        active
          ? "border-white/40 bg-white/[0.08] text-white"
          : "border-white/10 bg-white/[0.03] text-zg-text-secondary hover:border-white/20 hover:bg-white/[0.06] hover:text-zg-fg",
      )}
    >
      {children}
    </button>
  );
}

export function ChecklistRow({
  label,
  state,
  foundLabel,
  missingLabel,
}: {
  label: string;
  state: "pending" | "found" | "missing";
  foundLabel: string;
  missingLabel: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 rounded-2xl border px-4 py-3.5 transition-all duration-500",
        state === "pending" && "border-white/8 bg-white/[0.02] opacity-50",
        state === "found" && "border-white/12 bg-white/[0.04] opacity-100",
        state === "missing" && "border-white/8 bg-transparent opacity-80",
      )}
    >
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-full border text-[11px]",
            state === "found" && "border-zg-accent/40 bg-zg-accent/20 text-white",
            state === "missing" && "border-white/15 text-zg-text-muted",
            state === "pending" && "border-white/10",
          )}
        >
          {state === "found" ? <Check className="h-3.5 w-3.5" strokeWidth={2.4} /> : null}
        </span>
        <span className="text-sm text-zg-fg">{label}</span>
      </div>
      {state !== "pending" ? (
        <span className={cn("text-xs", state === "found" ? "text-zg-accent" : "text-zg-text-muted")}>
          {state === "found" ? foundLabel : missingLabel}
        </span>
      ) : null}
    </div>
  );
}
