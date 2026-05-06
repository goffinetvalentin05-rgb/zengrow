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
        "mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zg-border-strong/85 bg-zg-surface/70 px-4 py-3 shadow-zg-soft backdrop-blur-md md:mb-8 md:px-5",
      )}
    >
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zg-fg/46">Espace restaurant</p>
        <p className="mt-1 truncate text-sm font-semibold text-zg-fg">{restaurantName}</p>
      </div>
      <a
        href={publicLink}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center rounded-xl px-3 py-2 text-xs font-semibold text-zg-fg/55 transition hover:bg-zg-surface-soft/90 hover:text-zg-fg"
      >
        Ouvrir la page publique
      </a>
    </header>
  );
}
