"use client";

import { DashboardToastProvider } from "@/src/components/dashboard/dashboard-toast-provider";
import { DiscoveryAmbientBackground } from "@/src/components/discovery/discovery-ambient";
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
        <div className={cn(zgBody.className, "sz-app relative min-h-dvh bg-[#050506] text-white")}>
          <DiscoveryAmbientBackground />
          <main className="relative z-10">{children}</main>
        </div>
      </DashboardToastProvider>
    );
  }

  return (
    <DashboardToastProvider>
      <div className={cn(zgBody.className, "sz-app relative h-dvh overflow-hidden bg-[#050506] text-white")}>
        <DiscoveryAmbientBackground />
        <div className="relative z-10 flex h-full p-0 md:p-3">
          <div className="flex h-full min-w-0 flex-1 overflow-hidden md:rounded-[1.75rem] md:border md:border-white/[0.06] md:bg-[#0c0c0e]/85">
            <DiscoverySidebar
              displayName={displayName}
              avatarUrl={avatarUrl}
              completeness={completeness}
              username={username}
            />
            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
              <main
                id="discovery-scroll"
                className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-0 pb-[var(--sz-nav-pad)] pt-[max(1rem,env(safe-area-inset-top))] md:px-10 md:pb-14 md:pt-8"
              >
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
