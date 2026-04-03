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
    <aside className="flex w-full flex-col rounded-[20px] bg-[var(--sidebar)] p-6 text-[var(--sidebar-foreground)] shadow-[var(--card-shadow)] ring-1 ring-white/[0.06] lg:sticky lg:top-8 lg:h-[calc(100vh-4rem)] lg:shrink-0 lg:w-[18rem]">
      <div className="rounded-xl bg-white/[0.06] p-4 ring-1 ring-white/[0.08]">
        <Image
          src="/Zengrow-logo.png"
          alt="Logo ZenGrow"
          width={140}
          height={38}
          className="h-8 w-auto object-contain opacity-95"
          priority
        />
      </div>

      <nav className="mt-8 flex-1 space-y-1 overflow-y-auto pr-1 text-[14px]">
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

      <div className="mt-8 rounded-[20px] bg-white/[0.05] p-5 ring-1 ring-white/[0.08]">
        <p className="dashboard-section-kicker text-white/45">Lien public</p>
        <p className="mt-3 break-all text-xs leading-relaxed text-white/80">{reservationLink}</p>
        <a
          href={reservationLink}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex text-[13px] font-medium text-white/95 underline decoration-white/25 underline-offset-4 transition hover:decoration-white/55"
        >
          Ouvrir la page de réservation
        </a>
      </div>

      <div className="mt-8 space-y-1 border-t border-white/[0.08] pt-8">
        <Button type="button" variant="ghostInverse" onClick={handleLogout} className="w-full justify-start rounded-lg">
          Se déconnecter
        </Button>
        <Button type="button" variant="ghostInverse" onClick={() => router.push("/")} className="w-full justify-start rounded-lg">
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
        "group relative flex items-center gap-3 rounded-xl py-2.5 pl-3 pr-3 font-medium transition-all duration-200 ease-out",
        active
          ? "border-l-[3px] border-l-[var(--primary)] bg-white/[0.09] text-white shadow-sm"
          : "border-l-[3px] border-l-transparent text-white/55 hover:border-l-white/[0.12] hover:bg-white/[0.05] hover:text-white/95",
      )}
    >
      <span className="flex h-5 w-5 shrink-0 items-center justify-center">
        <Icon
          size={18}
          strokeWidth={2}
          className={cn(
            "transition-colors duration-200",
            active ? "text-white" : "text-white/45 group-hover:text-white/85",
          )}
        />
      </span>
      <span className="min-w-0 flex-1 truncate leading-snug">{label}</span>
      {locked ? (
        <span
          className={cn(
            "ml-auto shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1",
            active
              ? "bg-white/12 text-white/95 ring-white/20"
              : "bg-white/[0.07] text-white/60 ring-white/10",
          )}
        >
          Pro
        </span>
      ) : null}
    </Link>
  );
}
