"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bookmark,
  Compass,
  LogOut,
  MoreHorizontal,
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
import { DiscoverySheet } from "@/src/components/discovery/mobile-sheet";
import { useState } from "react";

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
    <aside className="hidden h-full w-[232px] shrink-0 flex-col border-r border-white/[0.06] bg-[#0a0a0c] md:flex">
      <div className="px-5 pb-1 pt-6">
        <Link href={DISCOVERY_ROUTES.explore} className="inline-flex items-center" aria-label="Sharpz">
          <Image src="/sharpz-logo.png" alt="" width={110} height={18} className="h-5 w-auto" />
        </Link>
      </div>

      <nav className="mt-7 flex flex-1 flex-col gap-0.5 px-2.5">
        {NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-3 rounded-2xl px-3 py-2.5 text-[13.5px] transition-colors duration-150",
                active ? "bg-white/[0.07] text-white" : "text-white/42 hover:bg-white/[0.035] hover:text-white",
              )}
            >
              {active ? (
                <span className="absolute left-1.5 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-full bg-white" />
              ) : null}
              <Icon className="h-[15px] w-[15px]" strokeWidth={active ? 2 : 1.6} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {completeness < 80 ? (
        <Link
          href={DISCOVERY_ROUTES.meEdit}
          className="mx-3 mb-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-3 py-3 text-sm text-white/65 transition-colors hover:border-white/14 hover:text-white"
        >
          Complete profile
          <span className="mt-1 block text-xs text-white/32">{completeness}% done</span>
        </Link>
      ) : null}

      <div className="border-t border-white/[0.06] p-2.5">
        <Link
          href={username ? profileHref(username) : DISCOVERY_ROUTES.me}
          className="flex items-center gap-3 rounded-2xl px-2 py-2 transition-colors hover:bg-white/[0.04]"
        >
          <DiscoveryAvatar name={displayName} src={avatarUrl} size="sm" />
          <span className="min-w-0 flex-1 truncate text-[13px] text-white/78">{displayName}</span>
        </Link>
        <button
          type="button"
          onClick={logout}
          className="sz-press mt-0.5 flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-[13px] text-white/35 hover:bg-white/[0.04] hover:text-white"
        >
          <LogOut className="h-3.5 w-3.5" strokeWidth={1.6} />
          Log out
        </button>
      </div>
    </aside>
  );
}

export function DiscoveryBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [moreOpen, setMoreOpen] = useState(false);
  const items = [
    { href: DISCOVERY_ROUTES.explore, label: "Explore", icon: Compass },
    { href: DISCOVERY_ROUTES.search, label: "Search", icon: Search },
    { href: DISCOVERY_ROUTES.following, label: "Following", icon: Users },
    { href: DISCOVERY_ROUTES.me, label: "Profile", icon: UserRound },
  ];
  const moreHrefs = [DISCOVERY_ROUTES.saved, DISCOVERY_ROUTES.analytics, DISCOVERY_ROUTES.settings, DISCOVERY_ROUTES.admin];
  const moreActive = moreHrefs.some((href) => pathname === href || pathname.startsWith(`${href}/`));

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push(DISCOVERY_ROUTES.login);
  }

  return (
    <>
      <nav className="sz-bottom-nav fixed inset-x-0 bottom-0 z-40 md:hidden" aria-label="Primary">
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#050506] via-[#050506]/80 to-transparent" />
        <div className="relative mx-3 mb-[var(--sz-bottom-nav-offset)] flex items-center justify-around rounded-full border border-white/[0.08] bg-[#0c0c0e]/78 px-1 py-1.5 shadow-[0_12px_40px_-18px_rgba(0,0,0,0.9)] backdrop-blur-xl">
          {items.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-h-11 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-full px-1 py-1.5 text-[10px] tracking-wide transition-colors duration-150",
                  active ? "bg-white/[0.08] text-white" : "text-white/38",
                )}
              >
                <Icon className="h-[18px] w-[18px]" strokeWidth={active ? 2 : 1.5} />
                <span className="max-w-full truncate">{item.label}</span>
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={moreOpen}
            className={cn(
              "flex min-h-11 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-full px-1 py-1.5 text-[10px] tracking-wide transition-colors duration-150",
              moreActive ? "bg-white/[0.08] text-white" : "text-white/38",
            )}
          >
            <MoreHorizontal className="h-[18px] w-[18px]" strokeWidth={moreActive ? 2 : 1.5} />
            More
          </button>
        </div>
      </nav>
      <DiscoverySheet open={moreOpen} title="More" onClose={() => setMoreOpen(false)} labelledBy="sz-more-title">
        <nav className="flex flex-col gap-1 pb-2" aria-labelledby="sz-more-title">
          {[
            { href: DISCOVERY_ROUTES.saved, label: "Saved", icon: Bookmark },
            { href: DISCOVERY_ROUTES.analytics, label: "Analytics", icon: BarChart3 },
            { href: DISCOVERY_ROUTES.settings, label: "Settings", icon: Settings },
            { href: DISCOVERY_ROUTES.meEdit, label: "Edit profile", icon: UserRound },
          ].map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMoreOpen(false)}
                className={cn(
                  "flex min-h-12 items-center gap-3 rounded-2xl px-3 text-[15px]",
                  active ? "bg-white/[0.07] text-white" : "text-white/70",
                )}
              >
                <Icon className="h-4 w-4" strokeWidth={1.7} />
                {item.label}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => void logout()}
            className="mt-2 flex min-h-12 items-center gap-3 rounded-2xl px-3 text-[15px] text-white/45"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.7} />
            Log out
          </button>
        </nav>
      </DiscoverySheet>
    </>
  );
}
