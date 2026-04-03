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
    <aside
      className="flex w-full flex-col overflow-hidden rounded-[20px] border-b border-solid border-[#E5E7EB] bg-[#FFFFFF] p-6 text-[#1a1a1a] lg:sticky lg:top-8 lg:h-[calc(100vh-4rem)] lg:shrink-0 lg:w-[18rem] lg:border-b-0 lg:border-r lg:border-[#E5E7EB]"
      style={{ overflow: "hidden" }}
    >
      <div className="shrink-0 rounded-xl border border-solid border-[#E5E7EB] bg-[#FFFFFF] p-4">
        <Image
          src="/Zengrow-logo.png"
          alt="Logo ZenGrow"
          width={140}
          height={38}
          className="h-8 w-auto object-contain"
          priority
        />
      </div>

      <nav className="mt-8 min-h-0 flex-1 space-y-1 overflow-hidden text-[14px] text-[#1a1a1a]" style={{ overflow: "hidden" }}>
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

      <div className="mt-8 shrink-0 rounded-[20px] border border-solid border-[#E5E7EB] bg-[#FFFFFF] p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#6b7280]">Lien public</p>
        <p className="mt-3 break-all text-xs leading-relaxed text-[#1a1a1a]">{reservationLink}</p>
        <a
          href={reservationLink}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex text-[13px] font-medium text-[var(--primary)] underline decoration-[var(--primary)]/25 underline-offset-4 transition hover:decoration-[var(--primary)]/50"
        >
          Ouvrir la page de réservation
        </a>
      </div>

      <div className="mt-8 shrink-0 space-y-1 border-t border-solid border-[#E5E7EB] pt-8">
        <Button type="button" variant="ghost" onClick={handleLogout} className="w-full justify-start rounded-lg text-[#1a1a1a] hover:bg-[#F3F4F6]">
          Se déconnecter
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.push("/")} className="w-full justify-start rounded-lg text-[#1a1a1a] hover:bg-[#F3F4F6]">
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
          ? "border-l-[3px] border-solid border-l-[#166534] bg-[#F0FDF4] text-[#166534] shadow-sm"
          : "border-l-[3px] border-l-transparent text-[#1a1a1a] hover:bg-[#F9FAFB] hover:text-[#1a1a1a]",
      )}
    >
      <span className="flex h-5 w-5 shrink-0 items-center justify-center">
        <Icon
          size={18}
          strokeWidth={2}
          className={cn(
            "transition-colors duration-200",
            active ? "text-[#166534]" : "text-[#1a1a1a] group-hover:text-[#1a1a1a]",
          )}
        />
      </span>
      <span className="min-w-0 flex-1 truncate leading-snug">{label}</span>
      {locked ? (
        <span
          className={cn(
            "ml-auto shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1",
            active
              ? "bg-[#DCFCE7] text-[#166534] ring-[#166534]/20"
              : "bg-[#F3F4F6] text-[#6b7280] ring-[#E5E7EB]",
          )}
        >
          Pro
        </span>
      ) : null}
    </Link>
  );
}
