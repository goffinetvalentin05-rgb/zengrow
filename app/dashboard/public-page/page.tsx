import { headers } from "next/headers";
import { requireRestaurantSession } from "@/src/lib/auth";
import { loadDashboardPublicPage } from "@/src/lib/public-page/load-dashboard-public-page";
import PublicPageDashboard from "@/src/components/dashboard/public-page/public-page-dashboard";

export default async function DashboardPublicPagePage() {
  const { restaurant } = await requireRestaurantSession();
  const headerList = await headers();
  const host = headerList.get("host");
  const protocol = headerList.get("x-forwarded-proto") ?? "http";
  const publicLink = host ? `${protocol}://${host}/r/${restaurant.slug}` : `/r/${restaurant.slug}`;

  const { initial } = await loadDashboardPublicPage(
    restaurant.id,
    {
      id: restaurant.id,
      name: restaurant.name,
      slug: restaurant.slug,
      phone: restaurant.phone,
      email: restaurant.email,
      address: restaurant.address,
    },
    publicLink,
  );

  return <PublicPageDashboard initial={initial} publicLink={publicLink} />;
}
