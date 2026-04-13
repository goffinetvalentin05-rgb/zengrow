"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Calendar,
  CalendarDays,
  LayoutDashboard,
  MessageSquare,
  Megaphone,
  CreditCard,
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
  { href: "/dashboard/reviews", label: "Avis Google", icon: Star },
  { href: "/dashboard/feedback", label: "Retours clients", icon: MessageSquare },
  { href: "/dashboard/customers", label: "Clients", icon: Users },
  { href: "/dashboard/marketing", label: "Marketing", icon: Megaphone, requiresPro: true },
  { href: "/dashboard/settings", label: "Paramètres", icon: Settings },
  { href: "/dashboard/billing", label: "Facturation", icon: CreditCard },
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
      className="flex w-full min-w-0 flex-col overflow-hidden border-b border-zg-border-strong/90 bg-zg-surface/82 backdrop-blur-xl md:min-w-[228px] md:w-[252px] md:max-w-[252px] md:shrink-0 md:rounded-2xl md:border md:border-zg-border-strong/85 md:border-b-0 md:shadow-zg-sidebar"
      style={{ overflow: "hidden" }}
    >
      <div className="shrink-0 border-b border-zg-border/70 px-5 pt-7 pb-6">
        <Link
          href="/dashboard"
          className="inline-flex rounded-xl ring-offset-zg-canvas transition hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zg-teal/35 focus-visible:ring-offset-2"
          aria-label="ZenGrow — tableau de bord"
        >
          <Image src="/Zengrow-logo.png" alt="" width={156} height={42} className="h-9 w-auto object-contain sm:h-10" priority />
        </Link>
        <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-zg-fg/42">Navigation</p>
      </div>

      <nav
        className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-hidden px-3 pb-2 pt-4 text-[13px] leading-snug"
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

      <div className="mt-auto shrink-0 border-t border-zg-border/75 bg-zg-surface-elevated/50 px-5 py-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zg-fg/45">Lien public</p>
        <p className="mt-2 break-all text-xs leading-relaxed text-zg-fg/58">{reservationLink}</p>
        <a
          href={reservationLink}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-zg-teal transition hover:text-zg-fg"
        >
          Ouvrir la page →
        </a>
      </div>

      <div className="shrink-0 space-y-0.5 border-t border-zg-border/75 px-5 pt-4 pb-8">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full rounded-xl py-2.5 text-left text-xs font-medium text-zg-fg/48 transition hover:bg-zg-highlight/80 hover:text-zg-fg/75"
        >
          Se déconnecter
        </button>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="w-full rounded-xl py-2.5 text-left text-xs font-medium text-zg-fg/48 transition hover:bg-zg-highlight/80 hover:text-zg-fg/75"
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
          ? "bg-gradient-to-r from-zg-highlight/95 to-zg-surface-elevated/90 px-3.5 text-zg-fg shadow-[inset_0_0_0_1px_rgba(203,230,223,0.65)]"
          : "px-3.5 text-zg-fg/52 hover:bg-zg-surface-soft/90 hover:text-zg-fg/88",
      )}
    >
      <Icon
        size={18}
        strokeWidth={active ? 2 : 1.75}
        className={cn(
          "shrink-0 transition-colors",
          active ? "text-zg-teal" : "text-zg-fg/40 group-hover:text-zg-teal/85",
        )}
      />
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {locked ? (
        <span
          className={cn(
            "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
            active ? "bg-zg-surface/90 text-zg-teal ring-1 ring-zg-border-accent/80" : "bg-zg-highlight/70 text-zg-fg/48",
          )}
        >
          Pro
        </span>
      ) : null}
    </Link>
  );
}
