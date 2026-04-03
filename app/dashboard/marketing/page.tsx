import MarketingPanel from "@/src/components/dashboard/marketing-panel";
import Link from "next/link";
import { requireRestaurant } from "@/src/lib/auth";
import { canAccessFeature } from "@/src/lib/subscription";
import { createClient } from "@/src/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";

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
  const restaurant = await requireRestaurant();
  if (!canAccessFeature(restaurant.subscription_plan, "marketing", restaurant.subscription_status)) {
    return (
      <section className="space-y-10">
        <header className="border-b border-gray-100 pb-6">
          <h1 className="dashboard-section-heading">Campagnes marketing</h1>
          <p className="dashboard-section-subtitle mt-2 max-w-2xl">
            Réservé au plan Pro — envoyez des messages groupés à vos clients.
          </p>
        </header>
        <Card>
          <CardHeader>
            <CardTitle>Plan Pro</CardTitle>
            <CardDescription>Campagnes e-mail incluses.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/dashboard/billing"
              className="inline-flex min-h-[44px] items-center rounded-lg bg-green-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-800"
            >
              Voir les offres
            </Link>
          </CardContent>
        </Card>
      </section>
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

  return <MarketingPanel campaigns={campaigns} />;
}
