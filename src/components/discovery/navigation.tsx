"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bookmark,
  Compass,
  LogOut,
  Search,
  Settings,
  UserRound,
  Users,
  BarChart3,
  type LucideIcon,
} from "lucide-react";
import { createClient } from "@/src/lib/supabase/client";
import { DISCOVERY_ROUTES, profileHref } from "@/src/lib/discovery/routes";
import { cn } from "@/src/lib/utils";
import { DiscoveryAvatar } from "@/src/components/discovery/avatar";

const NAV: { href: string; label: string; icon: LucideIcon }[] = [
  { href: DISCOVERY_ROUTES.explore, label: "Explore", icon: Compass },
  { href: DISCOVERY_ROUTES.search, label: "Search", icon: Search },
  { href: DISCOVERY_ROUTES.following, label: "Following", icon: Users },
  { href: DISCOVERY_ROUTES.saved, label: "Saved", icon: Bookmark },
  { href: DISCOVERY_ROUTES.me, label: "My profile", icon: UserRound },
  { href: DISCOVERY_ROUTES.analytics, label: "Analytics", icon: BarChart3 },
  { href: DISCOVERY_ROUTES.settings, label: "Settings", icon: Settings },
];

export function DiscoverySidebar({
  displayName,
  avatarUrl,
  completeness,
  username,
}: {
  displayName: string;
  avatarUrl: string | null;
  completeness: number;
  username: string | null;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push(DISCOVERY_ROUTES.login);
  }

  return (
    <aside className="hidden h-full w-[240px] shrink-0 flex-col border-r border-white/[0.06] bg-[#0d0c12] md:flex">
      <div className="px-5 pb-2 pt-6">
        <Link href={DISCOVERY_ROUTES.explore} className="inline-flex items-center" aria-label="Sharpz">
          <Image src="/sharpz-logo.png" alt="" width={110} height={18} className="h-5 w-auto" />
        </Link>
      </div>

      <nav className="mt-6 flex flex-1 flex-col gap-1 px-3">
        {NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition",
                active ? "bg-white/[0.08] text-white" : "text-white/50 hover:bg-white/[0.04] hover:text-white",
              )}
            >
              <Icon className="h-4 w-4" strokeWidth={1.75} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {completeness < 80 ? (
        <Link
          href={DISCOVERY_ROUTES.meEdit}
          className="mx-3 mb-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-3 py-3 text-sm text-white/70 hover:text-white"
        >
          Complete profile
          <span className="mt-1 block text-xs text-white/35">{completeness}% done</span>
        </Link>
      ) : null}

      <div className="border-t border-white/[0.06] p-3">
        <Link href={username ? profileHref(username) : DISCOVERY_ROUTES.me} className="flex items-center gap-3 rounded-2xl px-2 py-2">
          <DiscoveryAvatar name={displayName} src={avatarUrl} size="sm" />
          <span className="min-w-0 flex-1 truncate text-sm text-white/80">{displayName}</span>
        </Link>
        <button
          type="button"
          onClick={logout}
          className="mt-1 flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-sm text-white/40 hover:bg-white/[0.04] hover:text-white"
        >
          <LogOut className="h-4 w-4" strokeWidth={1.75} />
          Log out
        </button>
      </div>
    </aside>
  );
}

export function DiscoveryBottomNav() {
  const pathname = usePathname();
  const items = [
    { href: DISCOVERY_ROUTES.explore, label: "Explore", icon: Compass },
    { href: DISCOVERY_ROUTES.search, label: "Search", icon: Search },
    { href: DISCOVERY_ROUTES.following, label: "Following", icon: Users },
    { href: DISCOVERY_ROUTES.me, label: "Profile", icon: UserRound },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.08] bg-[#0d0c12]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      <div className="grid grid-cols-4">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 py-3 text-[11px]",
                active ? "text-white" : "text-white/40",
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={1.75} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
