"use client";

import { Menu } from "lucide-react";
import NotificationBell from "@/src/components/dashboard/notifications/notification-bell";
import { useDashboardI18n } from "@/src/components/dashboard/i18n/dashboard-locale-provider";

type DashboardTopBarProps = {
  onOpenMobileNav?: () => void;
};

export default function DashboardTopBar({ onOpenMobileNav }: DashboardTopBarProps) {
  const { t } = useDashboardI18n();

  return (
    <header className="relative flex h-14 shrink-0 items-center justify-between gap-4 bg-transparent px-4 md:h-16 md:px-10">
      <button
        type="button"
        className="-ml-2 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-zg-text-secondary transition-colors duration-200 ease-out hover:bg-white/[0.05] hover:text-zg-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25 md:hidden"
        aria-label={t.nav.menu}
        onClick={onOpenMobileNav}
      >
        <Menu className="h-5 w-5" strokeWidth={1.75} />
      </button>

      <div className="ml-auto flex shrink-0 items-center gap-1">
        <NotificationBell />
      </div>
    </header>
  );
}
