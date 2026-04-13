import MarketingPanel from "@/src/components/dashboard/marketing-panel";
import Link from "next/link";
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
  const hasMarketingAccess =
    restaurant.subscription_status === "trial" || restaurant.subscription_plan === "pro";

  if (!hasMarketingAccess) {
    return (
      <section className="relative space-y-6">
        <header className="border-b border-zg-border/80 pb-7">
          <h1 className="dashboard-section-heading">Campagnes marketing</h1>
          <p className="dashboard-section-subtitle mt-2 max-w-2xl">
            Envoyez des messages groupés à vos clients.
          </p>
        </header>

        <div className="relative min-h-[min(70vh,560px)] overflow-hidden rounded-[1.35rem] border border-zg-border-strong bg-gradient-to-b from-zg-surface-elevated/95 to-zg-surface/90 shadow-zg-card">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zg-highlight/55 via-transparent to-transparent opacity-95"
          />
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-5 px-6 py-16 text-center">
            <div className="max-w-md rounded-2xl border border-zg-border-strong/90 bg-zg-surface/95 px-8 py-10 shadow-zg-sidebar backdrop-blur-md">
              <p className="text-base font-semibold leading-relaxed text-zg-fg">
                Cette fonctionnalité est disponible dans le plan Pro (69 CHF/mois)
              </p>
              <Link
                href="/dashboard/billing"
                className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-gradient-to-r from-zg-teal to-zg-mint px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_32px_-14px_rgba(31,122,108,0.82)] transition hover:scale-[1.02] active:scale-[0.99]"
              >
                Passer au plan Pro
              </Link>
            </div>
          </div>
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
