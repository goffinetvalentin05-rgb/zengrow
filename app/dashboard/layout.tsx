import { headers } from "next/headers";
import { Inter } from "next/font/google";
import DashboardTopBar from "@/src/components/dashboard/dashboard-top-bar";
import DashboardSidebar from "@/src/components/dashboard/sidebar";
import { requireRestaurant } from "@/src/lib/auth";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
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
    <div className={`${inter.className} min-h-screen bg-slate-50/90`}>
      <div className="mx-auto flex max-w-[1440px] flex-col gap-0 px-4 py-6 md:flex-row md:gap-0 md:px-6 md:py-8">
        <DashboardSidebar
          reservationLink={publicLink}
          subscriptionPlan={restaurant.subscription_plan}
          subscriptionStatus={restaurant.subscription_status}
        />
        <section className="min-w-0 flex-1 md:pl-10 md:pt-0 lg:pl-12">
          <DashboardTopBar publicLink={publicLink} restaurantName={restaurant.name} />
          <div className="pb-12">{children}</div>
        </section>
      </div>
    </div>
  );
}
