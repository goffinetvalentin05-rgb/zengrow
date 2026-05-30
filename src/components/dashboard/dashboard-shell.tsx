"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AppAmbientBackground } from "@/src/components/app/app-ambient-background";
import { cn } from "@/src/lib/utils";
import DashboardSidebar from "@/src/components/dashboard/sidebar";
import DashboardTopBar from "@/src/components/dashboard/dashboard-top-bar";
import { DashboardToastProvider } from "@/src/components/dashboard/dashboard-toast-provider";
import { DashboardTitleProvider } from "@/src/components/dashboard/dashboard-title-context";
import { NotificationProvider } from "@/src/components/dashboard/notifications/notification-provider";
import {
  DashboardThemeProvider,
  useDashboardTheme,
} from "@/src/components/dashboard/dashboard-theme-provider";
import {
  type DashboardResolvedCanvas,
  type DashboardResolvedTheme,
  type DashboardThemePreference,
} from "@/src/lib/dashboard/theme";

type DashboardShellProps = {
  children: React.ReactNode;
  fontClassName: string;
  restaurantId: string;
  publicLink: string;
  restaurantName: string;
  userDisplayName: string;
  userRoleLabel: string;
  userInitials: string;
  userAvatarUrl?: string | null;
  subscriptionPlan: "starter" | "pro" | null;
  subscriptionStatus: "trial" | "active" | "expired";
  initialThemePreference: DashboardThemePreference;
  initialResolvedTheme: DashboardResolvedTheme;
  initialResolvedCanvas: DashboardResolvedCanvas;
};

export default function DashboardShell({
  children,
  fontClassName,
  restaurantId,
  publicLink,
  restaurantName,
  userDisplayName,
  userRoleLabel,
  userInitials,
  userAvatarUrl,
  subscriptionPlan,
  subscriptionStatus,
  initialThemePreference,
  initialResolvedTheme,
  initialResolvedCanvas,
}: DashboardShellProps) {
  return (
    <DashboardThemeProvider
      initialPreference={initialThemePreference}
      initialResolvedTheme={initialResolvedTheme}
      initialResolvedCanvas={initialResolvedCanvas}
    >
      <DashboardShellInner
        fontClassName={fontClassName}
        restaurantId={restaurantId}
        publicLink={publicLink}
        restaurantName={restaurantName}
        userDisplayName={userDisplayName}
        userRoleLabel={userRoleLabel}
        userInitials={userInitials}
        userAvatarUrl={userAvatarUrl}
        subscriptionPlan={subscriptionPlan}
        subscriptionStatus={subscriptionStatus}
      >
        {children}
      </DashboardShellInner>
    </DashboardThemeProvider>
  );
}

function DashboardShellInner({
  children,
  fontClassName,
  restaurantId,
  publicLink,
  restaurantName,
  userDisplayName,
  userRoleLabel,
  userInitials,
  userAvatarUrl,
  subscriptionPlan,
  subscriptionStatus,
}: Omit<
  DashboardShellProps,
  "initialThemePreference" | "initialResolvedTheme" | "initialResolvedCanvas"
>) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { resolvedTheme, resolvedCanvas } = useDashboardTheme();

  const overlayTransition = { type: "tween" as const, duration: 0.25, ease: [0, 0, 0.2, 1] as const };

  return (
    <DashboardToastProvider>
      <DashboardTitleProvider>
        <NotificationProvider restaurantId={restaurantId}>
        <div
          data-dashboard-theme={resolvedTheme}
          data-dashboard-canvas={resolvedCanvas}
          className={cn(fontClassName, "relative min-h-screen bg-zg-app font-[family-name:var(--font-zg-body)] text-zg-fg antialiased")}
        >
          <AppAmbientBackground />
          <AnimatePresence>
            {mobileNavOpen ? (
              <motion.button
                key="dashboard-nav-overlay"
                type="button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={overlayTransition}
                className={cn(
                  "fixed inset-0 z-40 backdrop-blur-sm md:hidden",
                  resolvedTheme === "light" ? "bg-black/30" : "bg-black/50",
                )}
                aria-label="Fermer le menu de navigation"
                onClick={() => setMobileNavOpen(false)}
              />
            ) : null}
          </AnimatePresence>

          <div className="relative z-10 flex min-h-screen">
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
              <main className="flex-1 overflow-x-hidden px-4 pb-6 pt-8 md:px-8 md:pb-8 md:pt-10">{children}</main>
            </div>
          </div>
        </div>
        </NotificationProvider>
      </DashboardTitleProvider>
    </DashboardToastProvider>
  );
}

