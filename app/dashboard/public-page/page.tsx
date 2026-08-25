import { headers } from "next/headers";
import { requireRestaurantSession } from "@/src/lib/auth";
import PublicPageDesigner from "@/src/components/dashboard/public-page-designer/public-page-designer";
import { loadDesignerState } from "@/src/lib/public-storefront/service";
import { createClient } from "@/src/lib/supabase/server";

export default async function DashboardPublicPagePage() {
  const { restaurant } = await requireRestaurantSession();
  const supabase = await createClient();
  const state = await loadDesignerState(supabase, restaurant.id);
  const headerList = await headers();
  const host = headerList.get("host");
  const protocol = headerList.get("x-forwarded-proto") ?? "http";
  const publicUrl = host ? `${protocol}://${host}/r/${state.identity.slug}` : `/r/${state.identity.slug}`;

  return (
    <PublicPageDesigner
      restaurantId={restaurant.id}
      publicUrl={publicUrl}
      identity={state.identity}
      offers={state.offers}
      initialDraft={state.draft}
      initialPublished={state.published}
      initialPublishedAt={state.publishedAt}
    />
  );
}
