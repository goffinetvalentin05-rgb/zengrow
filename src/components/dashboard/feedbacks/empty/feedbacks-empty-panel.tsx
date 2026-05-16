import type { ReactNode } from "react";
import { cn } from "@/src/lib/utils";

type FeedbacksEmptyPanelProps = {
  children: ReactNode;
  className?: string;
};

export default function FeedbacksEmptyPanel({ children, className }: FeedbacksEmptyPanelProps) {
  return (
    <div
      className={cn(
        "flex min-h-[min(320px,50vh)] flex-col items-center justify-center rounded-2xl border border-zg-border bg-zg-surface px-6 py-12 sm:py-16",
        className,
      )}
    >
      {children}
    </div>
  );
}
