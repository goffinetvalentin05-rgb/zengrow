"use client";

import { Bell, ExternalLink, Menu } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { buttonClassName } from "@/src/components/ui/button";

type DashboardTopBarProps = {
  publicLink: string;
  restaurantName: string;
  userInitials: string;
  onOpenMobileNav?: () => void;
  /** Futur : brancher sur des événements réels (résas, avis…). */
  hasNotifications?: boolean;
};

export default function DashboardTopBar({
  publicLink,
  restaurantName,
  userInitials,
  onOpenMobileNav,
  hasNotifications = false,
}: DashboardTopBarProps) {
  const initials = (userInitials || "?").slice(0, 2).toUpperCase();

  return (
    <header
      className={cn(
        "flex h-16 shrink-0 items-center justify-between gap-4 border-b border-zg-border bg-zg-surface px-4 transition-colors duration-150 md:px-8",
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-zg-fg transition-all duration-150 hover:bg-zg-surface-elevated md:hidden"
          aria-label="Ouvrir le menu"
          onClick={onOpenMobileNav}
        >
          <Menu className="h-5 w-5" strokeWidth={2} />
        </button>
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-zg-text-muted">Espace restaurant</p>
          <p className="mt-0.5 truncate text-sm font-semibold text-zg-fg">{restaurantName}</p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <a
          href={publicLink}
          target="_blank"
          rel="noreferrer"
          className={buttonClassName({
            variant: "secondary",
            size: "sm",
            className: "hidden sm:inline-flex",
          })}
        >
          <ExternalLink className="h-4 w-4" strokeWidth={2} aria-hidden />
          Page publique
        </a>

        <button
          type="button"
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg text-zg-text-secondary transition-all duration-150 hover:bg-zg-surface-elevated hover:text-zg-fg"
          aria-label="Notifications"
        >
          <Bell className="h-[18px] w-[18px]" strokeWidth={1.75} />
          {hasNotifications ? (
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-zg-accent ring-2 ring-zg-surface" />
          ) : null}
        </button>

        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zg-accent-soft-bg text-xs font-semibold text-zg-accent-soft-text ring-1 ring-zg-border-accent"
          aria-hidden
        >
          {initials}
        </div>
      </div>
    </header>
  );
}
