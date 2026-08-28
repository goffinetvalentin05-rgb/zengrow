"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  CalendarDays,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Radar,
  Settings,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { createClient } from "@/src/lib/supabase/client";
import { cn } from "@/src/lib/utils";
import { buttonClassName } from "@/src/components/ui/button";
import CompactProUpsell from "@/src/components/dashboard/sidebar/compact-pro-upsell";
import { DashboardThemeToggle } from "@/src/components/dashboard/dashboard-theme-toggle";
import { useDashboardTheme } from "@/src/components/dashboard/dashboard-theme-provider";
import { DashboardLocaleSwitch } from "@/src/components/dashboard/i18n/dashboard-locale-switch";
import { useDashboardI18n } from "@/src/components/dashboard/i18n/dashboard-locale-provider";
import { useIsMdUp } from "@/src/hooks/use-is-md-up";

const STORAGE_KEY = "zengrow_dashboard_sidebar_collapsed";
const SHARPZ_LOGO_SRC = "/sharpz-logo.png";
const WIDTH_EXPANDED = 260;
const WIDTH_COLLAPSED = 72;

const transitionSidebar = { type: "tween" as const, duration: 0.25, ease: [0, 0, 0.2, 1] as const };

type DashboardSidebarProps = {
  subscriptionPlan: "starter" | "pro" | null;
  subscriptionStatus: "trial" | "active" | "expired";
  mobileOpen?: boolean;
  onNavigate?: () => void;
  onboardingMode?: boolean;
};

type HoverTipState = { text: string; x: number; y: number } | null;

export default function DashboardSidebar({
  subscriptionPlan,
  subscriptionStatus,
  mobileOpen = false,
  onNavigate,
  onboardingMode = false,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { resolvedTheme } = useDashboardTheme();
  const { t } = useDashboardI18n();
  const isMdUp = useIsMdUp();
  const showProUpsell = subscriptionPlan === "starter" && subscriptionStatus !== "trial";

  const navItems = [
    { href: "/dashboard", label: t.nav.today, icon: CalendarDays },
    { href: "/dashboard/prospects", label: t.nav.prospects, icon: Users },
    { href: "/dashboard/intelligence", label: t.nav.intelligence, icon: Radar },
    { href: "/dashboard/progress", label: t.nav.progress, icon: BarChart3 },
    { href: "/dashboard/settings", label: t.nav.settings, icon: Settings },
  ];

  const [collapsed, setCollapsed] = useState(false);
  const [hoverTip, setHoverTip] = useState<HoverTipState>(null);

  useEffect(() => {
    const id = window.setTimeout(() => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw === "1") setCollapsed(true);
        if (raw === "0") setCollapsed(false);
      } catch {
        /* ignore */
      }
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  const persistCollapsed = useCallback((next: boolean) => {
    setCollapsed(next);
    try {
      localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, []);

  const showExpandedChrome = !isMdUp || !collapsed;
  const showCompactNav = isMdUp && collapsed;
  const tipEnabled = showCompactNav;

  const bindHoverTip = useCallback(
    (text: string) => ({
      onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
        if (!tipEnabled) return;
        const r = e.currentTarget.getBoundingClientRect();
        setHoverTip({ text, x: r.right + 8, y: r.top + r.height / 2 });
      },
      onMouseLeave: () => {
        if (!tipEnabled) return;
        setHoverTip(null);
      },
      onFocus: (e: React.FocusEvent<HTMLElement>) => {
        if (!tipEnabled) return;
        const r = e.currentTarget.getBoundingClientRect();
        setHoverTip({ text, x: r.right + 8, y: r.top + r.height / 2 });
      },
      onBlur: () => {
        if (!tipEnabled) return;
        setHoverTip(null);
      },
    }),
    [tipEnabled],
  );

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/pro/login");
  }

  const animate = useMemo(() => {
    if (isMdUp) {
      return { x: 0, width: collapsed ? WIDTH_COLLAPSED : WIDTH_EXPANDED };
    }
    return { x: mobileOpen ? 0 : "-100%", width: WIDTH_EXPANDED };
  }, [isMdUp, collapsed, mobileOpen]);

  const tipPortal =
    hoverTip && typeof document !== "undefined"
      ? createPortal(
          <span
            role="tooltip"
            data-dashboard-theme={resolvedTheme}
            className="pointer-events-none fixed z-[9999] -translate-y-1/2 whitespace-nowrap rounded-lg border border-zg-border bg-zg-surface-elevated px-2.5 py-1.5 text-sm text-zg-on-dark shadow-lg shadow-black/10"
            style={{ left: hoverTip.x, top: hoverTip.y }}
          >
            {hoverTip.text}
          </span>,
          document.body,
        )
      : null;

  return (
    <>
      {tipPortal}
      <motion.aside
        className={cn(
          "zg-dashboard-mobile-sidebar fixed inset-y-0 left-0 z-[60] flex shrink-0 flex-col border-r border-zg-sidebar-border bg-zg-sidebar-bg md:static md:z-0 md:bg-zg-sidebar-bg/80 md:backdrop-blur-md",
          !isMdUp && (mobileOpen ? "pointer-events-auto" : "pointer-events-none"),
        )}
        initial={false}
        animate={animate}
        transition={transitionSidebar}
      >
        <div className="flex shrink-0 justify-end px-3 pt-4 md:hidden">
          <button
            type="button"
            onClick={onNavigate}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-zg-on-dark-muted transition-colors duration-200 ease-out hover:bg-zg-sidebar-hover hover:text-zg-on-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zg-accent focus-visible:ring-offset-2 focus-visible:ring-offset-zg-sidebar-bg"
            aria-label={t.nav.close}
          >
            <X className="h-5 w-5" strokeWidth={2} aria-hidden />
          </button>
        </div>

        <div
          className={cn(
            "shrink-0 pb-2 pt-2 md:pt-6",
            showExpandedChrome ? "px-3" : "flex flex-col items-center gap-3 px-2",
          )}
        >
          {showExpandedChrome ? (
            <div className="flex items-center gap-2 px-3">
              <Link
                href="/dashboard"
                onClick={onNavigate}
                className="flex min-w-0 flex-1 items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zg-accent focus-visible:ring-offset-2 focus-visible:ring-offset-zg-sidebar-bg rounded-lg"
                aria-label={t.nav.homeAria}
              >
                <Image
                  src={SHARPZ_LOGO_SRC}
                  alt={t.brand}
                  width={160}
                  height={44}
                  className="h-7 w-auto max-w-[140px] object-contain object-left"
                  priority
                />
              </Link>
              <button
                type="button"
                onClick={() => persistCollapsed(true)}
                className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl text-zg-on-dark-muted transition-colors duration-200 ease-out hover:bg-zg-sidebar-hover hover:text-zg-on-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zg-accent focus-visible:ring-offset-2 focus-visible:ring-offset-zg-sidebar-bg md:inline-flex"
                aria-label={t.nav.collapse}
              >
                <PanelLeftClose className="h-5 w-5" strokeWidth={2} aria-hidden />
              </button>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => persistCollapsed(false)}
                className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl text-zg-on-dark-muted transition-colors duration-200 ease-out hover:bg-zg-sidebar-hover hover:text-zg-on-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zg-accent focus-visible:ring-offset-2 focus-visible:ring-offset-zg-sidebar-bg md:inline-flex"
                aria-label={t.nav.expand}
              >
                <PanelLeftOpen className="h-5 w-5" strokeWidth={2} aria-hidden />
              </button>
              <Link
                href="/dashboard"
                onClick={onNavigate}
                className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zg-accent focus-visible:ring-offset-2 focus-visible:ring-offset-zg-sidebar-bg"
                aria-label={t.nav.homeAria}
                {...bindHoverTip(t.brand)}
              >
                <Image
                  src={SHARPZ_LOGO_SRC}
                  alt=""
                  width={72}
                  height={28}
                  className="h-6 w-auto max-w-[64px] object-contain"
                />
              </Link>
            </>
          )}
        </div>

        {showExpandedChrome ? (
          <p className="mb-3 ml-3 mt-2 shrink-0 text-xs font-medium uppercase tracking-wider text-zg-on-dark-muted">
            {t.nav.menu}
          </p>
        ) : null}

        <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-3 pb-4 md:px-2">
          {(onboardingMode ? [] : navItems).map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              compact={showCompactNav}
              hoverTip={tipEnabled ? bindHoverTip(item.label) : undefined}
              active={
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname === item.href || pathname.startsWith(`${item.href}/`)
              }
              onNavigate={onNavigate}
            />
          ))}
        </nav>

        <div
          className={cn(
            "mt-auto shrink-0 pb-6",
            showExpandedChrome
              ? cn("space-y-2.5 px-3", showProUpsell ? "pt-1" : "pt-2")
              : "flex flex-col items-center gap-3 px-2",
          )}
        >
          {showExpandedChrome ? (
            <>
              {showProUpsell ? <CompactProUpsell onNavigate={onNavigate} /> : null}

              <div className="min-w-0 rounded-xl border border-zg-sidebar-border bg-zg-surface/50 p-2">
                <p className="mb-1.5 px-0.5 text-[10px] font-semibold uppercase tracking-wider text-zg-on-dark-muted">
                  {t.nav.theme}
                </p>
                <DashboardThemeToggle variant="sidebar" />
              </div>

              <div className="min-w-0 rounded-xl border border-zg-sidebar-border bg-zg-surface/50 p-2">
                <p className="mb-1.5 px-0.5 text-[10px] font-semibold uppercase tracking-wider text-zg-on-dark-muted">
                  {t.nav.locale}
                </p>
                <DashboardLocaleSwitch variant="sidebar" />
              </div>

              <button
                type="button"
                className={buttonClassName({
                  variant: "ghostDark",
                  size: "md",
                  className:
                    "w-full justify-start gap-3 px-3 text-zg-on-dark-muted hover:text-zg-on-dark focus-visible:ring-2 focus-visible:ring-zg-accent focus-visible:ring-offset-2 focus-visible:ring-offset-zg-sidebar-bg",
                })}
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
                {t.nav.logout}
              </button>
            </>
          ) : (
            <>
              <DashboardThemeToggle variant="sidebarCompact" />
              <button
                type="button"
                {...bindHoverTip(t.nav.logout)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-zg-on-dark-muted transition-all duration-200 ease-out hover:bg-zg-sidebar-hover hover:text-zg-on-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zg-accent focus-visible:ring-offset-2 focus-visible:ring-offset-zg-sidebar-bg"
                aria-label={t.nav.logout}
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
              </button>
            </>
          )}
        </div>
      </motion.aside>
    </>
  );
}

function NavItem({
  href,
  label,
  icon: Icon,
  active,
  locked,
  compact,
  hoverTip,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
  locked?: boolean;
  compact: boolean;
  hoverTip?: {
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => void;
    onMouseLeave: () => void;
    onFocus: (e: React.FocusEvent<HTMLElement>) => void;
    onBlur: () => void;
  };
  onNavigate?: () => void;
}) {
  const tipHandlers = hoverTip ?? {};

  if (compact) {
    return (
      <Link
        href={href}
        onClick={onNavigate}
        {...tipHandlers}
        className={cn(
          "relative mx-auto flex h-11 w-11 items-center justify-center rounded-xl text-sm font-medium transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zg-accent focus-visible:ring-offset-2 focus-visible:ring-offset-zg-sidebar-bg",
          locked
            ? "text-zg-on-dark-muted/80 hover:bg-zg-sidebar-hover hover:text-zg-on-dark"
            : active
              ? "bg-white/[0.08] text-white"
              : "text-zg-on-dark-muted hover:bg-zg-sidebar-hover hover:text-zg-on-dark",
        )}
        aria-label={label}
      >
        <Icon
          size={20}
          strokeWidth={active && !locked ? 2 : 1.75}
          className={cn("shrink-0", active && !locked ? "text-white" : "")}
          aria-hidden
        />
        {locked ? (
          <span className="absolute -bottom-1 -right-1 rounded bg-zg-neutral-badge-bg px-1 py-px text-[8px] font-bold uppercase text-zg-on-dark-muted ring-1 ring-zg-border">
            P
          </span>
        ) : null}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zg-accent focus-visible:ring-offset-2 focus-visible:ring-offset-zg-sidebar-bg",
        locked
          ? "text-zg-on-dark-muted/80 hover:bg-zg-sidebar-hover hover:text-zg-on-dark"
          : active
            ? "bg-white/[0.08] text-white"
            : "text-zg-on-dark-muted hover:bg-zg-sidebar-hover hover:text-zg-on-dark",
      )}
    >
      <Icon
        size={20}
        strokeWidth={active && !locked ? 2 : 1.75}
        className={cn("shrink-0", active && !locked ? "text-white" : "")}
        aria-hidden
      />
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {locked ? (
        <span className="shrink-0 rounded-full bg-zg-neutral-badge-bg px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zg-on-dark-muted">
          Pro
        </span>
      ) : null}
    </Link>
  );
}
