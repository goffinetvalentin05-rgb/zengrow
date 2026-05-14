import { Inter } from "next/font/google";
import { headers } from "next/headers";
import DashboardShell from "@/src/components/dashboard/dashboard-shell";
import { requireRestaurantSession } from "@/src/lib/auth";

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

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { restaurant, access, user } = await requireRestaurantSession();
  const headerList = await headers();
  const host = headerList.get("host");
  const protocol = headerList.get("x-forwarded-proto") ?? "http";
  const origin = host ? `${protocol}://${host}` : "";
  const publicLink = origin ? `${origin}/r/${restaurant.slug}` : `/r/${restaurant.slug}`;
  const userInitials = initialsFromUser(user.user_metadata as Record<string, unknown> | undefined, user.email ?? undefined);

  return (
    <DashboardShell
      fontClassName={inter.className}
      publicLink={publicLink}
      restaurantName={restaurant.name}
      userInitials={userInitials}
      subscriptionPlan={access.effectivePlan}
      subscriptionStatus={access.effectiveStatus}
    >
      {children}
    </DashboardShell>
  );
}
