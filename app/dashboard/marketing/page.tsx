import MarketingPanel from "@/src/components/dashboard/marketing-panel";
import { requireRestaurant } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";

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
