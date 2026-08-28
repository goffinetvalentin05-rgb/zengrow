"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, Menu } from "lucide-react";
import NotificationBell from "@/src/components/dashboard/notifications/notification-bell";
import { useDashboardI18n } from "@/src/components/dashboard/i18n/dashboard-locale-provider";
import { SHARPZ_ROUTES } from "@/src/lib/sharpz/routes";
import { cn } from "@/src/lib/utils";

type DashboardTopBarProps = {
  onOpenMobileNav?: () => void;
  userDisplayName?: string;
  userInitials?: string;
  userAvatarUrl?: string | null;
};

export default function DashboardTopBar({
  onOpenMobileNav,
  userDisplayName,
  userInitials,
  userAvatarUrl,
}: DashboardTopBarProps) {
  const { t } = useDashboardI18n();
  const pathname = usePathname();
  const onAgent = pathname === "/dashboard" || pathname === "/dashboard/";
  const initials = (userInitials || "?").slice(0, 2).toUpperCase();

  return (
    <header className="relative flex h-16 shrink-0 items-center gap-3 px-4 md:h-[72px] md:px-8">
      <button
        type="button"
        className="-ml-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-zg-text-secondary transition-colors duration-200 ease-out hover:bg-white/[0.05] hover:text-zg-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25 md:hidden"
        aria-label={t.nav.menu}
        onClick={onOpenMobileNav}
      >
        <Menu className="h-5 w-5" strokeWidth={1.75} />
      </button>

      <div className="min-w-0 flex-1" />

      <div className="flex shrink-0 items-center gap-2">
        {!onAgent ? (
          <Link
            href={SHARPZ_ROUTES.agent}
            className={cn(
              "inline-flex h-10 items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3.5 text-[13px] font-medium text-zg-text-secondary",
              "transition-colors hover:border-[#cbb4dc]/30 hover:bg-white/[0.05] hover:text-zg-fg",
            )}
          >
            <Bot className="h-4 w-4" strokeWidth={1.75} />
            <span className="hidden sm:inline">{t.nav.agent}</span>
          </Link>
        ) : null}
        <NotificationBell />
        <div className="hidden items-center gap-2.5 rounded-full border border-white/[0.08] bg-white/[0.03] py-1 pl-1 pr-3 sm:flex">
          {userAvatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={userAvatarUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
          ) : (
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.06] text-[11px] font-semibold text-zg-fg">
              {initials}
            </span>
          )}
          <span className="max-w-[140px] truncate text-[13px] font-medium text-zg-fg">
            {userDisplayName ?? "—"}
          </span>
        </div>
      </div>
    </header>
  );
}
