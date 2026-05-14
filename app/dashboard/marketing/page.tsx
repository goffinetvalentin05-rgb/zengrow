import MarketingPanel from "@/src/components/dashboard/marketing-panel";
import Link from "next/link";
import { requireRestaurantSession } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";
import PageHeader from "@/src/components/dashboard/page-header";
import DashboardContent from "@/src/components/dashboard/ui/dashboard-content";
import { buttonClassName } from "@/src/components/ui/button";

type CampaignListItem = {
  id: string;
  name: string;
  subject: string;
  created_at: string;
  sent_at: string | null;
  recipients_count: number;
};

export default async function DashboardMarketingPage() {
  const supabase = await createClient();
  const { restaurant, access } = await requireRestaurantSession();
  const hasMarketingAccess = access.canUseProFeatures;

  if (!hasMarketingAccess) {
    return (
      <DashboardContent>
        <section className="relative space-y-6">
          <PageHeader
            title="Campagnes marketing"
            subtitle="Envoyez des messages groupés à vos clients."
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

  const { data: campaignsData } = await supabase
    .from("email_campaigns")
    .select("id, name, subject, created_at, sent_at")
    .eq("restaurant_id", restaurant.id)
    .order("created_at", { ascending: false });

  const campaignIds = (campaignsData ?? []).map((campaign) => campaign.id);
  let recipientsByCampaign = new Map<string, number>();

  if (campaignIds.length > 0) {
    const { data: recipientsData } = await supabase
      .from("email_campaign_recipients")
      .select("campaign_id")
      .in("campaign_id", campaignIds);

    recipientsByCampaign = (recipientsData ?? []).reduce((acc, row) => {
      acc.set(row.campaign_id, (acc.get(row.campaign_id) ?? 0) + 1);
      return acc;
    }, new Map<string, number>());
  }

  const campaigns: CampaignListItem[] = (campaignsData ?? []).map((campaign) => ({
    id: campaign.id,
    name: campaign.name,
    subject: campaign.subject,
    created_at: campaign.created_at,
    sent_at: campaign.sent_at,
    recipients_count: recipientsByCampaign.get(campaign.id) ?? 0,
  }));

  return (
    <DashboardContent>
      <MarketingPanel campaigns={campaigns} />
    </DashboardContent>
  );
}
