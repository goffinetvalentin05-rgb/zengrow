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
      className="flex w-full flex-col overflow-hidden border-b border-gray-100 bg-white text-gray-800 shadow-sm md:w-56 md:shrink-0 md:rounded-xl md:border md:border-gray-100 md:pr-8"
      style={{ overflow: "hidden" }}
    >
      <div className="shrink-0 py-2">
        <Image src="/Zengrow-logo.png" alt="ZenGrow" width={128} height={34} className="h-7 w-auto object-contain" priority />
      </div>

      <nav className="mt-8 min-h-0 flex-1 space-y-0.5 overflow-hidden text-[14px]" style={{ overflow: "hidden" }}>
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

      <div className="mt-10 shrink-0 border-t border-gray-100 pt-8">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Lien public</p>
        <p className="mt-2 break-all text-xs leading-relaxed text-gray-700">{reservationLink}</p>
        <a
          href={reservationLink}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-block text-sm font-medium text-green-700 hover:text-green-800"
        >
          Ouvrir la page →
        </a>
      </div>

      <div className="mt-8 shrink-0 space-y-1 border-t border-gray-100 pt-6">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full rounded-lg py-2.5 text-left text-sm text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
        >
          Se déconnecter
        </button>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="w-full rounded-lg py-2.5 text-left text-sm text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
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
        "flex items-center gap-3 rounded-lg py-2 pl-2 pr-2 font-medium transition-colors",
        active
          ? "border-l-4 border-green-600 bg-green-50 pl-[calc(0.5rem-4px)] text-green-800"
          : "border-l-4 border-transparent text-gray-800 hover:bg-gray-50",
      )}
    >
      <Icon size={18} strokeWidth={1.75} className={cn("shrink-0", active ? "text-green-800" : "text-gray-600")} />
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {locked ? (
        <span
          className={cn(
            "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase",
            active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500",
          )}
        >
          Pro
        </span>
      ) : null}
    </Link>
  );
}
