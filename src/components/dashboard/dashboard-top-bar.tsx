"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, Menu } from "lucide-react";
import NotificationBell from "@/src/components/dashboard/notifications/notification-bell";
import { useDashboardI18n } from "@/src/components/dashboard/i18n/dashboard-locale-provider";
import { useDashboardTitleMeta } from "@/src/components/dashboard/dashboard-title-context";
import { SHARPZ_ROUTES } from "@/src/lib/sharpz/routes";
import { cn } from "@/src/lib/utils";

type DashboardTopBarProps = {
  onOpenMobileNav?: () => void;
};

function sectionFromPath(pathname: string, t: { nav: Record<string, string> }) {
  if (pathname.startsWith("/dashboard/settings")) return t.nav.settings;
  if (pathname.startsWith("/dashboard/today")) return t.nav.today;
  if (pathname.startsWith("/dashboard/prospects")) return t.nav.prospects;
  if (pathname.startsWith("/dashboard/analytics")) return t.nav.analytics;
  if (pathname.startsWith("/dashboard/results")) return t.nav.results;
  if (pathname === "/dashboard" || pathname === "/dashboard/") return t.nav.agent;
  return t.nav.agent;
}

export default function DashboardTopBar({ onOpenMobileNav }: DashboardTopBarProps) {
  const { t } = useDashboardI18n();
  const pathname = usePathname();
  const meta = useDashboardTitleMeta();
  const section = sectionFromPath(pathname, t);
  const onAgent = pathname === "/dashboard" || pathname === "/dashboard/";

  return (
    <header className="relative flex h-16 shrink-0 items-center gap-3 border-b border-white/[0.06] px-4 md:h-[68px] md:px-7">
      <button
        type="button"
        className="-ml-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-zg-text-secondary transition-colors duration-200 ease-out hover:bg-white/[0.05] hover:text-zg-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25 md:hidden"
        aria-label={t.nav.menu}
        onClick={onOpenMobileNav}
      >
        <Menu className="h-5 w-5" strokeWidth={1.75} />
      </button>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold tracking-tight text-zg-fg">{section}</p>
        {meta?.subtitle ? (
          <p className="mt-0.5 hidden truncate text-xs text-zg-muted md:block">{meta.subtitle}</p>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        {!onAgent ? (
          <Link
            href={SHARPZ_ROUTES.agent}
            className={cn(
              "inline-flex h-10 items-center gap-2 rounded-2xl border border-white/[0.1] bg-white/[0.03] px-3.5 text-[13px] font-medium text-zg-text-secondary",
              "shadow-[0_1px_0_rgba(255,255,255,0.05)_inset] transition-colors hover:border-white/[0.16] hover:bg-white/[0.06] hover:text-zg-fg",
            )}
          >
            <Bot className="h-4 w-4" strokeWidth={1.75} />
            <span className="hidden sm:inline">{t.nav.agent}</span>
          </Link>
        ) : null}
        <NotificationBell />
      </div>
    </header>
  );
}
