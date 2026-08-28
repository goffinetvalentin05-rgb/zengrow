import { zgBody } from "@/components/zg-landing/fonts";
import { cookies } from "next/headers";
import DashboardShell from "@/src/components/dashboard/dashboard-shell";
import { requireRestaurantSession } from "@/src/lib/auth";
import type { EffectiveAccess } from "@/src/lib/access";
import { getDashboardLocale } from "@/src/locales/dashboard/server";
import {
  DASHBOARD_THEME_COOKIE,
  isDashboardThemePreference,
  resolveDashboardCanvas,
  resolveDashboardTheme,
  type DashboardThemePreference,
} from "@/src/lib/dashboard/theme";

function initialsFromUser(meta: Record<string, unknown> | undefined, email: string | undefined) {
  const name = typeof meta?.full_name === "string" ? meta.full_name.trim() : "";
  if (name) {
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`;
    return name.slice(0, 2);
  }
  if (email) return email.slice(0, 2);
  return "?";
}

function displayNameFromUser(meta: Record<string, unknown> | undefined, email: string | undefined) {
  const name = typeof meta?.full_name === "string" ? meta.full_name.trim() : "";
  if (name) return name;
  if (email) {
    const local = email.split("@")[0]?.trim();
    if (local) return local;
  }
  return "Compte";
}

function roleLabelFromAccess(access: EffectiveAccess) {
  if (access.effectiveStatus === "trial") return "Période d'essai";
  if (access.effectivePlan === "pro") return "Plan Pro";
  return "Plan Starter";
}

function initialDashboardThemeFromCookie(cookieValue: string | undefined) {
  const preference: DashboardThemePreference = isDashboardThemePreference(cookieValue)
    ? cookieValue
    : "dark";
  return {
    preference,
    resolvedTheme: resolveDashboardTheme(preference),
    resolvedCanvas: resolveDashboardCanvas(preference, true),
  };
}

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { restaurant, access, user } = await requireRestaurantSession();
  const meta = user.user_metadata as Record<string, unknown> | undefined;
  const userInitials = initialsFromUser(meta, user.email ?? undefined);
  const userDisplayName = displayNameFromUser(meta, user.email ?? undefined);
  const userRoleLabel = roleLabelFromAccess(access);
  const userAvatarUrl =
    typeof meta?.avatar_url === "string" && meta.avatar_url.length > 0 ? meta.avatar_url : null;

  const cookieStore = await cookies();
  const themeCookie = cookieStore.get(DASHBOARD_THEME_COOKIE)?.value;
  const {
    preference: initialThemePreference,
    resolvedTheme: initialResolvedTheme,
    resolvedCanvas: initialResolvedCanvas,
  } = initialDashboardThemeFromCookie(themeCookie);
  const initialLocale = await getDashboardLocale();

  return (
    <DashboardShell
      initialThemePreference={initialThemePreference}
      initialResolvedTheme={initialResolvedTheme}
      initialResolvedCanvas={initialResolvedCanvas}
      initialLocale={initialLocale}
      fontClassName={zgBody.className}
      restaurantId={restaurant.id}
      userDisplayName={userDisplayName}
      userRoleLabel={userRoleLabel}
      userInitials={userInitials}
      userAvatarUrl={userAvatarUrl}
      subscriptionPlan={access.effectivePlan}
      subscriptionStatus={access.effectiveStatus}
    >
      {children}
    </DashboardShell>
  );
}
