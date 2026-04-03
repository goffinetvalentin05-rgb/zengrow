import { Megaphone } from "lucide-react";
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
        <div className="flex flex-wrap items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--primary-muted)] text-[var(--primary)]">
            <Megaphone size={22} strokeWidth={1.75} />
          </span>
          <div>
            <h1 className="dashboard-page-title">Campagnes marketing</h1>
            <p className="dashboard-section-subtitle mt-2 max-w-2xl">
              Fonction réservée au plan Pro — pour envoyer des messages à vos anciens clients.
            </p>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Passer au plan Pro</CardTitle>
            <CardDescription>Les campagnes e-mail sont incluses dans l&apos;offre Pro.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="dashboard-section-subtitle max-w-lg">
              Créez des messages groupés pour annoncer une soirée, un menu ou une offre — en quelques minutes.
            </p>
            <Link
              href="/dashboard/billing"
              className="mt-6 inline-flex min-h-[44px] items-center rounded-lg bg-[var(--primary)] px-5 py-2.5 text-sm font-medium text-[var(--primary-foreground)] shadow-sm transition duration-200 hover:bg-[var(--primary-hover)] hover:shadow-[0_4px_14px_rgba(26,107,80,0.3)]"
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
