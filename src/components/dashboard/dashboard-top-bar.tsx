"use client";

import { Menu, Sparkles } from "lucide-react";
import NotificationBell from "@/src/components/dashboard/notifications/notification-bell";
import { useDashboardI18n } from "@/src/components/dashboard/i18n/dashboard-locale-provider";
import { cn } from "@/src/lib/utils";

type DashboardTopBarProps = {
  userDisplayName: string;
  userRoleLabel: string;
  userInitials: string;
  userAvatarUrl?: string | null;
  onOpenMobileNav?: () => void;
  onOpenAssistant?: () => void;
};

export default function DashboardTopBar({
  userDisplayName,
  userRoleLabel,
  userInitials,
  userAvatarUrl,
  onOpenMobileNav,
  onOpenAssistant,
}: DashboardTopBarProps) {
  const { t } = useDashboardI18n();
  const initials = (userInitials || "?").slice(0, 2).toUpperCase();

  return (
    <header
      className={cn(
        "relative flex h-[72px] shrink-0 items-center justify-between gap-4 border-b border-zg-border/60 bg-zg-app/80 px-4 backdrop-blur-md transition-colors duration-200 ease-out md:px-8",
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
        <button
          type="button"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-zg-fg transition-all duration-200 ease-out hover:bg-zg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zg-accent focus-visible:ring-offset-2 focus-visible:ring-offset-zg-app md:hidden"
          aria-label={t.nav.menu}
          onClick={onOpenMobileNav}
        >
          <Menu className="h-5 w-5" strokeWidth={2} />
        </button>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onOpenAssistant}
          className="inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium text-zg-fg transition-all duration-200 ease-out hover:bg-zg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zg-accent focus-visible:ring-offset-2 focus-visible:ring-offset-zg-app"
          aria-label={t.assistant.open}
        >
          <Sparkles className="h-4 w-4 text-zg-accent" strokeWidth={2} />
          <span className="hidden sm:inline">{t.nav.assistant}</span>
        </button>
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
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#7c5cff] to-[#6366f1] text-sm font-semibold text-white shadow-[0_0_20px_-6px_rgba(124,92,255,0.55)]"
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
      </div>
    </header>
  );
}
