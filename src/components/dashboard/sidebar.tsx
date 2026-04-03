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
import Button from "@/src/components/ui/button";
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
  { href: "/dashboard/reviews", label: "Automatisation des avis", icon: Star },
  { href: "/dashboard/feedback", label: "Retours clients", icon: MessageSquare },
  { href: "/dashboard/customers", label: "Clients", icon: Users },
  { href: "/dashboard/marketing", label: "Campagnes marketing", icon: Megaphone, requiresPro: true },
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
    <aside className="flex w-full flex-col rounded-2xl bg-[var(--sidebar)] p-5 text-[var(--sidebar-foreground)] shadow-sm ring-1 ring-white/[0.06] lg:sticky lg:top-8 lg:h-[calc(100vh-4rem)] lg:shrink-0 lg:w-72">
      <div className="rounded-xl bg-white/[0.06] p-3.5 ring-1 ring-white/[0.08]">
        <Image
          src="/Zengrow-logo.png"
          alt="Logo ZenGrow"
          width={140}
          height={38}
          className="h-8 w-auto object-contain opacity-95"
          priority
        />
      </div>

      <nav className="mt-6 flex-1 space-y-0.5 overflow-y-auto pr-1 text-sm">
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

      <div className="mt-6 rounded-xl bg-white/[0.05] p-4 ring-1 ring-white/[0.08]">
        <p className="dashboard-section-kicker text-[rgba(244,246,245,0.5)]">Lien public</p>
        <p className="mt-2 break-all text-xs leading-relaxed text-white/75">{reservationLink}</p>
        <a
          href={reservationLink}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex text-xs font-medium text-white/90 underline decoration-white/25 underline-offset-4 transition hover:decoration-white/60"
        >
          Ouvrir la page de réservation
        </a>
      </div>

      <div className="mt-6 space-y-1 border-t border-white/[0.08] pt-6">
        <Button type="button" variant="ghostInverse" onClick={handleLogout} className="w-full justify-start">
          Se déconnecter
        </Button>
        <Button type="button" variant="ghostInverse" onClick={() => router.push("/")} className="w-full justify-start">
          Retour au site
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
        "group flex items-center gap-3 rounded-full px-3.5 py-2.5 font-medium transition-colors duration-150",
        active
          ? "bg-[var(--primary)] text-white shadow-sm"
          : "text-white/55 hover:bg-white/[0.07] hover:text-white/95",
      )}
    >
      <Icon
        size={18}
        className={cn(
          "shrink-0 transition-colors",
          active ? "text-white" : "text-white/45 group-hover:text-white/85",
        )}
      />
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {locked ? (
        <span
          className={cn(
            "ml-auto shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1",
            active
              ? "bg-white/15 text-white ring-white/25"
              : "bg-white/[0.07] text-white/65 ring-white/10",
          )}
        >
          Pro
        </span>
      ) : null}
    </Link>
  );
}
