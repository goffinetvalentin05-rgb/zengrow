"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Search } from "lucide-react";
import NotificationBell from "@/src/components/dashboard/notifications/notification-bell";
import { cn } from "@/src/lib/utils";
import { buttonClassName } from "@/src/components/ui/button";

type DashboardTopBarProps = {
  publicLink: string;
  restaurantName: string;
  userDisplayName: string;
  userRoleLabel: string;
  userInitials: string;
  userAvatarUrl?: string | null;
  onOpenMobileNav?: () => void;
};

export default function DashboardTopBar({
  publicLink,
  restaurantName: _restaurantName,
  userDisplayName,
  userRoleLabel,
  userInitials,
  userAvatarUrl,
  onOpenMobileNav,
}: DashboardTopBarProps) {
  void _restaurantName;
  const initials = (userInitials || "?").slice(0, 2).toUpperCase();
  const [search, setSearch] = useState("");
  const [searchOverlayOpen, setSearchOverlayOpen] = useState(false);

  const overlayTransition = { type: "tween" as const, duration: 0.25, ease: [0, 0, 0.2, 1] as const };

  useEffect(() => {
    if (!searchOverlayOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setSearchOverlayOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [searchOverlayOpen]);

  return (
    <header
      className={cn(
        "relative flex h-[72px] shrink-0 items-center justify-between gap-4 bg-zg-app px-4 transition-colors duration-200 ease-out md:px-8",
      )}
    >
      <AnimatePresence>
        {searchOverlayOpen ? (
          <motion.div
            key="dashboard-search-overlay"
            className="fixed inset-0 z-[60] md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={overlayTransition}
          >
            <button
              type="button"
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              aria-label="Fermer la recherche"
              onClick={() => setSearchOverlayOpen(false)}
            />
            <div className="absolute left-4 right-4 top-[72px] z-10 rounded-2xl border border-zg-border bg-zg-surface p-4 shadow-2xl shadow-black/35">
              <label className="relative block">
                <Search
                  className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-zg-text-muted"
                  strokeWidth={1.75}
                  aria-hidden
                />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher..."
                  className="h-11 w-full rounded-xl border border-zg-border bg-zg-app py-2 pl-10 pr-4 text-sm text-zg-fg outline-none transition-all duration-200 ease-out placeholder:text-zg-text-placeholder focus:border-zg-border-focus focus:ring-2 focus:ring-zg-accent/25"
                  autoComplete="off"
                  autoFocus
                />
              </label>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
        <button
          type="button"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-zg-fg transition-all duration-200 ease-out hover:bg-zg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zg-accent focus-visible:ring-offset-2 focus-visible:ring-offset-zg-app md:hidden"
          aria-label="Ouvrir le menu de navigation"
          onClick={onOpenMobileNav}
        >
          <Menu className="h-5 w-5" strokeWidth={2} />
        </button>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <button
          type="button"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-zg-fg transition-all duration-200 ease-out hover:bg-zg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zg-accent focus-visible:ring-offset-2 focus-visible:ring-offset-zg-app md:hidden"
          aria-label="Ouvrir la recherche"
          onClick={() => setSearchOverlayOpen(true)}
        >
          <Search className="h-5 w-5" strokeWidth={2} />
        </button>

        <label className="relative hidden w-64 md:block">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-zg-text-muted"
            strokeWidth={1.75}
            aria-hidden
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher..."
            className="h-10 w-full rounded-full border border-zg-border bg-zg-surface py-2 pl-10 pr-4 text-sm text-zg-fg outline-none transition-all duration-200 ease-out placeholder:text-zg-text-placeholder focus:border-zg-border-focus focus:ring-2 focus:ring-zg-accent/20"
            autoComplete="off"
          />
        </label>

        <NotificationBell />

        <div className="flex min-w-0 items-center gap-3 sm:pl-1">
          {userAvatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={userAvatarUrl}
              alt=""
              className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-zg-border"
            />
          ) : (
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zg-accent text-sm font-semibold text-white shadow-[0_0_20px_-6px_rgba(232,93,44,0.55)]"
              aria-hidden
            >
              {initials}
            </div>
          )}
          <div className="hidden min-w-0 sm:block">
            <p className="truncate text-sm font-medium text-zg-fg">{userDisplayName}</p>
            <p className="truncate text-xs text-zg-text-muted">{userRoleLabel}</p>
          </div>
        </div>

        <Link
          href="/dashboard/public-page"
          className={buttonClassName({
            variant: "secondary",
            size: "sm",
            className: "hidden lg:inline-flex shrink-0",
          })}
        >
          Page publique
        </Link>
      </div>
    </header>
  );
}
