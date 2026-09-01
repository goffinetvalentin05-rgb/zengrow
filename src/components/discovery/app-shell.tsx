"use client";

import { AppAmbientBackground } from "@/src/components/app/app-ambient-background";
import { DashboardToastProvider } from "@/src/components/dashboard/dashboard-toast-provider";
import { DiscoveryBottomNav, DiscoverySidebar } from "@/src/components/discovery/navigation";
import { zgBody } from "@/components/zg-landing/fonts";
import { cn } from "@/src/lib/utils";

export function DiscoveryShell({
  children,
  displayName,
  avatarUrl,
  completeness,
  username,
  hideChrome = false,
}: {
  children: React.ReactNode;
  displayName: string;
  avatarUrl: string | null;
  completeness: number;
  username: string | null;
  hideChrome?: boolean;
}) {
  if (hideChrome) {
    return (
      <DashboardToastProvider>
        <div className={cn(zgBody.className, "relative min-h-dvh bg-[#08070b] text-white")}>
          <AppAmbientBackground />
          <main className="relative z-10">{children}</main>
        </div>
      </DashboardToastProvider>
    );
  }

  return (
    <DashboardToastProvider>
      <div className={cn(zgBody.className, "relative h-dvh overflow-hidden bg-[#08070b] text-white")}>
        <AppAmbientBackground />
        <div className="relative z-10 flex h-full p-0 md:p-3">
          <div className="flex h-full min-w-0 flex-1 overflow-hidden md:rounded-[1.75rem] md:border md:border-white/[0.06] md:bg-[#0d0c12]/80">
            <DiscoverySidebar
              displayName={displayName}
              avatarUrl={avatarUrl}
              completeness={completeness}
              username={username}
            />
            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
              <main className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-4 pb-24 pt-6 md:px-10 md:pb-14 md:pt-8">
                {children}
              </main>
            </div>
          </div>
        </div>
        <DiscoveryBottomNav />
      </div>
    </DashboardToastProvider>
  );
}
