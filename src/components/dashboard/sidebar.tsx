"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  Copy,
  LayoutDashboard,
  LayoutGrid,
  LogOut,
  Megaphone,
  Settings,
  Sparkles,
  Star,
  Users,
  type LucideIcon,
} from "lucide-react";
import { createClient } from "@/src/lib/supabase/client";
import { cn } from "@/src/lib/utils";
import { buttonClassName } from "@/src/components/ui/button";
import { useDashboardToast } from "@/src/components/dashboard/dashboard-toast-provider";

const NEW_RESERVATIONS_BADGE = 3;

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
  const hasProMarketingAccess = subscriptionStatus === "trial" || subscriptionPlan === "pro";

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

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-zg-border bg-zg-sidebar-bg transition-transform duration-200 ease-out md:static md:z-0 md:translate-x-0",
        mobileOpen ? "translate-x-0 shadow-2xl shadow-black/40" : "-translate-x-full md:translate-x-0 md:shadow-none",
      )}
    >
      <div className="shrink-0 px-3 pb-2 pt-6">
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="flex items-center gap-2.5 px-3"
          aria-label="ZenGrow — tableau de bord"
        >
          <span className="font-landing-serif text-2xl italic leading-none text-zg-on-dark">ZenGrow</span>
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-zg-accent opacity-40" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-zg-accent" />
          </span>
        </Link>
      </div>

      <p className="mb-3 ml-3 mt-2 shrink-0 text-xs font-medium uppercase tracking-wider text-zg-on-dark-muted">
        Menu
      </p>

      <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-3 pb-4">
        {navItems.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            showNewBadge={item.showNewBadge}
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

      <div className="mt-auto shrink-0 space-y-3 px-3 pb-6">
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
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zg-on-dark-muted transition-all duration-200 ease-out hover:bg-white/5 hover:text-zg-on-dark"
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
            className: "w-full justify-start gap-3 px-3 text-zg-on-dark-muted hover:text-zg-on-dark",
          })}
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}

function NavItem({
  href,
  label,
  icon: Icon,
  active,
  locked,
  showNewBadge,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
  locked?: boolean;
  showNewBadge?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 ease-out",
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
