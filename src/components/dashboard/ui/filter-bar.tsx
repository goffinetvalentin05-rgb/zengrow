"use client";

import { ReactNode } from "react";
import { cn } from "@/src/lib/utils";

type FilterBarProps = {
  className?: string;
  children: ReactNode;
  right?: ReactNode;
};

export default function FilterBar({ className, children, right }: FilterBarProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-2xl border border-zg-border bg-zg-surface px-4 py-3 transition-all duration-200 ease-out md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 flex-wrap items-end gap-3">{children}</div>
      {right ? <div className="flex shrink-0 items-center gap-2 md:pb-[2px]">{right}</div> : null}
    </div>
  );
}

