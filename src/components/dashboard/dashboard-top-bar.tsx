"use client";

import { cn } from "@/src/lib/utils";

type DashboardTopBarProps = {
  publicLink: string;
  restaurantName: string;
};

export default function DashboardTopBar({ publicLink, restaurantName }: DashboardTopBarProps) {
  return (
    <header
      className={cn(
        "mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zg-border bg-zg-surface px-4 py-3.5 shadow-zg-soft md:mb-7 md:px-5",
      )}
    >
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zg-fg-muted">Espace restaurant</p>
        <p className="mt-1 truncate text-sm font-semibold tracking-tight text-zg-fg">{restaurantName}</p>
      </div>
      <a
        href={publicLink}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center rounded-xl border border-transparent px-3 py-2 text-xs font-semibold text-zg-muted transition hover:border-zg-border hover:bg-zg-highlight/60 hover:text-zg-fg"
      >
        Ouvrir la page publique
      </a>
    </header>
  );
}
