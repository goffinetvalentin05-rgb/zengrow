"use client";

import { useState } from "react";
import { cn } from "@/src/lib/utils";
import DashboardSidebar from "@/src/components/dashboard/sidebar";
import DashboardTopBar from "@/src/components/dashboard/dashboard-top-bar";
import { DashboardToastProvider } from "@/src/components/dashboard/dashboard-toast-provider";
import { DashboardTitleProvider } from "@/src/components/dashboard/dashboard-title-context";

type DashboardShellProps = {
  children: React.ReactNode;
  fontClassName: string;
  publicLink: string;
  restaurantName: string;
  userDisplayName: string;
  userRoleLabel: string;
  userInitials: string;
  userAvatarUrl?: string | null;
  subscriptionPlan: "starter" | "pro" | null;
  subscriptionStatus: "trial" | "active" | "expired";
};

export default function DashboardShell({
  children,
  fontClassName,
  publicLink,
  restaurantName,
  userDisplayName,
  userRoleLabel,
  userInitials,
  userAvatarUrl,
  subscriptionPlan,
  subscriptionStatus,
}: DashboardShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <DashboardToastProvider>
      <DashboardTitleProvider>
        <div className={cn(fontClassName, "min-h-screen bg-zg-app text-zg-fg antialiased")}>
          {mobileNavOpen ? (
            <button
              type="button"
              className="fixed inset-0 z-40 bg-black/55 backdrop-blur-[2px] transition-opacity duration-200 ease-out md:hidden"
              aria-label="Fermer le menu"
              onClick={() => setMobileNavOpen(false)}
            />
          ) : null}

          <div className="flex min-h-screen">
            <DashboardSidebar
              reservationLink={publicLink}
              subscriptionPlan={subscriptionPlan}
              subscriptionStatus={subscriptionStatus}
              mobileOpen={mobileNavOpen}
              onNavigate={() => setMobileNavOpen(false)}
            />

            <div className="flex min-w-0 flex-1 flex-col">
              <DashboardTopBar
                publicLink={publicLink}
                restaurantName={restaurantName}
                userDisplayName={userDisplayName}
                userRoleLabel={userRoleLabel}
                userInitials={userInitials}
                userAvatarUrl={userAvatarUrl}
                onOpenMobileNav={() => setMobileNavOpen(true)}
              />
              <main className="flex-1 overflow-x-hidden px-4 py-6 md:px-8 md:py-8">{children}</main>
            </div>
          </div>
        </div>
      </DashboardTitleProvider>
    </DashboardToastProvider>
  );
}
