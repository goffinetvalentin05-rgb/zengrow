import MarketingPanel from "@/src/components/dashboard/marketing-panel";
import Link from "next/link";
import { requireRestaurant } from "@/src/lib/auth";
import { canAccessFeature } from "@/src/lib/subscription";
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
  if (!canAccessFeature(restaurant.subscription_plan, "marketing", restaurant.subscription_status)) {
    return (
      <section className="space-y-10">
        <header className="space-y-2">
          <p className="dashboard-section-kicker">Marketing</p>
          <h1 className="dashboard-page-title">Campagnes e-mail</h1>
          <p className="dashboard-section-subtitle max-w-2xl">
            Réservé au plan Pro — messages groupés pour vos anciens clients.
          </p>
        </header>
        <div className="space-y-4 border-l-4 border-green-600 pl-5">
          <p className="text-sm text-gray-700">
            Passez à Pro pour envoyer des campagnes (soirée spéciale, nouvelle carte, etc.).
          </p>
          <Link
            href="/dashboard/billing"
            className="inline-flex min-h-11 items-center rounded-lg bg-[var(--primary)] px-5 text-sm font-medium text-white hover:bg-[var(--primary-hover)]"
          >
            Voir les abonnements
          </Link>
        </div>
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
