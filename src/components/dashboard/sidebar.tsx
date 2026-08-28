"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  Bot,
  LayoutDashboard,
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
import CompactProUpsell from "@/src/components/dashboard/sidebar/compact-pro-upsell";
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
  userDisplayName?: string;
  userRoleLabel?: string;
  userInitials?: string;
  userAvatarUrl?: string | null;
};

type HoverTipState = { text: string; x: number; y: number } | null;

export default function DashboardSidebar({
  subscriptionPlan,
  subscriptionStatus,
  mobileOpen = false,
  onNavigate,
  onboardingMode = false,
  userDisplayName,
  userRoleLabel,
  userInitials,
  userAvatarUrl,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useDashboardI18n();
  const isMdUp = useIsMdUp();
  const showProUpsell = subscriptionPlan === "starter" && subscriptionStatus !== "trial";

  const navItems = [
    { href: "/dashboard", label: t.nav.dashboard, icon: LayoutDashboard },
    { href: "/dashboard/agent", label: t.nav.agent, icon: Bot },
    { href: "/dashboard/prospects", label: t.nav.prospects, icon: Users },
    { href: "/dashboard/analytics", label: t.nav.analytics, icon: Radar },
    { href: "/dashboard/results", label: t.nav.results, icon: BarChart3 },
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

  const settingsActive = pathname === "/dashboard/settings" || pathname.startsWith("/dashboard/settings/");
  const initials = (userInitials || "?").slice(0, 2).toUpperCase();

  const tipPortal =
    hoverTip && typeof document !== "undefined"
      ? createPortal(
          <span
            role="tooltip"
            className="pointer-events-none fixed z-[9999] -translate-y-1/2 whitespace-nowrap rounded-lg border border-white/[0.1] bg-zinc-900 px-2.5 py-1.5 text-[13px] text-zg-on-dark shadow-xl shadow-black/40"
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
          "zg-dashboard-mobile-sidebar fixed inset-y-0 left-0 z-[60] flex h-dvh shrink-0 flex-col border-r border-white/[0.06] bg-[#0d0c12]",
          "md:static md:z-0 md:h-full md:overflow-hidden md:bg-transparent",
          !isMdUp && (mobileOpen ? "pointer-events-auto" : "pointer-events-none"),
        )}
        initial={false}
        animate={animate}
        transition={transitionSidebar}
      >
        <div className="flex shrink-0 justify-end px-3 pt-3 md:hidden">
          <button
            type="button"
            onClick={onNavigate}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-zg-on-dark-muted transition-colors duration-200 ease-out hover:bg-zg-sidebar-hover hover:text-zg-on-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25"
            aria-label={t.nav.close}
          >
            <X className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          </button>
        </div>

        <div
          className={cn(
            "flex h-14 shrink-0 items-center md:h-16",
            showExpandedChrome ? "px-5" : "justify-center px-2",
          )}
        >
          {showExpandedChrome ? (
            <div className="flex w-full items-center gap-2">
              <Link
                href="/dashboard"
                onClick={onNavigate}
                className="flex min-w-0 flex-1 items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25"
                aria-label={t.nav.homeAria}
              >
                <Image
                  src={SHARPZ_LOGO_SRC}
                  alt={t.brand}
                  width={160}
                  height={44}
                  className="h-6 w-auto max-w-[130px] object-contain object-left"
                  priority
                />
              </Link>
              <button
                type="button"
                onClick={() => persistCollapsed(true)}
                className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg text-zg-muted transition-colors duration-200 ease-out hover:bg-zg-sidebar-hover hover:text-zg-on-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25 md:inline-flex"
                aria-label={t.nav.collapse}
              >
                <PanelLeftClose className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => persistCollapsed(false)}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-zg-muted transition-colors duration-200 ease-out hover:bg-zg-sidebar-hover hover:text-zg-on-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25"
              aria-label={t.nav.expand}
            >
              <PanelLeftOpen className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            </button>
          )}
        </div>

        <nav
          className={cn(
            "flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto pb-4 pt-3",
            showExpandedChrome ? "px-3" : "items-center px-2",
          )}
        >
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
            "shrink-0 border-t border-zg-sidebar-border",
            showExpandedChrome ? "space-y-2 px-3 pb-4 pt-3" : "flex flex-col items-center gap-1 px-2 pb-4 pt-3",
          )}
        >
          {showExpandedChrome ? (
            <>
              {showProUpsell ? <CompactProUpsell onNavigate={onNavigate} /> : null}

              <NavItem
                href="/dashboard/settings"
                label={t.nav.settings}
                icon={Settings}
                compact={false}
                active={settingsActive}
                onNavigate={onNavigate}
              />

              <div className="flex items-center justify-between gap-2 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-3 py-2">
                <span className="text-[11px] font-medium uppercase tracking-wider text-zg-muted">
                  {t.nav.locale}
                </span>
                <DashboardLocaleSwitch variant="sidebar" className="w-[76px] shrink-0" />
              </div>

              <div className="flex items-center gap-2.5 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
                {userAvatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={userAvatarUrl}
                    alt=""
                    className="h-8 w-8 shrink-0 rounded-full object-cover ring-1 ring-white/10"
                  />
                ) : (
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-[11px] font-semibold text-zg-on-dark"
                    aria-hidden
                  >
                    {initials}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-zg-on-dark">{userDisplayName ?? "—"}</p>
                  {userRoleLabel ? (
                    <p className="truncate text-[11px] text-zg-muted">{userRoleLabel}</p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zg-muted transition-colors duration-200 ease-out hover:bg-zg-sidebar-hover hover:text-zg-on-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25"
                  aria-label={t.nav.logout}
                  title={t.nav.logout}
                >
                  <LogOut className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                </button>
              </div>
            </>
          ) : (
            <>
              <NavItem
                href="/dashboard/settings"
                label={t.nav.settings}
                icon={Settings}
                compact
                hoverTip={bindHoverTip(t.nav.settings)}
                active={settingsActive}
                onNavigate={onNavigate}
              />
              <button
                type="button"
                {...bindHoverTip(t.nav.logout)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-zg-muted transition-colors duration-200 ease-out hover:bg-zg-sidebar-hover hover:text-zg-on-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25"
                aria-label={t.nav.logout}
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
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
  compact,
  hoverTip,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
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
          "relative flex h-11 w-11 items-center justify-center rounded-2xl transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25",
          active
            ? "bg-[linear-gradient(90deg,rgba(155,122,173,0.28),rgba(155,122,173,0.06))] text-zg-on-dark"
            : "text-zg-muted hover:bg-zg-sidebar-hover hover:text-zg-on-dark",
        )}
        aria-label={label}
        aria-current={active ? "page" : undefined}
      >
        <Icon size={19} strokeWidth={1.75} className="shrink-0" aria-hidden />
      </Link>
    );
  }

  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex items-center gap-3 rounded-2xl px-3 py-2.5 text-[13.5px] transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25",
        active
          ? "bg-[linear-gradient(90deg,rgba(155,122,173,0.26),rgba(155,122,173,0.04))] font-medium text-zg-on-dark"
          : "font-normal text-zg-muted hover:bg-white/[0.04] hover:text-zg-on-dark",
      )}
    >
      <span
        className={cn(
          "absolute left-1.5 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-full bg-[#cbb4dc] transition-opacity duration-200",
          active ? "opacity-100" : "opacity-0",
        )}
        aria-hidden
      />
      <Icon size={18} strokeWidth={1.75} className="shrink-0" aria-hidden />
      <span className="min-w-0 flex-1 truncate">{label}</span>
    </Link>
  );
}
