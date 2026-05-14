"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Calendar,
  CalendarDays,
  Clock,
  Copy,
  ExternalLink,
  Grid3x3,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Settings,
  Star,
  Users,
  type LucideIcon,
} from "lucide-react";
import { createClient } from "@/src/lib/supabase/client";
import { cn } from "@/src/lib/utils";
import Button, { buttonClassName } from "@/src/components/ui/button";
import { useDashboardToast } from "@/src/components/dashboard/dashboard-toast-provider";

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
  { href: "/dashboard/availability", label: "Disponibilités", icon: Clock },
  { href: "/dashboard/floor-plan", label: "Plan de salle", icon: Grid3x3, requiresPro: true },
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
        "fixed inset-y-0 left-0 z-50 flex w-[240px] flex-col border-r border-zg-sidebar-border bg-zg-sidebar-bg transition-transform duration-150 ease-out md:static md:z-0 md:translate-x-0 md:border-r md:border-zg-sidebar-border",
        mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0 md:shadow-none",
      )}
    >
      <div className="shrink-0 px-6 py-6">
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="font-landing-serif text-xl italic leading-none text-zg-on-dark transition-opacity duration-150 hover:opacity-90"
          aria-label="ZenGrow — tableau de bord"
        >
          ZenGrow
        </Link>
      </div>

      <p className="mb-2 ml-3 mt-1 shrink-0 text-xs font-medium uppercase tracking-wider text-zg-on-dark-muted">
        Navigation
      </p>

      <nav className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto px-3 pb-4">
        {navItems.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
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

      <div className="mt-auto shrink-0 space-y-3 px-4 pb-4">
        <div className="rounded-xl bg-white/5 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-zg-on-dark-muted">Lien public</p>
          <p className="mt-2 truncate text-sm text-zg-on-dark" title={reservationLink}>
            {reservationLink}
          </p>
          <div className="mt-3 flex gap-2">
            <a
              href={reservationLink}
              target="_blank"
              rel="noreferrer"
              className={buttonClassName({
                variant: "ghostDark",
                size: "sm",
                className: "flex-1 border border-white/10",
              })}
            >
              <ExternalLink className="h-4 w-4" strokeWidth={2} aria-hidden />
              Page publique
            </a>
            <Button type="button" variant="ghostDark" size="sm" className="flex-1 border border-white/10" onClick={handleCopy}>
              <Copy className="h-4 w-4" strokeWidth={2} aria-hidden />
              Copier
            </Button>
          </div>
        </div>

        <Button
          type="button"
          variant="ghostDark"
          className="w-full justify-start gap-2 border border-transparent px-3"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
          Se déconnecter
        </Button>
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
  onNavigate,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
  locked?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
        active
          ? "border-l-[3px] border-zg-accent bg-zg-accent/15 text-zg-accent"
          : "border-l-[3px] border-transparent text-zg-on-dark-muted hover:bg-white/5 hover:text-zg-on-dark",
      )}
    >
      <Icon size={18} strokeWidth={active ? 2 : 1.75} className="shrink-0" aria-hidden />
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {locked ? (
        <span
          className={cn(
            "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
            active ? "bg-white/10 text-zg-on-dark" : "bg-white/5 text-zg-on-dark-muted",
          )}
        >
          Pro
        </span>
      ) : null}
    </Link>
  );
}
