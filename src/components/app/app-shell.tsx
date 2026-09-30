"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  BookOpen,
  CalendarDays,
  LayoutDashboard,
  LogOut,
  RotateCcw,
  Settings,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { createClient } from "@/src/lib/supabase/client";
import { LEARN_ROUTES } from "@/src/lib/learn/routes";
import { cn } from "@/src/lib/utils";

const NAV: { href: string; label: string; icon: LucideIcon }[] = [
  { href: LEARN_ROUTES.today, label: "Today", icon: LayoutDashboard },
  { href: LEARN_ROUTES.library, label: "Library", icon: BookOpen },
  { href: LEARN_ROUTES.review, label: "Review", icon: RotateCcw },
  { href: LEARN_ROUTES.week, label: "Week", icon: CalendarDays },
  { href: LEARN_ROUTES.progress, label: "Progress", icon: TrendingUp },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AppShell({
  children,
  displayName,
  email,
}: {
  children: React.ReactNode;
  displayName: string;
  email: string | null;
}) {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const initials = displayName.slice(0, 2).toUpperCase();

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push(LEARN_ROUTES.login);
    router.refresh();
  }

  return (
    <div className="min-h-dvh bg-[var(--zg-app)] text-[var(--zg-fg)]">
      <div className="mx-auto flex min-h-dvh max-w-6xl">
        <aside className="hidden w-60 shrink-0 flex-col border-r border-white/8 px-4 py-6 md:flex">
          <Link href={LEARN_ROUTES.today} className="px-3 text-sm font-semibold tracking-tight">
            Learn
          </Link>
          <nav className="mt-8 flex flex-1 flex-col gap-1">
            {NAV.map((item) => {
              const Icon = item.icon;
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                    active ? "bg-white/10 text-white" : "text-white/55 hover:bg-white/5 hover:text-white",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-4 border-t border-white/8 pt-4">
            <Link
              href={LEARN_ROUTES.settings}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                isActive(pathname, LEARN_ROUTES.settings)
                  ? "bg-white/10 text-white"
                  : "text-white/55 hover:bg-white/5 hover:text-white",
              )}
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
            <button
              type="button"
              onClick={() => void logout()}
              className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-white/45 hover:bg-white/5 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-white/8 px-5 py-4 md:px-8">
            <p className="text-sm text-white/70">{displayName}</p>
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-xs font-medium"
                aria-label="Account menu"
              >
                {initials}
              </button>
              {menuOpen ? (
                <div className="absolute right-0 z-20 mt-2 w-56 rounded-2xl border border-white/10 bg-[#14131a] p-3 shadow-xl">
                  <p className="truncate text-sm text-white">{displayName}</p>
                  {email ? <p className="truncate text-xs text-white/45">{email}</p> : null}
                  <Link
                    href={LEARN_ROUTES.settings}
                    className="mt-3 block rounded-lg px-2 py-2 text-sm text-white/80 hover:bg-white/5"
                    onClick={() => setMenuOpen(false)}
                  >
                    Settings
                  </Link>
                  <button
                    type="button"
                    onClick={() => void logout()}
                    className="mt-1 block w-full rounded-lg px-2 py-2 text-left text-sm text-white/60 hover:bg-white/5"
                  >
                    Log out
                  </button>
                </div>
              ) : null}
            </div>
          </header>
          <main className="flex-1 px-5 py-8 pb-24 md:px-8 md:pb-10">{children}</main>
        </div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-white/10 bg-[#0c0b10]/95 backdrop-blur md:hidden">
        <ul className="grid grid-cols-5">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center gap-1 px-1 py-2.5 text-[10px]",
                    active ? "text-white" : "text-white/40",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
