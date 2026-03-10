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
      <section className="space-y-6">
        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>Marketing Campaigns</CardTitle>
            <CardDescription>Disponible uniquement dans le plan Pro.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[var(--foreground)]/75">
              Passez au plan Pro pour créer et envoyer des campagnes e-mail à vos clients.
            </p>
            <Link
              href="/dashboard/billing"
              className="mt-4 inline-flex h-10 items-center rounded-xl bg-gradient-to-r from-[#1F7A6C] to-[#3DBE9F] px-4 text-sm font-semibold text-white transition hover:opacity-95"
            >
              Voir les abonnements
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
