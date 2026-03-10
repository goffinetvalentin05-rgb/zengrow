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
};

const navItems = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/dashboard/reservations", label: "Reservations", icon: Calendar },
  { href: "/dashboard/availability", label: "Disponibilites", icon: CalendarDays },
  { href: "/dashboard/marketing", label: "Marketing", icon: Megaphone },
  { href: "/dashboard/reviews", label: "Automatisation des avis", icon: Star },
  { href: "/dashboard/feedback", label: "Feedback", icon: MessageSquare },
  { href: "/dashboard/customers", label: "Clients", icon: Users },
  { href: "/dashboard/settings", label: "Parametres", icon: Settings },
];

export default function DashboardSidebar({ reservationLink }: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <aside className="w-full rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[0_16px_36px_-28px_rgba(15,63,58,0.6)] lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] lg:w-72">
      <div className="rounded-2xl bg-[#ECF8F5] p-4">
        <Image
          src="/Zengrow-logo.png"
          alt="Logo ZenGrow"
          width={140}
          height={38}
          className="h-8 w-auto object-contain"
          priority
        />
      </div>

      <nav className="mt-5 space-y-1 text-sm">
        {navItems.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            active={pathname === item.href}
          />
        ))}
      </nav>

      <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
          Lien public
        </p>
        <p className="mt-2 break-all text-xs text-[var(--foreground)]/75">{reservationLink}</p>
        <a
          href={reservationLink}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex text-xs font-semibold text-[var(--primary)] hover:underline"
        >
          Ouvrir la page de reservation
        </a>
      </div>

      <div className="mt-auto pt-6">
        <Button type="button" variant="ghost" onClick={handleLogout} className="w-full justify-start">
          Se deconnecter
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.push("/")} className="mt-2 w-full justify-start">
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
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-3 rounded-xl px-3 py-2.5 font-medium transition",
        active
          ? "bg-gradient-to-r from-[#1F7A6C] to-[#3DBE9F] text-white shadow-[0_12px_30px_-20px_rgba(31,122,108,0.9)]"
          : "text-[var(--muted-foreground)] hover:bg-[#F3FBF8] hover:text-[var(--foreground)]",
      )}
    >
      <Icon
        size={17}
        className={cn(
          "shrink-0 transition",
          active ? "text-white" : "text-[var(--muted-foreground)] group-hover:text-[#1F7A6C]",
        )}
      />
      <span>{label}</span>
    </Link>
  );
}
