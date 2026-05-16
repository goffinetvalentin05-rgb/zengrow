import type { ReactNode } from "react";
import { cn } from "@/src/lib/utils";

type MarketingEmptyPanelProps = {
  children: ReactNode;
  className?: string;
};

export default function MarketingEmptyPanel({ children, className }: MarketingEmptyPanelProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-zg-border bg-zg-surface px-5 py-10 sm:px-8 sm:py-14",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(232,93,44,0.07),transparent_58%)]"
      />
      <div className="relative">{children}</div>
    </div>
  );
}
