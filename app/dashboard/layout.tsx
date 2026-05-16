import { Inter } from "next/font/google";
import { headers } from "next/headers";
import DashboardShell from "@/src/components/dashboard/dashboard-shell";
import { requireRestaurantSession } from "@/src/lib/auth";
import type { EffectiveAccess } from "@/src/lib/access";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

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

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { restaurant, access, user } = await requireRestaurantSession();
  const headerList = await headers();
  const host = headerList.get("host");
  const protocol = headerList.get("x-forwarded-proto") ?? "http";
  const origin = host ? `${protocol}://${host}` : "";
  const publicLink = origin ? `${origin}/r/${restaurant.slug}` : `/r/${restaurant.slug}`;
  const meta = user.user_metadata as Record<string, unknown> | undefined;
  const userInitials = initialsFromUser(meta, user.email ?? undefined);
  const userDisplayName = displayNameFromUser(meta, user.email ?? undefined);
  const userRoleLabel = roleLabelFromAccess(access);
  const userAvatarUrl =
    typeof meta?.avatar_url === "string" && meta.avatar_url.length > 0 ? meta.avatar_url : null;

  return (
    <DashboardShell
      fontClassName={inter.className}
      restaurantId={restaurant.id}
      publicLink={publicLink}
      restaurantName={restaurant.name}
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
