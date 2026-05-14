"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Calendar,
  CalendarDays,
  LayoutDashboard,
  LayoutGrid,
  Megaphone,
  Settings,
  Star,
  Users,
  type LucideIcon,
} from "lucide-react";
import { createClient } from "@/src/lib/supabase/client";
import { cn } from "@/src/lib/utils";

type DashboardSidebarProps = {
  reservationLink: string;
  subscriptionPlan: "starter" | "pro" | null;
  subscriptionStatus: "trial" | "active" | "expired";
};

const navItems = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/dashboard/reservations", label: "Réservations", icon: Calendar },
  { href: "/dashboard/availability", label: "Disponibilités", icon: CalendarDays },
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
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const hasProMarketingAccess = subscriptionStatus === "trial" || subscriptionPlan === "pro";

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <aside
      className="flex w-full min-w-0 flex-col overflow-hidden border-b border-zg-border bg-zg-surface-soft md:sticky md:top-7 md:min-h-[calc(100vh-3.5rem)] md:min-w-[220px] md:w-[248px] md:max-w-[248px] md:shrink-0 md:self-start md:rounded-2xl md:border md:border-zg-border md:border-b-0 md:shadow-zg-sidebar"
      style={{ overflow: "hidden" }}
    >
      <div className="shrink-0 border-b border-zg-border px-5 pt-6 pb-5">
        <Link
          href="/dashboard"
          className="inline-flex rounded-xl ring-offset-zg-surface-soft transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zg-teal/30 focus-visible:ring-offset-2"
          aria-label="ZenGrow — tableau de bord"
        >
          <Image src="/Zengrow-logo.png" alt="" width={156} height={42} className="h-9 w-auto object-contain sm:h-10" priority />
        </Link>
        <p className="mt-3.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-zg-fg-muted">Navigation</p>
      </div>

      <nav
        className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-hidden px-2.5 pb-2 pt-3 text-[13px] leading-snug"
        style={{ overflow: "hidden" }}
      >
        {navItems.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            active={pathname === item.href}
            locked={Boolean(item.requiresPro && !hasProMarketingAccess)}
          />
        ))}
      </nav>

      <div className="mt-auto shrink-0 border-t border-zg-border bg-zg-surface/40 px-5 py-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zg-fg-muted">Lien public</p>
        <p className="mt-2 break-all text-xs leading-relaxed text-zg-muted">{reservationLink}</p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <a
            href={reservationLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs font-semibold text-zg-teal transition hover:text-zg-fg"
          >
            Page publique →
          </a>
          <button
            type="button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(reservationLink);
              } catch {
                /* noop */
              }
            }}
            className="inline-flex items-center gap-1 text-xs font-semibold text-zg-muted transition hover:text-zg-fg"
          >
            Copier le lien
          </button>
        </div>
      </div>

      <div className="shrink-0 space-y-0.5 border-t border-zg-border px-5 pt-3 pb-6">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full rounded-xl py-2.5 text-left text-xs font-medium text-zg-muted transition hover:bg-zg-highlight/90 hover:text-zg-fg"
        >
          Se déconnecter
        </button>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="w-full rounded-xl py-2.5 text-left text-xs font-medium text-zg-muted transition hover:bg-zg-highlight/90 hover:text-zg-fg"
        >
          Site vitrine
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
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
  locked?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-3 rounded-xl py-2.5 font-semibold transition-colors duration-200",
        active
          ? "bg-zg-surface px-3.5 text-zg-fg shadow-[inset_0_0_0_1px_var(--zg-border-accent)]"
          : "px-3.5 text-zg-muted hover:bg-zg-surface/80 hover:text-zg-fg",
      )}
    >
      <Icon
        size={18}
        strokeWidth={active ? 2 : 1.75}
        className={cn(
          "shrink-0 transition-colors",
          active ? "text-zg-teal" : "text-zg-fg-muted group-hover:text-zg-teal/90",
        )}
      />
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {locked ? (
        <span
          className={cn(
            "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
            active ? "bg-zg-highlight text-zg-teal ring-1 ring-zg-border-accent" : "bg-zg-surface/70 text-zg-fg-muted",
          )}
        >
          Pro
        </span>
      ) : null}
    </Link>
  );
}
