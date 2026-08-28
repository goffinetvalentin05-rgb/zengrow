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
          className={cn(fontClassName, "relative h-dvh overflow-hidden bg-[#050506] font-[family-name:var(--font-zg-body)] text-zg-fg antialiased")}
        >
          <AppAmbientBackground />

          <div className="relative flex h-full md:gap-3 md:p-3">
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

            <div className="relative z-0 flex h-full min-w-0 flex-1 flex-col overflow-hidden md:rounded-[1.5rem] md:border md:border-white/[0.07] md:bg-[#0a0a0c] md:shadow-[0_1px_0_rgba(255,255,255,0.05)_inset,0_18px_40px_-28px_rgba(0,0,0,0.7)]">
              <DashboardTopBar onOpenMobileNav={() => setMobileNavOpen(true)} />
              <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-5 pb-16 pt-6 md:px-8 md:pb-12 md:pt-7">
                {children}
              </main>
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

