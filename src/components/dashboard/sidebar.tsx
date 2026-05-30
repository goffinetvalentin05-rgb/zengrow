"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { isGiftCardsEnabled } from "@/src/lib/config/features";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Copy,
  Gift,
  LayoutDashboard,
  LogOut,
  Globe2,
  Megaphone,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Users,
  X,
  Star,
  type LucideIcon,
} from "lucide-react";
import { createClient } from "@/src/lib/supabase/client";
import { cn } from "@/src/lib/utils";
import { buttonClassName } from "@/src/components/ui/button";
import { useDashboardToast } from "@/src/components/dashboard/dashboard-toast-provider";
import CompactProUpsell from "@/src/components/dashboard/sidebar/compact-pro-upsell";
import { DashboardThemeToggle } from "@/src/components/dashboard/dashboard-theme-toggle";
import { useDashboardTheme } from "@/src/components/dashboard/dashboard-theme-provider";
import { useIsMdUp } from "@/src/hooks/use-is-md-up";

const STORAGE_KEY = "zengrow_dashboard_sidebar_collapsed";
const ZENGROW_LOGO_SRC = "/logo-zengrow.png";
const WIDTH_EXPANDED = 260;
const WIDTH_COLLAPSED = 72;

const transitionSidebar = { type: "tween" as const, duration: 0.25, ease: [0, 0, 0.2, 1] as const };

type DashboardSidebarProps = {
  reservationLink: string;
  subscriptionPlan: "starter" | "pro" | null;
  subscriptionStatus: "trial" | "active" | "expired";
  mobileOpen?: boolean;
  onNavigate?: () => void;
};

const navItems = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/dashboard/reservations", label: "Réservations", icon: Calendar },
  { href: "/dashboard/customers", label: "Clients", icon: Users },
  { href: "/dashboard/reputation", label: "Avis & réputation", icon: Star },
  { href: "/dashboard/marketing", label: "Marketing", icon: Megaphone, requiresPro: true },
  { href: "/dashboard/public-page", label: "Showroom", icon: Globe2 },
  // GIFT_CARDS feature flag — réactivable
  ...(isGiftCardsEnabled()
    ? [{ href: "/dashboard/gift-vouchers" as const, label: "Bons cadeaux", icon: Gift }]
    : []),
  { href: "/dashboard/settings", label: "Paramètres", icon: Settings },
];

type HoverTipState = { text: string; x: number; y: number } | null;

export default function DashboardSidebar({
  reservationLink,
  subscriptionPlan,
  subscriptionStatus,
  mobileOpen = false,
  onNavigate,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const showToast = useDashboardToast();
  const { resolvedTheme } = useDashboardTheme();
  const isMdUp = useIsMdUp();
  const hasProMarketingAccess = subscriptionStatus === "trial" || subscriptionPlan === "pro";
  const showProUpsell = subscriptionPlan === "starter" && subscriptionStatus !== "trial";

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
    router.push("/login");
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(reservationLink);
      showToast({ message: "Lien showroom copié.", icon: Copy });
    } catch {
      showToast({ message: "Impossible de copier le lien.", icon: Copy });
    }
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
          "fixed inset-y-0 left-0 z-50 flex shrink-0 flex-col border-r border-zg-sidebar-border bg-zg-sidebar-bg/95 backdrop-blur-xl md:static md:z-0",
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
            aria-label="Fermer le menu de navigation"
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
                aria-label="ZenGrow — tableau de bord"
              >
                <Image
                  src={ZENGROW_LOGO_SRC}
                  alt="ZenGrow"
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
                aria-label="Réduire la barre latérale"
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
                aria-label="Développer la barre latérale"
              >
                <PanelLeftOpen className="h-5 w-5" strokeWidth={2} aria-hidden />
              </button>
              <Link
                href="/dashboard"
                onClick={onNavigate}
                className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zg-accent focus-visible:ring-offset-2 focus-visible:ring-offset-zg-sidebar-bg"
                aria-label="ZenGrow — tableau de bord"
                {...bindHoverTip("ZenGrow")}
              >
                <Image
                  src={ZENGROW_LOGO_SRC}
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
            Menu
          </p>
        ) : null}

        <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-3 pb-4 md:px-2">
          {navItems.map((item) => (
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
              locked={Boolean(item.requiresPro && !hasProMarketingAccess)}
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
                  Thème
                </p>
                <DashboardThemeToggle variant="sidebar" />
              </div>

              <div className="rounded-xl px-1">
                <div className="flex items-center gap-2">
                  <p className="min-w-0 flex-1 truncate text-xs text-zg-on-dark-muted" title={reservationLink}>
                    {reservationLink}
                  </p>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zg-on-dark-muted transition-all duration-200 ease-out hover:bg-zg-sidebar-hover hover:text-zg-on-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zg-accent focus-visible:ring-offset-2 focus-visible:ring-offset-zg-sidebar-bg"
                    aria-label="Copier le lien public"
                  >
                    <Copy className="h-4 w-4" strokeWidth={2} />
                  </button>
                </div>
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
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <DashboardThemeToggle variant="sidebarCompact" />
              <button
                type="button"
                onClick={handleCopy}
                {...bindHoverTip("Copier le lien public")}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-zg-on-dark-muted transition-all duration-200 ease-out hover:bg-zg-sidebar-hover hover:text-zg-on-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zg-accent focus-visible:ring-offset-2 focus-visible:ring-offset-zg-sidebar-bg"
                aria-label="Copier le lien public"
              >
                <Copy className="h-4 w-4" strokeWidth={2} />
              </button>
              <button
                type="button"
                {...bindHoverTip("Déconnexion")}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-zg-on-dark-muted transition-all duration-200 ease-out hover:bg-zg-sidebar-hover hover:text-zg-on-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zg-accent focus-visible:ring-offset-2 focus-visible:ring-offset-zg-sidebar-bg"
                aria-label="Déconnexion"
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
              ? "bg-gradient-to-br from-[#7c5cff] to-[#6366f1] text-white shadow-[0_0_24px_-8px_rgba(124,92,255,0.55)]"
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
            ? "bg-gradient-to-br from-[#7c5cff] to-[#6366f1] text-white shadow-[0_0_24px_-8px_rgba(124,92,255,0.55)]"
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
