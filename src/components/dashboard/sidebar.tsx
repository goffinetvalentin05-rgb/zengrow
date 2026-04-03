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
      className="flex w-full flex-col overflow-hidden border-b border-gray-100 bg-white text-gray-800 lg:sticky lg:top-0 lg:h-screen lg:max-h-screen lg:w-56 lg:shrink-0 lg:border-b-0 lg:border-r lg:border-gray-100"
      style={{ overflow: "hidden" }}
    >
      <div className="shrink-0 px-4 pb-6 pt-6 lg:px-5">
        <Image
          src="/Zengrow-logo.png"
          alt="ZenGrow"
          width={128}
          height={36}
          className="h-7 w-auto object-contain"
          priority
        />
      </div>

      <nav className="min-h-0 flex-1 space-y-0.5 overflow-hidden px-2 text-[14px]" style={{ overflow: "hidden" }}>
        {navItems.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            active={
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`))
            }
            locked={Boolean(item.requiresPro && !hasProMarketingAccess)}
          />
        ))}
      </nav>

      <div className="shrink-0 space-y-3 border-t border-gray-100 px-4 py-6 lg:px-5">
        <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">Lien public</p>
        <p className="break-all text-xs leading-relaxed text-gray-600">{reservationLink}</p>
        <a
          href={reservationLink}
          target="_blank"
          rel="noreferrer"
          className="text-sm font-medium text-green-700 underline decoration-green-200 underline-offset-2 hover:text-green-800"
        >
          Ouvrir la page
        </a>
      </div>

      <div className="shrink-0 space-y-1 border-t border-gray-100 px-2 py-4 lg:px-3">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full rounded-lg px-3 py-2.5 text-left text-sm text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
        >
          Déconnexion
        </button>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="w-full rounded-lg px-3 py-2.5 text-left text-sm text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
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
          ? "border-l-4 border-green-600 bg-green-50 text-green-900"
          : "border-l-4 border-transparent text-gray-800 hover:bg-gray-50",
      )}
    >
      <Icon
        size={18}
        strokeWidth={2}
        className={cn("shrink-0", active ? "text-green-800" : "text-gray-500")}
      />
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {locked ? (
        <span
          className={cn(
            "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
            active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500",
          )}
        >
          Pro
        </span>
      ) : null}
    </Link>
  );
}
