"use client";

import { useState } from "react";
import { cn } from "@/src/lib/utils";
import DashboardSidebar from "@/src/components/dashboard/sidebar";
import DashboardTopBar from "@/src/components/dashboard/dashboard-top-bar";
import { DashboardToastProvider } from "@/src/components/dashboard/dashboard-toast-provider";

type DashboardShellProps = {
  children: React.ReactNode;
  fontClassName: string;
  publicLink: string;
  restaurantName: string;
  userInitials: string;
  subscriptionPlan: "starter" | "pro" | null;
  subscriptionStatus: "trial" | "active" | "expired";
};

export default function DashboardShell({
  children,
  fontClassName,
  publicLink,
  restaurantName,
  userInitials,
  subscriptionPlan,
  subscriptionStatus,
}: DashboardShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <DashboardToastProvider>
      <div
        className={cn(fontClassName, "min-h-screen bg-zg-canvas text-zg-fg antialiased")}
      >
        {mobileNavOpen ? (
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/55 backdrop-blur-[2px] transition-opacity duration-150 md:hidden"
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
              userInitials={userInitials}
              onOpenMobileNav={() => setMobileNavOpen(true)}
            />
            <div className="zg-signature-line shrink-0" aria-hidden />
            <main className="flex-1 overflow-x-hidden px-4 py-6 md:px-8 md:py-8">{children}</main>
          </div>
        </div>
      </div>
    </DashboardToastProvider>
  );
}
