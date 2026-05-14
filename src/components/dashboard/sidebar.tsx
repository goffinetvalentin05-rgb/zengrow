"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  Copy,
  LayoutDashboard,
  LayoutGrid,
  LogOut,
  Megaphone,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Sparkles,
  Star,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { createClient } from "@/src/lib/supabase/client";
import { cn } from "@/src/lib/utils";
import { buttonClassName } from "@/src/components/ui/button";
import { useDashboardToast } from "@/src/components/dashboard/dashboard-toast-provider";
import { useIsMdUp } from "@/src/hooks/use-is-md-up";

const NEW_RESERVATIONS_BADGE = 3;
const STORAGE_KEY = "zengrow_dashboard_sidebar_collapsed";
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
  { href: "/dashboard/reservations", label: "Réservations", icon: Calendar, showNewBadge: true },
  { href: "/dashboard/availability", label: "Disponibilités", icon: Clock },
  { href: "/dashboard/floor-plan", label: "Plan de salle", icon: LayoutGrid, requiresPro: true },
  { href: "/dashboard/customers", label: "Clients", icon: Users },
  { href: "/dashboard/reviews", label: "Avis Google", icon: Star },
  { href: "/dashboard/marketing", label: "Marketing", icon: Megaphone, requiresPro: true },
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
  const isMdUp = useIsMdUp();
  const hasProMarketingAccess = subscriptionStatus === "trial" || subscriptionPlan === "pro";

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
      showToast({ message: "Lien public copié.", icon: Copy });
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
            className="pointer-events-none fixed z-[9999] -translate-y-1/2 whitespace-nowrap rounded-lg border border-zg-border bg-zg-surface-elevated px-2.5 py-1.5 text-sm text-zg-on-dark shadow-lg shadow-black/25"
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
          "fixed inset-y-0 left-0 z-50 flex shrink-0 flex-col border-r border-zg-border bg-zg-sidebar-bg md:static md:z-0",
          mobileOpen ? "shadow-2xl shadow-black/40 md:shadow-none" : "md:shadow-none",
        )}
        initial={false}
        animate={animate}
        transition={transitionSidebar}
      >
        <div className="flex shrink-0 justify-end px-3 pt-4 md:hidden">
          <button
            type="button"
            onClick={onNavigate}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-zg-on-dark-muted transition-colors duration-200 ease-out hover:bg-white/5 hover:text-zg-on-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zg-accent focus-visible:ring-offset-2 focus-visible:ring-offset-zg-sidebar-bg"
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
                <span className="font-landing-serif text-2xl italic leading-none text-zg-on-dark">ZenGrow</span>
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-zg-accent opacity-40" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-zg-accent" />
                </span>
              </Link>
              <button
                type="button"
                onClick={() => persistCollapsed(true)}
                className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl text-zg-on-dark-muted transition-colors duration-200 ease-out hover:bg-white/5 hover:text-zg-on-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zg-accent focus-visible:ring-offset-2 focus-visible:ring-offset-zg-sidebar-bg md:inline-flex"
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
                className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl text-zg-on-dark-muted transition-colors duration-200 ease-out hover:bg-white/5 hover:text-zg-on-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zg-accent focus-visible:ring-offset-2 focus-visible:ring-offset-zg-sidebar-bg md:inline-flex"
                aria-label="Développer la barre latérale"
              >
                <PanelLeftOpen className="h-5 w-5" strokeWidth={2} aria-hidden />
              </button>
              <Link
                href="/dashboard"
                onClick={onNavigate}
                className="flex h-9 w-9 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zg-accent focus-visible:ring-offset-2 focus-visible:ring-offset-zg-sidebar-bg"
                aria-label="ZenGrow — tableau de bord"
                {...bindHoverTip("ZenGrow")}
              >
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-zg-accent opacity-40" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-zg-accent" />
                </span>
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
              showNewBadge={item.showNewBadge}
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

        <div className={cn("mt-auto shrink-0 space-y-3 pb-6", showExpandedChrome ? "px-3" : "flex flex-col items-center gap-3 px-2")}>
          {showExpandedChrome ? (
            <>
              <div className="rounded-2xl border border-zg-border-accent/50 bg-zg-surface p-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zg-accent-soft-bg">
                  <Sparkles className="h-[18px] w-[18px] text-zg-accent" strokeWidth={1.85} aria-hidden />
                </div>
                <p className="mt-3 text-sm font-semibold text-zg-on-dark">Booste ton resto</p>
                <p className="mt-1 text-xs leading-relaxed text-zg-on-dark-muted">
                  Active toutes les automatisations en 1 clic.
                </p>
                <Link
                  href="/dashboard/settings?section=subscription"
                  onClick={onNavigate}
                  className={buttonClassName({
                    variant: "primary",
                    size: "md",
                    className: "mt-3 w-full",
                  })}
                >
                  Activer Pro
                </Link>
              </div>

              <div className="rounded-xl px-1">
                <div className="flex items-center gap-2">
                  <p className="min-w-0 flex-1 truncate text-xs text-zg-on-dark-muted" title={reservationLink}>
                    {reservationLink}
                  </p>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zg-on-dark-muted transition-all duration-200 ease-out hover:bg-white/5 hover:text-zg-on-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zg-accent focus-visible:ring-offset-2 focus-visible:ring-offset-zg-sidebar-bg"
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
              <button
                type="button"
                onClick={handleCopy}
                {...bindHoverTip("Copier le lien public")}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-zg-on-dark-muted transition-all duration-200 ease-out hover:bg-white/5 hover:text-zg-on-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zg-accent focus-visible:ring-offset-2 focus-visible:ring-offset-zg-sidebar-bg"
                aria-label="Copier le lien public"
              >
                <Copy className="h-4 w-4" strokeWidth={2} />
              </button>
              <button
                type="button"
                {...bindHoverTip("Déconnexion")}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-zg-on-dark-muted transition-all duration-200 ease-out hover:bg-white/5 hover:text-zg-on-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zg-accent focus-visible:ring-offset-2 focus-visible:ring-offset-zg-sidebar-bg"
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
  showNewBadge,
  compact,
  hoverTip,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
  locked?: boolean;
  showNewBadge?: boolean;
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
            ? "text-zg-on-dark-muted/80 hover:bg-white/[0.04] hover:text-zg-on-dark"
            : active
              ? "bg-zg-accent text-white shadow-[0_0_24px_-8px_rgba(232,93,44,0.65)]"
              : "text-zg-on-dark-muted hover:bg-white/5 hover:text-zg-on-dark",
        )}
        aria-label={label}
      >
        <Icon
          size={20}
          strokeWidth={active && !locked ? 2 : 1.75}
          className={cn("shrink-0", active && !locked ? "text-white" : "")}
          aria-hidden
        />
        {showNewBadge && !locked ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-zg-accent px-1 text-[10px] font-bold leading-none text-white ring-2 ring-zg-sidebar-bg">
            {NEW_RESERVATIONS_BADGE}
          </span>
        ) : null}
        {locked ? (
          <span className="absolute -bottom-1 -right-1 rounded bg-white/10 px-1 py-px text-[8px] font-bold uppercase text-zg-on-dark-muted ring-1 ring-zg-border">
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
          ? "text-zg-on-dark-muted/80 hover:bg-white/[0.04] hover:text-zg-on-dark"
          : active
            ? "bg-zg-accent text-white shadow-[0_0_24px_-8px_rgba(232,93,44,0.65)]"
            : "text-zg-on-dark-muted hover:bg-white/5 hover:text-zg-on-dark",
      )}
    >
      <Icon
        size={20}
        strokeWidth={active && !locked ? 2 : 1.75}
        className={cn("shrink-0", active && !locked ? "text-white" : "")}
        aria-hidden
      />
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {showNewBadge ? (
        <span
          className={cn(
            "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums",
            active && !locked ? "bg-white/25 text-white" : "bg-zg-accent text-white",
          )}
        >
          {NEW_RESERVATIONS_BADGE}
        </span>
      ) : null}
      {locked ? (
        <span className="shrink-0 rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zg-on-dark-muted">
          Pro
        </span>
      ) : null}
    </Link>
  );
}
