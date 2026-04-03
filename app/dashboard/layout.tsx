import { headers } from "next/headers";
import { Inter } from "next/font/google";
import DashboardSidebar from "@/src/components/dashboard/sidebar";
import { requireRestaurant } from "@/src/lib/auth";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const restaurant = await requireRestaurant();
  const headerList = await headers();
  const host = headerList.get("host");
  const protocol = headerList.get("x-forwarded-proto") ?? "http";
  const origin = host ? `${protocol}://${host}` : "";
  const publicLink = origin ? `${origin}/r/${restaurant.slug}` : `/r/${restaurant.slug}`;

  return (
    <div className={`${inter.className} min-h-screen bg-white`}>
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <DashboardSidebar
          reservationLink={publicLink}
          subscriptionPlan={restaurant.subscription_plan}
          subscriptionStatus={restaurant.subscription_status}
        />
        <main className="min-w-0 flex-1 px-6 py-10 md:px-10 md:py-12 lg:px-14">{children}</main>
      </div>
    </div>
  );
}
