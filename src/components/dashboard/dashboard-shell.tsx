"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { AppAmbientBackground } from "@/src/components/app/app-ambient-background";
import { cn } from "@/src/lib/utils";
import DashboardSidebar from "@/src/components/dashboard/sidebar";
import DashboardTopBar from "@/src/components/dashboard/dashboard-top-bar";
import { DashboardToastProvider } from "@/src/components/dashboard/dashboard-toast-provider";
import { DashboardTitleProvider } from "@/src/components/dashboard/dashboard-title-context";
import { NotificationProvider } from "@/src/components/dashboard/notifications/notification-provider";
import { DashboardLocaleProvider } from "@/src/components/dashboard/i18n/dashboard-locale-provider";
import { CopilotProvider } from "@/src/components/sharpz/copilot/copilot-context";
import { OnboardingChrome } from "@/src/components/sharpz/onboarding/onboarding-chrome";
import { DashboardThemeProvider } from "@/src/components/dashboard/dashboard-theme-provider";
import {
  type DashboardResolvedCanvas,
  type DashboardResolvedTheme,
  type DashboardThemePreference,
} from "@/src/lib/dashboard/theme";
import type { DashboardLocale } from "@/src/locales/dashboard";

type DashboardShellProps = {
  children: React.ReactNode;
  fontClassName: string;
  restaurantId: string;
  userDisplayName: string;
  userRoleLabel: string;
  userInitials: string;
  userAvatarUrl?: string | null;
  subscriptionPlan: "starter" | "pro" | null;
  subscriptionStatus: "trial" | "active" | "expired";
  initialThemePreference: DashboardThemePreference;
  initialResolvedTheme: DashboardResolvedTheme;
  initialResolvedCanvas: DashboardResolvedCanvas;
  initialLocale: DashboardLocale;
};

export default function DashboardShell({
  children,
  fontClassName,
  restaurantId,
  userDisplayName,
  userRoleLabel,
  userInitials,
  userAvatarUrl,
  subscriptionPlan,
  subscriptionStatus,
  initialThemePreference,
  initialResolvedTheme,
  initialResolvedCanvas,
  initialLocale,
}: DashboardShellProps) {
  return (
    <DashboardThemeProvider
      initialPreference={initialThemePreference}
      initialResolvedTheme={initialResolvedTheme}
      initialResolvedCanvas={initialResolvedCanvas}
    >
      <DashboardLocaleProvider initialLocale={initialLocale}>
        <DashboardShellInner
          fontClassName={fontClassName}
          restaurantId={restaurantId}
          userDisplayName={userDisplayName}
          userRoleLabel={userRoleLabel}
          userInitials={userInitials}
          userAvatarUrl={userAvatarUrl}
          subscriptionPlan={subscriptionPlan}
          subscriptionStatus={subscriptionStatus}
        >
          {children}
        </DashboardShellInner>
      </DashboardLocaleProvider>
    </DashboardThemeProvider>
  );
}

function DashboardShellInner({
  children,
  fontClassName,
  restaurantId,
  userDisplayName,
  userRoleLabel,
  userInitials,
  userAvatarUrl,
  subscriptionPlan,
  subscriptionStatus,
}: Omit<
  DashboardShellProps,
  "initialThemePreference" | "initialResolvedTheme" | "initialResolvedCanvas" | "initialLocale"
>) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const pathname = usePathname();
  const onboardingMode = pathname.startsWith("/dashboard/onboarding");

  const overlayTransition = { type: "tween" as const, duration: 0.25, ease: [0, 0, 0.2, 1] as const };

  if (onboardingMode) {
    return (
      <DashboardToastProvider>
        <DashboardTitleProvider>
          <div
            data-dashboard-theme="dark"
            data-dashboard-canvas="dark"
            className={cn(fontClassName, "relative min-h-screen bg-black font-[family-name:var(--font-zg-body)] text-zg-fg antialiased")}
          >
            <AppAmbientBackground />
            <div className="relative z-10 flex min-h-screen flex-col">
              <OnboardingChrome />
              <main className="flex-1">{children}</main>
            </div>
          </div>
        </DashboardTitleProvider>
      </DashboardToastProvider>
    );
  }

  return (
    <DashboardToastProvider>
      <CopilotProvider>
      <DashboardTitleProvider>
        <NotificationProvider restaurantId={restaurantId}>
        <div
          data-dashboard-theme="dark"
          data-dashboard-canvas="dark"
          className={cn(fontClassName, "relative h-dvh overflow-hidden bg-[#08070b] font-[family-name:var(--font-zg-body)] text-zg-fg antialiased")}
        >
          <AppAmbientBackground />

          <div className="relative flex h-full p-0 md:p-3">
            <div className="relative z-0 flex h-full min-w-0 flex-1 overflow-hidden md:rounded-[1.75rem] md:border md:border-white/[0.06] md:bg-[#0d0c12]/80">
            <DashboardSidebar
              subscriptionPlan={subscriptionPlan}
              subscriptionStatus={subscriptionStatus}
              mobileOpen={mobileNavOpen}
              onNavigate={() => setMobileNavOpen(false)}
              userDisplayName={userDisplayName}
              userRoleLabel={userRoleLabel}
              userInitials={userInitials}
              userAvatarUrl={userAvatarUrl}
            />

            <div className="relative flex h-full min-w-0 flex-1 flex-col">
              <DashboardTopBar
                onOpenMobileNav={() => setMobileNavOpen(true)}
                userDisplayName={userDisplayName}
                userInitials={userInitials}
                userAvatarUrl={userAvatarUrl}
              />
              <main
                className={cn(
                  "min-h-0 flex-1 overflow-y-auto overflow-x-hidden",
                  onboardingMode
                    ? ""
                    : pathname === "/dashboard" || pathname === "/dashboard/"
                      ? "px-5 pb-10 pt-2 md:px-10 md:pb-12"
                      : "px-5 pb-16 pt-6 md:px-10 md:pb-14 md:pt-8",
                )}
              >
                {children}
              </main>
            </div>
            </div>
          </div>

          <AnimatePresence>
            {mobileNavOpen ? (
              <motion.button
                key="dashboard-nav-overlay"
                type="button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={overlayTransition}
                className="zg-dashboard-mobile-overlay pointer-events-auto fixed inset-0 z-40 md:hidden"
                aria-label="Fermer le menu de navigation"
                onClick={() => setMobileNavOpen(false)}
              />
            ) : null}
          </AnimatePresence>
        </div>
        </NotificationProvider>
      </DashboardTitleProvider>
      </CopilotProvider>
    </DashboardToastProvider>
  );
}

