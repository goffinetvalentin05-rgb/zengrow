import Link from "next/link";
import { headers } from "next/headers";
import MarketingPage from "@/src/components/dashboard/marketing/marketing-page";
import { buildRecipientsByCampaignId } from "@/src/components/dashboard/marketing/utils/build-recipients-by-campaign";
import { mapCampaignRows } from "@/src/components/dashboard/marketing/utils/map-campaign-row";
import { computeMarketingKpis } from "@/src/components/dashboard/marketing/utils/marketing-kpis";
import { requireRestaurantSession } from "@/src/lib/auth";
import { getAIUsageLimit } from "@/src/lib/ai/limits";
import { createClient } from "@/src/lib/supabase/server";
import PageHeader from "@/src/components/dashboard/page-header";
import DashboardContent from "@/src/components/dashboard/ui/dashboard-content";
import { buttonClassName } from "@/src/components/ui/button";

export const dynamic = "force-dynamic";

type DashboardMarketingPageProps = {
  searchParams?: Promise<{ campaign?: string }>;
};

export default async function DashboardMarketingPage({ searchParams }: DashboardMarketingPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const initialOpenCampaignId = params?.campaign?.trim() || null;

  const supabase = await createClient();
  const { restaurant, user, access } = await requireRestaurantSession();
  const hasMarketingAccess = access.canUseProFeatures;
  const canUseAI = getAIUsageLimit({
    plan: restaurant.subscription_plan,
    status: restaurant.subscription_status,
    userEmail: user.email,
  }).canAccess;

  if (!hasMarketingAccess) {
    return (
      <DashboardContent>
        <section className="relative space-y-6">
          <PageHeader
            title="Relances IA"
            subtitle="Gérez les messages automatiques envoyés à vos clients inactifs"
          />

          <div className="relative min-h-[min(70vh,560px)] overflow-hidden rounded-2xl border border-zg-border bg-zg-surface transition-all duration-200 ease-out">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(232,93,44,0.08),transparent_55%)]"
            />
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-5 px-6 py-16 text-center">
              <div className="max-w-md rounded-2xl border border-zg-border bg-zg-surface-elevated px-8 py-10">
                <p className="text-base font-semibold leading-relaxed text-zg-fg">
                  Cette fonctionnalité est disponible dans le plan Pro (69 CHF/mois)
                </p>
                <Link
                  href="/dashboard/settings?section=subscription"
                  className={buttonClassName({
                    variant: "primary",
                    size: "md",
                    className: "mt-6 w-full",
                  })}
                >
                  Passer au plan Pro
                </Link>
              </div>
            </div>
          </div>
        </section>
      </DashboardContent>
    );
  }

  const [{ data: campaignsData }, { data: restaurantSettings }] = await Promise.all([
    supabase
      .from("email_campaigns")
      .select("id, name, subject, content, image_url, created_at, sent_at")
      .eq("restaurant_id", restaurant.id)
      .order("created_at", { ascending: false }),
    supabase.from("restaurant_settings").select("logo_url").eq("restaurant_id", restaurant.id).maybeSingle(),
  ]);

  const campaignIds = (campaignsData ?? []).map((campaign) => campaign.id);
  let recipientsData: {
    campaign_id: string;
    email: string;
    opened_at: string | null;
    sent_at: string;
  }[] = [];

  if (campaignIds.length > 0) {
    const { data } = await supabase
      .from("email_campaign_recipients")
      .select("campaign_id, email, opened_at, sent_at")
      .in("campaign_id", campaignIds);

    recipientsData = data ?? [];
  }

  const campaigns = mapCampaignRows(campaignsData ?? [], recipientsData);
  const recipientsByCampaignId = buildRecipientsByCampaignId(recipientsData);
  const recipientSnapshots = recipientsData.map((row) => ({
    campaignId: row.campaign_id,
    email: row.email,
    openedAt: row.opened_at,
  }));
  const kpis = computeMarketingKpis(campaigns, recipientSnapshots);

  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  const protocol = headerList.get("x-forwarded-proto") ?? "https";
  const origin = host ? `${protocol}://${host}` : "";
  const reservationUrl = origin ? `${origin}/r/${restaurant.slug}` : `/r/${restaurant.slug}`;

  const brand = {
    restaurantName: restaurant.name,
    restaurantLogoUrl: restaurantSettings?.logo_url ?? null,
    reservationUrl,
  };

  return (
    <DashboardContent>
      <MarketingPage
        campaigns={campaigns}
        kpis={kpis}
        recipientsByCampaignId={recipientsByCampaignId}
        brand={brand}
        restaurantId={restaurant.id}
        canUseAI={canUseAI}
        initialOpenCampaignId={initialOpenCampaignId}
      />
    </DashboardContent>
  );
}
