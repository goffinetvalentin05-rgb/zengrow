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
import { SharpzAssistant } from "@/src/components/sharpz/assistant/sharpz-assistant";
import {
  DashboardThemeProvider,
  useDashboardTheme,
} from "@/src/components/dashboard/dashboard-theme-provider";
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
  const [assistantSignal, setAssistantSignal] = useState(0);
  const pathname = usePathname();
  const onboardingMode = pathname.startsWith("/dashboard/onboarding");
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

          <div className="relative flex min-h-screen">
            <DashboardSidebar
              subscriptionPlan={subscriptionPlan}
              subscriptionStatus={subscriptionStatus}
              mobileOpen={mobileNavOpen}
              onNavigate={() => setMobileNavOpen(false)}
              onboardingMode={onboardingMode}
            />

            <div className="relative z-0 flex min-w-0 flex-1 flex-col">
              <DashboardTopBar
                userDisplayName={userDisplayName}
                userRoleLabel={userRoleLabel}
                userInitials={userInitials}
                userAvatarUrl={userAvatarUrl}
                onOpenMobileNav={() => setMobileNavOpen(true)}
                onOpenAssistant={() => setAssistantSignal((value) => value + 1)}
              />
              <main className="flex-1 overflow-x-hidden px-4 pb-6 pt-8 md:px-8 md:pb-8 md:pt-10">{children}</main>
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
          <SharpzAssistant hidden={onboardingMode} openSignal={assistantSignal} />
        </div>
        </NotificationProvider>
      </DashboardTitleProvider>
    </DashboardToastProvider>
  );
}

