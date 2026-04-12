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
      className="flex w-full min-w-0 flex-col overflow-hidden border-b border-[#DDEFEA]/80 bg-white md:min-w-[220px] md:w-[240px] md:max-w-[240px] md:shrink-0 md:rounded-xl md:border-r md:border-[#DDEFEA]/80 md:border-b-0 md:shadow-none"
      style={{ overflow: "hidden" }}
    >
      <div className="shrink-0 px-5 pt-6 pb-6">
        <Link href="/dashboard" className="inline-block" aria-label="ZenGrow — tableau de bord">
          <Image src="/Zengrow-logo.png" alt="" width={148} height={40} className="h-9 w-auto object-contain" priority />
        </Link>
      </div>

      <nav
        className="flex min-h-0 flex-1 flex-col gap-1 overflow-hidden px-3 text-sm"
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

      <div className="mt-4 shrink-0 border-t border-[#DDEFEA]/70 px-5 py-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#0F3F3A]/45">Lien public</p>
        <p className="mt-2 break-all text-xs leading-relaxed text-[#0F3F3A]/55">{reservationLink}</p>
        <a
          href={reservationLink}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-block text-xs font-semibold text-[#1F7A6C] transition hover:text-[#0F3F3A]"
        >
          Ouvrir la page →
        </a>
      </div>

      <div className="shrink-0 space-y-0.5 border-t border-[#DDEFEA]/70 px-5 pt-5 pb-8">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full rounded-lg py-2 text-left text-xs text-[#0F3F3A]/45 transition hover:bg-[#F0F9F7] hover:text-[#0F3F3A]/70"
        >
          Se déconnecter
        </button>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="w-full rounded-lg py-2 text-left text-xs text-[#0F3F3A]/45 transition hover:bg-[#F0F9F7] hover:text-[#0F3F3A]/70"
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
        "flex items-center gap-3 rounded-full py-2.5 text-sm font-medium transition-colors",
        active
          ? "bg-[#E3F5EF] px-4 text-[#0F3F3A]"
          : "px-4 text-[#0F3F3A]/55 hover:bg-[#F0F9F7] hover:text-[#0F3F3A]/85",
      )}
    >
      <Icon
        size={18}
        strokeWidth={1.75}
        className={cn("shrink-0", active ? "text-[#1F7A6C]" : "text-[#0F3F3A]/45")}
      />
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {locked ? (
        <span
          className={cn(
            "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
            active ? "bg-white/80 text-[#1F7A6C]" : "bg-[#F0F9F7] text-[#0F3F3A]/45",
          )}
        >
          Pro
        </span>
      ) : null}
    </Link>
  );
}
